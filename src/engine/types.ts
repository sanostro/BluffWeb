// Reiner Datentyp-Kern, TS-Pendant zu Bluff/Models/*.cs. Kein DOM-Zugriff - direkt auf einem
// künftigen Server wiederverwendbar (siehe "Mehrspieler"-Notiz in BluffWeb/CLAUDE.md).

export enum Face {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Stern = 6,
}

export const NUMBER_FACES: readonly Face[] = [Face.One, Face.Two, Face.Three, Face.Four, Face.Five];
export const ALL_FACES: readonly Face[] = [...NUMBER_FACES, Face.Stern];

export interface Bid {
  readonly anzahl: number;
  readonly face: Face;
}

export function isSternGebot(bid: Bid): boolean {
  return bid.face === Face.Stern;
}

export function bidsEqual(a: Bid, b: Bid): boolean {
  return a.anzahl === b.anzahl && a.face === b.face;
}

export type PlayerKind = "human" | "ai";

export interface Player {
  readonly name: string;
  readonly kind: PlayerKind;
  /** Startet mit 5 Platzhaltern (nicht leer), damit isEliminated vor dem ersten Wurf nicht
   * fälschlich zuschlägt - derselbe Bugfix wie in Bluff/Models/Player.cs. */
  dice: Face[];
}

export function isEliminated(player: Player): boolean {
  return player.dice.length === 0;
}

export function countMatching(player: Player, target: Face): number {
  return target === Face.Stern
    ? player.dice.filter((d) => d === Face.Stern).length
    : player.dice.filter((d) => d === target || d === Face.Stern).length;
}

export function createPlayer(name: string, kind: PlayerKind): Player {
  return { name, kind, dice: Array(5).fill(Face.One) };
}

export type RoundOutcomeKind = "BidderLost" | "ChallengerLost" | "ExactMatch";

export interface RoundOutcome {
  readonly finalBid: Bid;
  readonly bidderIndex: number;
  readonly challengerIndex: number;
  readonly reveal: readonly { playerIndex: number; dice: readonly Face[] }[];
  readonly actualCount: number;
  readonly kind: RoundOutcomeKind;
  readonly playersWhoLoseADie: readonly { playerIndex: number; diceLost: number }[];
  readonly nextStarterIndex: number;
}

export type GameEvent =
  | { type: "RoundStarted"; roundNumber: number; starterIndex: number }
  | { type: "BidPlaced"; playerIndex: number; bid: Bid }
  | { type: "ChallengeCalled"; challengerIndex: number; bidderIndex: number; bid: Bid }
  | { type: "RoundResolved"; outcome: RoundOutcome }
  | { type: "PlayerEliminated"; playerIndex: number }
  | { type: "GameOver"; winnerIndex: number };

export interface PlayerView {
  readonly name: string;
  readonly kind: PlayerKind;
  readonly diceCount: number;
  readonly isEliminated: boolean;
}

export interface GameStateView {
  readonly players: readonly PlayerView[];
  readonly roundNumber: number;
  readonly currentPlayerIndex: number;
  readonly totalDiceInPlay: number;
}

export interface PlayerActionContext {
  readonly state: GameStateView;
  readonly currentBid: Bid | null;
  readonly canChallenge: boolean;
  readonly ownDice: readonly Face[];
}

export interface PlayerAction {
  readonly isChallenge: boolean;
  readonly bid: Bid | null;
}

export interface IPlayerAgent {
  getAction(context: PlayerActionContext): Promise<PlayerAction>;
}
