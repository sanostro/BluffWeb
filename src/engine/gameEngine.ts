import { isLegalRaise } from "./bidRules";
import {
  Bid,
  countMatching,
  Face,
  GameEvent,
  GameStateView,
  IPlayerAgent,
  isEliminated,
  Player,
  PlayerActionContext,
  PlayerView,
  RoundOutcome,
} from "./types";

const ANNOUNCEMENT_PAUSE_MS = 3000;
const ROUND_TRANSITION_PAUSE_MS = 6000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Orchestriert den kompletten Spielablauf - TS-Port von Bluff/Engine/GameEngine.cs. Kennt keine
 * UI/Sounds/Sprache; wer will, abonniert sich über onEvent (Sprachausgabe/Sound/Historie).
 */
export class GameEngine {
  private readonly players: Player[];
  private readonly agents: IPlayerAgent[];
  private roundNumber = 0;
  private readonly listeners: ((event: GameEvent) => void)[] = [];

  constructor(players: Player[], agents: IPlayerAgent[]) {
    if (players.length !== agents.length) {
      throw new Error("Jeder Spieler braucht genau einen Agenten.");
    }
    this.players = players;
    this.agents = agents;
  }

  onEvent(listener: (event: GameEvent) => void): void {
    this.listeners.push(listener);
  }

  async run(): Promise<void> {
    let starterIndex = Math.floor(Math.random() * this.players.length);

    while (this.countRemaining() > 1) {
      this.roundNumber++;
      this.rollAllDice();
      this.raise({ type: "RoundStarted", roundNumber: this.roundNumber, starterIndex });
      await delay(ANNOUNCEMENT_PAUSE_MS);

      const outcome = await this.runRound(starterIndex);
      this.raise({ type: "RoundResolved", outcome });
      await delay(ROUND_TRANSITION_PAUSE_MS);

      await this.applyLosses(outcome);
      starterIndex = this.advanceToNonEliminated(outcome.nextStarterIndex);
    }

    const winnerIndex = this.players.findIndex((p) => !isEliminated(p));
    this.raise({ type: "GameOver", winnerIndex });
  }

  private async runRound(starterIndex: number): Promise<RoundOutcome> {
    let currentBid: Bid | null = null;
    let bidderIndex = starterIndex;
    let currentIndex = starterIndex;

    for (;;) {
      const context = this.buildContext(currentIndex, currentBid);
      const action = await this.agents[currentIndex].getAction(context);

      if (action.isChallenge && currentBid !== null) {
        this.raise({ type: "ChallengeCalled", challengerIndex: currentIndex, bidderIndex, bid: currentBid });
        await delay(ANNOUNCEMENT_PAUSE_MS);
        return this.resolveChallenge(currentBid, bidderIndex, currentIndex);
      }

      const bid = action.bid;
      if (bid === null) {
        throw new Error("Agent hat weder geboten noch angezweifelt.");
      }
      if (!isLegalRaise(currentBid, bid)) {
        throw new Error(`Illegales Gebot (${bid.anzahl}/${bid.face}) von Agent für Spieler ${currentIndex}.`);
      }

      currentBid = bid;
      bidderIndex = currentIndex;
      this.raise({ type: "BidPlaced", playerIndex: currentIndex, bid });
      currentIndex = this.nextActiveIndex(currentIndex);

      // AI-Züge sind durch AiPlayerAgents eigene Bedenkzeit (~3s) bereits von der Gebots-Ansage
      // getrennt; HumanPlayerAgent.getAction löst onActionRequested dagegen sofort aus, ohne
      // jede Pause. Ohne diese Pause überschreibt die "Sie sind am Zug"-Ansage die gerade erst
      // gesetzte "X bietet..."-Ansage in derselben Live-Region, bevor sie vorgelesen werden kann.
      if (this.players[currentIndex].kind === "human") {
        await delay(ANNOUNCEMENT_PAUSE_MS);
      }
    }
  }

