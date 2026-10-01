import { Bid } from "../engine/types";

export type LanguageId = "de" | "en" | "nl";

export interface HelpChapter {
  readonly heading: string;
  readonly body: string;
}

/**
 * Alle sprachabhängigen Texte an einem Ort - TS-Pendant zu Bluff/Localization/ILanguage.cs.
 * Jede Sprache implementiert dieses Interface vollständig; eine weitere Sprache hinzuzufügen
 * heißt: neue Implementierung schreiben und in languages.ts registrieren.
 */
export interface Language {
  readonly id: LanguageId;
  /** Name der Sprache in sich selbst, für die Sprachauswahl-Liste (z. B. "Deutsch"). */
  readonly displayName: string;

  // ----- Gebots-/Würfel-Formatierung -----
  formatBid(bid: Bid): string;
  diceCountText(count: number): string;
  searchedLabel(finalBid: Bid): string;
  readonly starFaceLabel: string;

  // ----- Spielereignis-Sätze -----
  roundStarted(roundNumber: number, starterName: string): string;
  bidPlaced(playerName: string, bidText: string): string;
  challengeCalled(challengerName: string, bidderName: string, bidText: string): string;
  roundResolvedBasis(actualCount: number, searchedLabel: string, bidText: string): string;
  bidderLostVerdict(bidderName: string, diceCountText: string): string;
  challengerLostVerdict(challengerName: string, diceCountText: string): string;
  exactMatchVerdict(bidderName: string): string;
  playerEliminated(playerName: string): string;
  gameOverWinner(winnerName: string): string;

  // ----- Sprachauswahl -----
  readonly languageSelectTitle: string;
  readonly languageSelectPrompt: string;
  readonly continueButton: string;

  // ----- Setup -----
  readonly setupTitle: string;
  readonly yourNameLabel: string;
  readonly aiCountLabel: string;
  aiCountItem(count: number): string;
  readonly startButton: string;
  readonly defaultPlayerNameFallback: string;
  readonly changeLanguageButton: string;
  readonly namesEditorLabel: string;
  readonly namesEditorHint: string;

  // ----- Spielbildschirm: Statusbereich (ersetzt F2-F5) -----
  readonly statusSectionLabel: string;
  readonly roundLabel: string;
  readonly currentBidLabel: string;
  currentBidWithTotal(bidText: string, totalDice: number): string;
  noBidYetWithTotal(totalDice: number): string;
  readonly yourDiceLabel: string;
  readonly noDiceLeft: string;
  readonly turnLabel: string;
  readonly gameStartingSoon: string;
  readonly yourTurnValue: string;
  playerTurnValue(playerName: string): string;

  // ----- Spielbildschirm: Steuerung -----
  readonly bidSectionHeading: string;
  readonly anzahlLabel: string;
  readonly augenzahlLabel: string;
  readonly bidButton: string;
  readonly bidButtonDisabledHint: string;
  readonly challengeButton: string;
  readonly challengeButtonDisabledHint: string;
  readonly invalidBid: string;
  readonly yourTurnCanChallenge: string;
  readonly yourTurnFirstBid: string;

  // ----- Spielbildschirm: Spielerliste -----
  readonly playerListLabel: string;
  readonly playerListNameColumn: string;
  readonly playerListDiceColumn: string;
  readonly playerListStatusColumn: string;
  readonly statusEliminated: string;
  readonly statusCurrentTurn: string;
  readonly statusWaiting: string;

  // ----- Spielbildschirm: Verlauf & Spielende -----
  readonly historyLabel: string;
  gameOverLabel(winnerName: string): string;
  readonly eliminatedOptionsLabel: string;
  readonly playAgainButton: string;
  readonly newGameButton: string;

  // ----- Hilfe -----
  readonly helpTitle: string;
  readonly helpButton: string;
  readonly closeButton: string;
  readonly helpChapters: readonly HelpChapter[];
}
