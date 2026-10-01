import { isSternGebot } from "../engine/types";
import { Language } from "./language";

export const german: Language = {
  id: "de",
  displayName: "Deutsch",

  formatBid: (bid) => (isSternGebot(bid) ? `${bid.anzahl} Stern${bid.anzahl === 1 ? "" : "e"}` : `${bid.anzahl} × ${bid.face}`),
  diceCountText: (count) => (count === 1 ? "einen Würfel" : `${count} Würfel`),
  searchedLabel: (finalBid) => (isSternGebot(finalBid) ? "Sterne" : `${finalBid.face}er (inklusive Sterne)`),
  starFaceLabel: "Stern",

  roundStarted: (roundNumber, starterName) => `Runde ${roundNumber}. ${starterName} beginnt.`,
  bidPlaced: (playerName, bidText) => `${playerName} bietet ${bidText}.`,
  challengeCalled: (challengerName, bidderName, bidText) =>
    `${challengerName} zweifelt das Gebot von ${bidderName} an (${bidText}). Becher hoch!`,
  roundResolvedBasis: (actualCount, searchedLabel, bidText) =>
    `Aufgedeckt: ${actualCount} ${searchedLabel} bei einem Gebot von ${bidText}.`,
  bidderLostVerdict: (bidderName, diceCountText) => `${bidderName} hat zu hoch geboten und gibt ${diceCountText} ab.`,
  challengerLostVerdict: (challengerName, diceCountText) => `Das Gebot war richtig. ${challengerName} gibt ${diceCountText} ab.`,
  exactMatchVerdict: (bidderName) => `Genau getroffen! Alle außer ${bidderName} geben je einen Würfel ab.`,
  playerEliminated: (playerName) => `${playerName} hat keine Würfel mehr und scheidet aus.`,
  gameOverWinner: (winnerName) => `${winnerName} gewinnt das Spiel!`,

  languageSelectTitle: "Bluff – Sprache wählen",
  languageSelectPrompt: "Wählen Sie die Sprache des Spiels:",
  continueButton: "Weiter",

  setupTitle: "Bluff – Neues Spiel",
  yourNameLabel: "Ihr Name",
  aiCountLabel: "Anzahl Computergegner",
  aiCountItem: (count) => `${count} Computergegner`,
  startButton: "Spiel starten",
  // Wird als tatsächlicher Spielername gespeichert, wenn das Namensfeld leer bleibt - deshalb ein
  // grammatikalisch sicheres Substantiv statt "Sie", das in Ereignis-Sätzen ("X hat geboten...")
  // als Pronomen nicht funktionieren würde. Der Statusbereich zeigt trotzdem "Sie sind am Zug" -
  // das ist unabhängig davon fest verdrahtet (siehe yourTurnValue).
  defaultPlayerNameFallback: "Spieler",
  changeLanguageButton: "Sprache ändern",
  namesEditorLabel: "KI-Namen (ein Name pro Zeile)",
  namesEditorHint: "Diese Liste können Sie jederzeit bearbeiten. Beim Spielstart werden daraus zufällige, unterschiedliche Namen gezogen.",

  statusSectionLabel: "Spielstatus",
  roundLabel: "Runde",
  // Die Zeile davor (<dt>) trägt bereits das Label "Aktuelles Gebot" - der Wert hier (<dd>)
  // wiederholt es deshalb nicht mehr, sonst hören Screenreader-Nutzer es beim Durchgehen der
  // <dl> zweimal hintereinander ("Aktuelles Gebot" / "Aktuelles Gebot: ...").
  currentBidLabel: "Aktuelles Gebot",
  currentBidWithTotal: (bidText, totalDice) => `${bidText} bei ${totalDice} Würfeln im Spiel`,
  noBidYetWithTotal: (totalDice) => `Kein Gebot. Insgesamt ${totalDice} Würfel im Spiel`,
  yourDiceLabel: "Ihre Würfel",
  noDiceLeft: "Keine Würfel mehr",
  turnLabel: "Am Zug",
  gameStartingSoon: "Das Spiel beginnt gleich",
  yourTurnValue: "Sie",
  playerTurnValue: (playerName) => playerName,

  bidSectionHeading: "Ihr Zug",
  anzahlLabel: "Anzahl",
  augenzahlLabel: "Augenzahl",
  bidButton: "Bieten",
  bidButtonDisabledHint: "Bei dieser Anzahl ist keine Augenzahl gültig. Bitte Anzahl ändern.",
  challengeButton: "Anzweifeln (Becher hoch!)",
  challengeButtonDisabledHint: "Nur verfügbar, wenn bereits ein Gebot vorliegt.",
  invalidBid: "Dieses Gebot ist nicht gültig.",
  yourTurnCanChallenge: "Sie sind am Zug. Erhöhen Sie das Gebot oder zweifeln Sie an.",
  yourTurnFirstBid: "Sie beginnen die Runde. Bitte geben Sie ein Gebot ab.",

  playerListLabel: "Spielerübersicht",
  playerListNameColumn: "Spieler",
  playerListDiceColumn: "Würfel",
  playerListStatusColumn: "Status",
  statusEliminated: "Ausgeschieden",
  statusCurrentTurn: "Am Zug",
  statusWaiting: "Wartet",

  historyLabel: "Spielverlauf",
  gameOverLabel: (winnerName) => `Spiel beendet – Sieger: ${winnerName}`,
  eliminatedOptionsLabel:
    "Sie können weiter zusehen oder direkt über die Schaltflächen unten erneut spielen oder ein neues Spiel beginnen.",
  playAgainButton: "Erneut spielen",
  newGameButton: "Neues Spiel",

  helpTitle: "Spielanleitung",
  helpButton: "Anleitung",
  closeButton: "Schließen",
  helpChapters: [
    {
      heading: "Ziel des Spiels",
      body: "Sieger ist, wer nach mehreren Runden als einziger Spieler noch mindestens einen eigenen Würfel besitzt.",
    },
    {
      heading: "Vorbereitung",
      body:
        "Jeder Mitspieler erhält 5 Würfel mit den Zahlen 1 bis 5 sowie einem Stern (Joker). " +
        "Alle Spieler würfeln verdeckt und sehen nur ihre eigenen Würfel. Ein Startspieler wird bestimmt.",
    },
    {
      heading: "Spielablauf",
      body:
        "Der Startspieler macht eine erste Ansage (Gebot) über die Anzahl bestimmter Augen, die " +
        'insgesamt bei allen Spielern zusammen vorhanden sind (zum Beispiel "4 Dreien"). Der ' +
        "nächste Spieler im Uhrzeigersinn ist am Zug und hat zwei Optionen: das Gebot erhöhen " +
        "oder anzweifeln.",
    },
    {
      heading: "Erhöhen: gleiche Anzahl, höhere Augenzahl",
      body:
        "Bleibst du bei derselben Anzahl an Würfeln, musst du die Augenzahl erhöhen. " +
        'Beispiel: Dein Vordermann bietet "3 Zweien" - du kannst auf "3 Dreien", "3 Vieren" ' +
        'oder "3 Fünfen" erhöhen. Ein Wechsel zurück auf "3 Einsen" ist verboten, das Gebot ' +
        "darf nicht rückwärts gehen.",
    },
    {
      heading: "Erhöhen: höhere Anzahl, freie Augenzahl",
      body:
        "Erhöhst du die Anzahl der Würfel, bist du wieder völlig frei in der Wahl der Augenzahl. " +
        'Beispiel: Dein Vordermann bietet "3 Zweien" - erhöhst du auf mindestens 4 Würfel, ' +
        'darfst du jede beliebige Augenzahl von 1 bis 5 wählen, auch "4 Einsen".',
    },
    {
      heading: "Erhöhen: Sterne (Joker)",
      body:
        "Sterne sind seltener als einzelne Zahlen, deshalb genügt beim Wechsel auf eine " +
        "Stern-Wette eine kleinere Anzahl: mindestens die Hälfte der zuletzt gebotenen Anzahl, " +
        'abgerundet, mindestens aber 1 (aus "8 Dreien" werden so minimal "4 Sterne"). ' +
        "Ist bereits auf Sterne gewettet, muss jede weitere Erhöhung eine höhere Sternanzahl " +
        "bieten. Der Wechsel von Sternen zurück auf eine Zahl ist nur möglich, wenn die neue " +
        "Anzahl deutlich über das hinausgeht, was die aktuelle Sternanzahl ergeben hätte - auch " +
        "das darf nicht rückwärts gehen.",
    },
    {
      heading: "Anzweifeln",
      body:
        "Statt zu erhöhen kannst du dem Vordermann nicht glauben und die Becher aufdecken lassen " +
        '("Becher hoch!"). Das erste Gebot einer Runde kann nicht angezweifelt werden.',
    },
    {
      heading: "Das Aufdecken und Rundenende",
      body:
        "Beim Anzweifeln werden alle Würfel aufgedeckt und gezählt. Jeder Stern zählt dabei als " +
        "Joker für die gesuchte Zahl mit - außer bei einer reinen Stern-Wette, dort zählen nur " +
        "echte Sterne. War die tatsächliche Anzahl niedriger als das Gebot, hat der Ansager zu " +
        "hoch geboten und verliert Würfel in Höhe der Differenz zwischen Gebot und tatsächlicher " +
        "Anzahl. War die tatsächliche Anzahl höher, hat sich der Zweifler geirrt und verliert " +
        "seinerseits Würfel in dieser Höhe. Trifft das Gebot genau zu, haben alle außer dem " +
        "Ansager Pech: jeder von ihnen gibt genau einen Würfel ab. Wer keine Würfel mehr hat, " +
        "scheidet aus - bleibt aber mit seinem Status in der Spielerübersicht sichtbar.",
    },
    {
      heading: "Bedienung & Barrierefreiheit",
      body:
        "Der Statusbereich oben zeigt jederzeit das aktuelle Gebot, die eigenen Würfel und wer " +
        "am Zug ist - lesbar für Sehende wie für Screenreader-Nutzer, ohne dass dafür eine " +
        "Aktion nötig ist. Jedes Spielereignis wird zusätzlich sofort angesagt, sobald es " +
        "eintritt. Der Spielverlauf darunter bleibt vollständig erhalten und ist jederzeit " +
        "durchlesbar.",
    },
  ],
};