  private resolveChallenge(bid: Bid, bidderIndex: number, challengerIndex: number): RoundOutcome {
    const reveal = this.players
      .map((p, i) => ({ playerIndex: i, dice: [...p.dice] }))
      .filter((t) => !isEliminated(this.players[t.playerIndex]));

    const actualCount = this.players
      .filter((p) => !isEliminated(p))
      .reduce((sum, p) => sum + countMatching(p, bid.face), 0);

    let kind: RoundOutcome["kind"];
    let losers: { playerIndex: number; diceLost: number }[];
    let nextStarterIndex: number;

    // Bei Über-/Unterbieten richtet sich der Verlust nach der Differenz zwischen Gebot und
    // tatsächlicher Anzahl (gedeckelt durch die noch vorhandenen Würfel) - nur beim exakten
    // Treffer ist es laut Anleitung ausdrücklich immer genau ein Würfel pro Spieler.
    if (actualCount < bid.anzahl) {
      kind = "BidderLost";
      const diff = bid.anzahl - actualCount;
      losers = [{ playerIndex: bidderIndex, diceLost: Math.min(diff, this.players[bidderIndex].dice.length) }];
      nextStarterIndex = bidderIndex;
    } else if (actualCount > bid.anzahl) {
      kind = "ChallengerLost";
      const diff = actualCount - bid.anzahl;
      losers = [
        { playerIndex: challengerIndex, diceLost: Math.min(diff, this.players[challengerIndex].dice.length) },
      ];
      nextStarterIndex = challengerIndex;
    } else {
      kind = "ExactMatch";
      losers = this.players
        .map((_, i) => i)
        .filter((i) => !isEliminated(this.players[i]) && i !== bidderIndex)
        .map((i) => ({ playerIndex: i, diceLost: 1 }));
      nextStarterIndex = challengerIndex;
    }

    return { finalBid: bid, bidderIndex, challengerIndex, reveal, actualCount, kind, playersWhoLoseADie: losers, nextStarterIndex };
  }

  private async applyLosses(outcome: RoundOutcome): Promise<void> {
    for (const { playerIndex, diceLost } of outcome.playersWhoLoseADie) {
      const player = this.players[playerIndex];
      const actualLoss = Math.min(diceLost, player.dice.length);
      player.dice.splice(player.dice.length - actualLoss, actualLoss);

      if (isEliminated(player)) {
        this.raise({ type: "PlayerEliminated", playerIndex });
        await delay(ANNOUNCEMENT_PAUSE_MS);
      }
    }
  }

  private buildContext(playerIndex: number, currentBid: Bid | null): PlayerActionContext {
    const views: PlayerView[] = this.players.map((p) => ({
      name: p.name,
      kind: p.kind,
      diceCount: p.dice.length,
      isEliminated: isEliminated(p),
    }));

    const state: GameStateView = {
      players: views,
      roundNumber: this.roundNumber,
      currentPlayerIndex: playerIndex,
      totalDiceInPlay: this.players.filter((p) => !isEliminated(p)).reduce((sum, p) => sum + p.dice.length, 0),
    };

    return {
      state,
      currentBid,
      canChallenge: currentBid !== null,
      ownDice: [...this.players[playerIndex].dice],
    };
  }

  private rollAllDice(): void {
    // Wichtig: die Würfelanzahl bleibt über Runden hinweg erhalten (nur durch Verluste
    // reduziert) - hier wird lediglich neu gewürfelt, nicht auf 5 zurückgesetzt.
    for (const player of this.players) {
      if (isEliminated(player)) {
        continue;
      }
      const count = player.dice.length;
      player.dice = Array.from({ length: count }, () => (Math.floor(Math.random() * 6) + 1) as Face);
    }
  }

  private countRemaining(): number {
    return this.players.filter((p) => !isEliminated(p)).length;
  }

  private nextActiveIndex(index: number): number {
    let next = index;
    do {
      next = (next + 1) % this.players.length;
    } while (isEliminated(this.players[next]));
    return next;
  }

  private advanceToNonEliminated(index: number): number {
    return isEliminated(this.players[index]) ? this.nextActiveIndex(index) : index;
  }

  private raise(event: GameEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
