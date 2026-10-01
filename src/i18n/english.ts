import { isSternGebot } from "../engine/types";
import { Language } from "./language";

export const english: Language = {
  id: "en",
  displayName: "English",

  formatBid: (bid) => (isSternGebot(bid) ? `${bid.anzahl} star${bid.anzahl === 1 ? "" : "s"}` : `${bid.anzahl} × ${bid.face}`),
  diceCountText: (count) => (count === 1 ? "one die" : `${count} dice`),
  searchedLabel: (finalBid) => (isSternGebot(finalBid) ? "stars" : `${finalBid.face}s (including stars)`),
  starFaceLabel: "star",

  roundStarted: (roundNumber, starterName) => `Round ${roundNumber}. ${starterName} starts.`,
  bidPlaced: (playerName, bidText) => `${playerName} bids ${bidText}.`,
  challengeCalled: (challengerName, bidderName, bidText) => `${challengerName} challenges ${bidderName}'s bid (${bidText}). Cups up!`,
  roundResolvedBasis: (actualCount, searchedLabel, bidText) => `Revealed: ${actualCount} ${searchedLabel} against a bid of ${bidText}.`,
  bidderLostVerdict: (bidderName, diceCountText) => `${bidderName} bid too high and gives up ${diceCountText}.`,
  challengerLostVerdict: (challengerName, diceCountText) => `The bid was correct. ${challengerName} gives up ${diceCountText}.`,
  exactMatchVerdict: (bidderName) => `Exact match! Everyone except ${bidderName} gives up one die each.`,
  playerEliminated: (playerName) => `${playerName} has no dice left and is out.`,
  gameOverWinner: (winnerName) => `${winnerName} wins the game!`,

  languageSelectPrompt: "Choose the game's language:",

  setupTitle: "Bluff – New Game",
  yourNameLabel: "Your name",
  aiCountLabel: "Number of computer opponents",
  aiCountItem: (count) => (count === 1 ? "1 computer opponent" : `${count} computer opponents`),
  startButton: "Start game",
  // Stored as the actual player name when the name field is left blank - so it needs to be a
  // grammatically safe noun, not the pronoun "You" (which breaks third-person event sentences
  // like "X gives up..."). The status area still shows "Turn: You" regardless - that's wired
  // separately (see yourTurnValue).
  defaultPlayerNameFallback: "Player",
  changeLanguageButton: "Change language",
  namesEditorLabel: "Computer opponent names (one per line)",
  namesEditorHint: "Edit this list any time. Distinct random names are drawn from it when a game starts.",

  statusSectionLabel: "Game status",
  roundLabel: "Round",
  // The row's <dt> already carries the label "Current bid" - the value here (<dd>) no longer
  // repeats it, otherwise screen reader users hear it twice in a row while walking the <dl>
  // ("Current bid" / "Current bid: ...").
  currentBidLabel: "Current bid",
  currentBidWithTotal: (bidText, totalDice) => `${bidText} with ${totalDice} dice in play`,
  noBidYetWithTotal: (totalDice) => `No bid yet. ${totalDice} dice in play in total`,
  yourDiceLabel: "Your dice",
  noDiceLeft: "No dice left",
  turnLabel: "Turn",
  gameStartingSoon: "The game is about to start",
  yourTurnValue: "You",
  playerTurnValue: (playerName) => playerName,

  bidSectionHeading: "Your turn",
  anzahlLabel: "Count",
  augenzahlLabel: "Face",
  bidButton: "Bid",
  bidButtonDisabledHint: "No face is valid for this count. Please change the count.",
  challengeButton: "Challenge (cups up!)",
  challengeButtonDisabledHint: "Only available once a bid has been made.",
  invalidBid: "This bid is not valid.",
  yourTurnCanChallenge: "It's your turn. Raise the bid or challenge.",
  yourTurnFirstBid: "You're starting the round. Please place a bid.",

  playerListLabel: "Player overview",
  playerListNameColumn: "Player",
  playerListDiceColumn: "Dice",
  playerListStatusColumn: "Status",
  statusEliminated: "Eliminated",
  statusCurrentTurn: "Current turn",
  statusWaiting: "Waiting",

  historyLabel: "Game history",
  gameOverLabel: (winnerName) => `Game over – Winner: ${winnerName}`,
  eliminatedOptionsLabel: "You can keep watching, or use the buttons below to play again or start a new game.",
  playAgainButton: "Play again",
  newGameButton: "New game",

  helpTitle: "Instructions",
  helpButton: "Instructions",
  closeButton: "Close",
  helpChapters: [
    {
      heading: "Objective",
      body: "The winner is the last remaining player who still owns at least one die after several rounds.",
    },
    {
      heading: "Setup",
      body:
        "Each player receives 5 dice showing the numbers 1 to 5 plus a star (wild). All players roll " +
        "under cover and only see their own dice. A starting player is determined.",
    },
    {
      heading: "How play works",
      body:
        "The starting player makes a first call (bid) about the total number of a particular face " +
        'showing across all players combined (for example "four 3s"). The next player clockwise ' +
        "takes their turn and has two options: raise the bid or challenge it.",
    },
    {
      heading: "Raising: same count, higher face",
      body:
        'If you keep the same dice count, you must raise the face value. Example: the player before ' +
        'you bids "three 2s" - you can raise to "three 3s", "three 4s", or "three 5s". ' +
        'Switching back to "three 1s" is forbidden - the bid can never go backwards.',
    },
    {
      heading: "Raising: higher count, free choice of face",
      body:
        "If you raise the dice count, you are once again completely free to choose any face. " +
        'Example: the player before you bids "three 2s" - if you raise to at least four dice, you ' +
        'may choose any face from 1 to 5, including "four 1s".',
    },
    {
      heading: "Raising: stars (wild)",
      body:
        "Stars are rarer than individual numbers, so switching to a star bid only needs a smaller " +
        'count: at least half of the most recently bid count, rounded down, but at least 1 (so ' +
        '"eight 3s" becomes at minimum "four stars"). Once a star bid is in place, every further ' +
        "raise must bid a higher star count. Switching from stars back to a number bid is only " +
        "allowed if the new count goes clearly beyond what the current star count would have " +
        "produced - that too may never go backwards.",
    },
    {
      heading: "Challenging",
      body:
        'Instead of raising, you can refuse to believe the player before you and have the cups ' +
        'revealed ("cups up!"). The first bid of a round cannot be challenged.',
    },
    {
      heading: "Revealing and end of round",
      body:
        "When challenged, all dice are revealed and counted. Every star counts as a wild for the " +
        "face being counted - except for a pure star bid, where only actual stars count. If the " +
        "actual count was lower than the bid, the bidder bid too high and loses dice equal to the " +
        "difference between the bid and the actual count. If the actual count was higher, the " +
        "challenger was wrong and loses that many dice instead. If the bid matches exactly, everyone " +
        "except the bidder is out of luck: each of them gives up exactly one die. A player with no " +
        "dice left is eliminated - but stays visible with their status in the player overview.",
    },
    {
      heading: "Using the app & accessibility",
      body:
        "The status area at the top always shows the current bid, your own dice, and whose turn it " +
        "is - readable both visually and by screen readers, with no action needed. Every game event " +
        "is also announced immediately as it happens. The game history below it stays in place and " +
        "can be read through at any time.",
    },
  ],

  soundOnLabel: "Sound: On",
  soundOffLabel: "Sound: Off",
};
