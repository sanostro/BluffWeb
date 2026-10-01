import { isLegalRaise, legalFacesForAnzahl } from "../engine/bidRules";
import { AiPlayerAgent } from "../engine/aiPlayerAgent";
import { GameEngine } from "../engine/gameEngine";
import { HumanPlayerAgent } from "../engine/humanPlayerAgent";
import { Bid, createPlayer, Face, GameEvent, IPlayerAgent, isEliminated, Player } from "../engine/types";
import { Language } from "../i18n/language";
import { getRandomAiNames } from "../names/aiNames";
import { soundManager } from "../audio/soundManager";
import { clear, h } from "./dom";
import { GameSettings } from "./setupScreen";
import { createSoundToggleButton } from "./soundToggle";

const HUMAN_INDEX = 0;

export type GameEndChoice = "playAgain" | "newGame";

export function renderGameScreen(
  container: HTMLElement,
  lang: Language,
  settings: GameSettings,
  previousAiNames: string[] | null,
  onEnd: (choice: GameEndChoice, aiNames: string[]) => void,
  onOpenHelp: () => void,
): void {
  clear(container);

  const aiNames =
    previousAiNames && previousAiNames.length === settings.aiCount ? previousAiNames : getRandomAiNames(settings.aiCount);

  const players: Player[] = [createPlayer(settings.playerName, "human"), ...aiNames.map((name) => createPlayer(name, "ai"))];
  const playerNames = players.map((p) => p.name);

  const humanAgent = new HumanPlayerAgent();
  const agents: IPlayerAgent[] = [humanAgent, ...aiNames.map(() => new AiPlayerAgent())];
  const engine = new GameEngine(players, agents);

  let currentBid: Bid | null = null;
  let currentPlayerIndex = -1;
  let legalFaces: Face[] = [];
  // Wird gesetzt, sobald der Nutzer über "Erneut spielen"/"Neues Spiel" vorzeitig aussteigt
  // (siehe Zuschauermodus unten) - verhindert, dass die dann verwaiste, aber im Hintergrund
  // weiterlaufende Engine (KI-Duelle zu Ende spielend) noch Sound/Ansagen/Verlauf auf diesem
  // längst ersetzten Bildschirm auslöst.
  let disposed = false;

  // ----- DOM-Gerüst -----

  const roundHeading = h("h1", {}, [lang.setupTitle]);
  const helpButton = h("button", { type: "button", class: "secondary" }, [lang.helpButton]);
  helpButton.addEventListener("click", onOpenHelp);
  const soundToggleButton = createSoundToggleButton(lang);

  const statusBid = h("dd", { id: "status-bid" }, [""]);
  const statusDice = h("dd", { id: "status-dice" }, [lang.noDiceLeft]);
  const statusTurn = h("dd", { id: "status-turn" }, [lang.gameStartingSoon]);
  const statusArea = h("section", { "aria-labelledby": "status-heading", class: "status-area" }, [
    h("h2", { id: "status-heading" }, [lang.statusSectionLabel]),
    h("dl", {}, [
      h("dt", {}, [lang.roundLabel]),
      h("dd", { id: "status-round" }, ["1"]),
      h("dt", {}, [lang.currentBidLabel]),
      statusBid,
      h("dt", {}, [lang.yourDiceLabel]),
      statusDice,
      h("dt", {}, [lang.turnLabel]),
      statusTurn,
    ]),
  ]);
  const statusRound = statusArea.querySelector("#status-round") as HTMLElement;

  const livePolite = h("div", { "aria-live": "polite", class: "sr-only live-region" });
  const liveAssertive = h("div", { "aria-live": "assertive", class: "sr-only live-region" });

  const playerTableBody = h("tbody");
  const playerSection = h("section", { "aria-labelledby": "player-heading" }, [
    h("h2", { id: "player-heading" }, [lang.playerListLabel]),
    h("table", {}, [
      h("thead", {}, [
        h("tr", {}, [h("th", {}, [lang.playerListNameColumn]), h("th", {}, [lang.playerListDiceColumn]), h("th", {}, [lang.playerListStatusColumn])]),
      ]),
      playerTableBody,
    ]),
  ]);

  const anzahlSelect = h("select", { id: "anzahl" }) as HTMLSelectElement;
  const augenzahlSelect = h("select", { id: "augenzahl" }) as HTMLSelectElement;
  const bidButton = h("button", { type: "submit", class: "primary" }, [lang.bidButton]);
  const challengeButton = h("button", { type: "button" }, [lang.challengeButton]);
  const bidHint = h("p", { class: "hint", role: "status" }, [""]);

  // Anzahl und Augenzahl bewusst als zwei nebeneinanderliegende <select>-Drehfelder in einem
  // gemeinsamen <form> statt eines <input type="number"> - so lassen sich beide Felder (etwa mit
  // VoiceOver-Wischgesten) schnell nacheinander anspringen und einstellen, das Formular fasst sie
  // als zusammengehörige Einheit; das Bieten-Bestätigen erfolgt per Formular-Submit.
  const bidForm = h("form", { class: "field-row" }, [
    h("div", { class: "field" }, [h("label", { for: "anzahl" }, [lang.anzahlLabel]), anzahlSelect]),
    h("div", { class: "field" }, [h("label", { for: "augenzahl" }, [lang.augenzahlLabel]), augenzahlSelect]),
    bidButton,
  ]);

  const bidControls = h("section", { "aria-labelledby": "bid-heading", class: "bid-controls" }, [
    h("h2", { id: "bid-heading" }, [lang.bidSectionHeading]),
    bidForm,
    h("div", { class: "actions" }, [challengeButton]),
    bidHint,
  ]);
  bidControls.hidden = true;

  const gameOverLabelEl = h("h2", { id: "game-over-heading", class: "game-over-label" }, [""]);
  const playAgainButton = h("button", { type: "button", class: "primary" }, [lang.playAgainButton]);
  const newGameButton = h("button", { type: "button" }, [lang.newGameButton]);
  const gameOverControls = h("section", { "aria-labelledby": "game-over-heading", class: "game-over-controls" }, [
    gameOverLabelEl,
    h("div", { class: "actions" }, [playAgainButton, newGameButton]),
  ]);
  gameOverControls.hidden = true;

  const historyList = h("ol", { id: "history-list" });
  const historySection = h("section", { "aria-labelledby": "history-heading" }, [h("h2", { id: "history-heading" }, [lang.historyLabel]), historyList]);

  container.append(
    h("main", { class: "screen game-screen" }, [
      h("div", { class: "game-header" }, [roundHeading, h("div", { class: "header-actions" }, [soundToggleButton, helpButton])]),
      statusArea,
      livePolite,
      liveAssertive,
      playerSection,
      bidControls,
      gameOverControls,
      historySection,
    ]),
  );

  // ----- Verhalten -----

  function speak(message: string, assertive = false): void {
    (assertive ? liveAssertive : livePolite).textContent = message;
  }

  function addHistory(message: string): void {
    historyList.append(h("li", {}, [message]));
    historyList.scrollTop = historyList.scrollHeight;
  }

  function totalDiceInPlay(): number {
    return players.filter((p) => !isEliminated(p)).reduce((sum, p) => sum + p.dice.length, 0);
  }

  function refreshStatusArea(): void {
    statusDice.textContent = players[HUMAN_INDEX].dice.length === 0 ? lang.noDiceLeft : players[HUMAN_INDEX].dice.map(faceLabel).join(", ");
    statusBid.textContent =
      currentBid === null ? lang.noBidYetWithTotal(totalDiceInPlay()) : lang.currentBidWithTotal(lang.formatBid(currentBid), totalDiceInPlay());
    statusTurn.textContent =
      currentPlayerIndex < 0 ? lang.gameStartingSoon : currentPlayerIndex === HUMAN_INDEX ? lang.yourTurnValue : lang.playerTurnValue(playerNames[currentPlayerIndex]);
  }

  function faceLabel(face: Face): string {
    return face === Face.Stern ? lang.starFaceLabel : String(face);
  }

  function refreshPlayerList(): void {
    clear(playerTableBody);
    players.forEach((player, i) => {
      const status = isEliminated(player) ? lang.statusEliminated : i === currentPlayerIndex ? lang.statusCurrentTurn : lang.statusWaiting;
      playerTableBody.append(h("tr", {}, [h("td", {}, [player.name]), h("td", {}, [String(player.dice.length)]), h("td", {}, [status])]));
    });
  }

  function nextActiveIndexLocal(fromIndex: number): number {
    let next = fromIndex;
    do {
      next = (next + 1) % players.length;
    } while (isEliminated(players[next]));
    return next;
  }

  function populateAnzahlOptions(): void {
    // Gleiche Obergrenze wie die KI-Gebotslogik (AiPlayerAgent.getAction: totalDiceInPlay * 2) -
    // großzügig genug für jedes plausible Gebot, aber kein unbegrenztes Freitextfeld mehr.
    const maxAnzahl = Math.max(totalDiceInPlay() * 2, (currentBid?.anzahl ?? 0) + 1);
    const previousValue = anzahlSelect.value;
    clear(anzahlSelect);
    for (let n = 1; n <= maxAnzahl; n++) {
      anzahlSelect.append(h("option", { value: String(n) }, [String(n)]));
    }
    if (previousValue) {
      anzahlSelect.value = previousValue;
    }
  }

  function refreshAugenzahlOptions(): void {
    const anzahl = Number(anzahlSelect.value) || 1;
    legalFaces = legalFacesForAnzahl(currentBid, anzahl);
    clear(augenzahlSelect);
    for (const face of legalFaces) {
      augenzahlSelect.append(h("option", { value: String(face) }, [faceLabel(face)]));
    }
    bidButton.disabled = legalFaces.length === 0;
    bidHint.textContent = legalFaces.length === 0 ? lang.bidButtonDisabledHint : "";
  }

  anzahlSelect.addEventListener("change", refreshAugenzahlOptions);

  bidForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedFace = legalFaces[augenzahlSelect.selectedIndex];
    if (selectedFace === undefined) {
      return;
    }
    const bid: Bid = { anzahl: Number(anzahlSelect.value) || 1, face: selectedFace };
    if (!isLegalRaise(currentBid, bid)) {
      speak(lang.invalidBid);
      return;
    }
    disableBidControls();
    humanAgent.submitAction({ isChallenge: false, bid });
  });

  challengeButton.addEventListener("click", () => {
    disableBidControls();
    humanAgent.submitAction({ isChallenge: true, bid: null });
  });

  function disableBidControls(): void {
    bidControls.hidden = true;
  }

  humanAgent.onActionRequested = (context) => {
    bidControls.hidden = false;
    populateAnzahlOptions();
    anzahlSelect.value = String(context.currentBid?.anzahl ?? 1);
    challengeButton.disabled = !context.canChallenge;
    refreshAugenzahlOptions();
    // Bewusst kein .focus() hier: der Fokus soll dort bleiben, wo er gerade ist, sonst
    // unterbricht der Fokuswechsel die Live-Ansage des letzten Gebots (siehe speak() unten).
    speak(context.canChallenge ? lang.yourTurnCanChallenge : lang.yourTurnFirstBid);
  };

  engine.onEvent((event: GameEvent) => {
    if (disposed) {
      return;
    }
    const message = formatEvent(event);
    if (message) {
      addHistory(message);
    }

    switch (event.type) {
      case "RoundStarted": {
        currentBid = null;
        currentPlayerIndex = event.starterIndex;
        statusRound.textContent = String(event.roundNumber);
        roundHeading.textContent = lang.roundLabel + " " + event.roundNumber;
        const rollers = players.map((p, i) => ({ seatIndex: i, diceCount: p.dice.length })).filter((_, i) => !isEliminated(players[i]));
        soundManager.playDiceRollForAll(rollers, players.length);
        speak(message);
        refreshStatusArea();
        refreshPlayerList();
        break;
      }
      case "BidPlaced": {
        currentBid = event.bid;
        currentPlayerIndex = nextActiveIndexLocal(event.playerIndex);
        speak(message);
        refreshStatusArea();
        refreshPlayerList();
        break;
      }
      case "ChallengeCalled": {
        soundManager.playBuzzer();
        speak(message, true);
        break;
      }
      case "RoundResolved": {
        if (event.outcome.kind === "ExactMatch") {
          soundManager.playEqual();
          soundManager.playDiceRemovedAll();
        } else {
          for (const { playerIndex, diceLost } of event.outcome.playersWhoLoseADie) {
            for (let i = 0; i < diceLost; i++) {
              soundManager.playDieRemoved(playerIndex, players.length);
            }
          }
        }
        speak(message, true);
        refreshPlayerList();
        break;
      }
      case "PlayerEliminated": {
        if (event.playerIndex === HUMAN_INDEX) {
          soundManager.playLost();
          // Der Zuschauermodus bleibt bestehen (die restlichen KI-Spieler spielen weiter), aber
          // die Spielende-Optionen müssen nicht bis zum tatsächlichen Spielende warten - sonst
          // sitzt man als ausgeschiedener Mensch ohne jede Handlungsmöglichkeit fest.
          gameOverLabelEl.textContent = lang.eliminatedOptionsLabel;
          gameOverControls.hidden = false;
          speak(`${message} ${lang.eliminatedOptionsLabel}`);
        } else {
          speak(message);
        }
        refreshPlayerList();
        break;
      }
      case "GameOver": {
        if (event.winnerIndex === HUMAN_INDEX) {
          soundManager.playWinner();
        }
        speak(message, true);
        showGameOver(event.winnerIndex);
        break;
      }
    }
  });

  function formatEvent(event: GameEvent): string {
    switch (event.type) {
      case "RoundStarted":
        return lang.roundStarted(event.roundNumber, playerNames[event.starterIndex]);
      case "BidPlaced":
        return lang.bidPlaced(playerNames[event.playerIndex], lang.formatBid(event.bid));
      case "ChallengeCalled":
        return lang.challengeCalled(playerNames[event.challengerIndex], playerNames[event.bidderIndex], lang.formatBid(event.bid));
      case "RoundResolved": {
        const outcome = event.outcome;
        const searched = lang.searchedLabel(outcome.finalBid);
        const basis = lang.roundResolvedBasis(outcome.actualCount, searched, lang.formatBid(outcome.finalBid));
        const bidderName = playerNames[outcome.bidderIndex];
        const challengerName = playerNames[outcome.challengerIndex];
        const verdict =
          outcome.kind === "BidderLost"
            ? lang.bidderLostVerdict(bidderName, lang.diceCountText(outcome.playersWhoLoseADie[0].diceLost))
            : outcome.kind === "ChallengerLost"
              ? lang.challengerLostVerdict(challengerName, lang.diceCountText(outcome.playersWhoLoseADie[0].diceLost))
              : lang.exactMatchVerdict(bidderName);
        return `${basis} ${verdict}`;
      }
      case "PlayerEliminated":
        return lang.playerEliminated(playerNames[event.playerIndex]);
      case "GameOver":
        return lang.gameOverWinner(playerNames[event.winnerIndex]);
    }
  }

  function showGameOver(winnerIndex: number): void {
    bidControls.hidden = true;
    gameOverLabelEl.textContent = lang.gameOverLabel(playerNames[winnerIndex]);
    gameOverControls.hidden = false;
    playAgainButton.focus();
  }

  playAgainButton.addEventListener("click", () => {
    disposed = true;
    onEnd("playAgain", aiNames);
  });
  newGameButton.addEventListener("click", () => {
    disposed = true;
    onEnd("newGame", aiNames);
  });

  refreshPlayerList();
  refreshStatusArea();
  void engine.run();
}
