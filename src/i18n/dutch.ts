import { isSternGebot } from "../engine/types";
import { Language } from "./language";

export const dutch: Language = {
  id: "nl",
  displayName: "Nederlands",

  formatBid: (bid) => (isSternGebot(bid) ? `${bid.anzahl} ster${bid.anzahl === 1 ? "" : "ren"}` : `${bid.anzahl} × ${bid.face}`),
  diceCountText: (count) => (count === 1 ? "één dobbelsteen" : `${count} dobbelstenen`),
  searchedLabel: (finalBid) => (isSternGebot(finalBid) ? "sterren" : `${finalBid.face}'en (inclusief sterren)`),
  starFaceLabel: "Ster",

  roundStarted: (roundNumber, starterName) => `Ronde ${roundNumber}. ${starterName} begint.`,
  bidPlaced: (playerName, bidText) => `${playerName} biedt ${bidText}.`,
  challengeCalled: (challengerName, bidderName, bidText) =>
    `${challengerName} twijfelt aan het bod van ${bidderName} (${bidText}). Bekers omhoog!`,
  roundResolvedBasis: (actualCount, searchedLabel, bidText) => `Onthuld: ${actualCount} ${searchedLabel} bij een bod van ${bidText}.`,
  bidderLostVerdict: (bidderName, diceCountText) => `${bidderName} heeft te hoog geboden en levert ${diceCountText} in.`,
  challengerLostVerdict: (challengerName, diceCountText) => `Het bod klopte. ${challengerName} levert ${diceCountText} in.`,
  exactMatchVerdict: (bidderName) => `Precies geraden! Iedereen behalve ${bidderName} levert één dobbelsteen in.`,
  playerEliminated: (playerName) => `${playerName} heeft geen dobbelstenen meer en valt af.`,
  gameOverWinner: (winnerName) => `${winnerName} wint het spel!`,

  languageSelectPrompt: "Kies de taal van het spel:",

  setupTitle: "Bluff – Nieuw spel",
  yourNameLabel: "Uw naam",
  aiCountLabel: "Aantal computertegenstanders",
  aiCountItem: (count) => (count === 1 ? "1 computertegenstander" : `${count} computertegenstanders`),
  startButton: "Spel starten",
  // Wordt als daadwerkelijke spelernaam opgeslagen als het naamveld leeg blijft - daarom een
  // grammaticaal veilig zelfstandig naamwoord in plaats van het voornaamwoord "U" (dat in
  // gebeurtenis-zinnen als "X heeft geboden..." niet zou werken). Het statusgebied toont
  // niettemin "Aan de beurt: U" - dat is daar los van vastgelegd (zie yourTurnValue).
  defaultPlayerNameFallback: "Speler",
  changeLanguageButton: "Taal wijzigen",
  namesEditorLabel: "Namen computertegenstanders (één naam per regel)",
  namesEditorHint: "Deze lijst kunt u altijd bewerken. Bij het starten van een spel worden hieruit willekeurige, verschillende namen gekozen.",

  statusSectionLabel: "Spelstatus",
  roundLabel: "Ronde",
  // De <dt> ervoor toont al het label "Huidig bod" - de waarde hier (<dd>) herhaalt dat niet
  // meer, anders horen screenreader-gebruikers het bij het doorlopen van de <dl> twee keer
  // achter elkaar ("Huidig bod" / "Huidig bod: ...").
  currentBidLabel: "Huidig bod",
  currentBidWithTotal: (bidText, totalDice) => `${bidText} bij ${totalDice} dobbelstenen in het spel`,
  noBidYetWithTotal: (totalDice) => `Nog geen bod. In totaal ${totalDice} dobbelstenen in het spel`,
  yourDiceLabel: "Uw dobbelstenen",
  noDiceLeft: "Geen dobbelstenen meer",
  turnLabel: "Aan de beurt",
  gameStartingSoon: "Het spel begint zo",
  yourTurnValue: "U",
  playerTurnValue: (playerName) => playerName,

  bidSectionHeading: "Uw beurt",
  anzahlLabel: "Aantal",
  augenzahlLabel: "Ogen",
  bidButton: "Bieden",
  bidButtonDisabledHint: "Bij dit aantal is geen enkele ogenwaarde geldig. Wijzig het aantal.",
  challengeButton: "Twijfelen (bekers omhoog!)",
  challengeButtonDisabledHint: "Alleen beschikbaar als er al een bod is uitgebracht.",
  invalidBid: "Dit bod is niet geldig.",
  yourTurnCanChallenge: "U bent aan de beurt. Verhoog het bod of twijfel eraan.",
  yourTurnFirstBid: "U begint de ronde. Breng een bod uit.",

  playerListLabel: "Spelersoverzicht",
  playerListNameColumn: "Speler",
  playerListDiceColumn: "Dobbelstenen",
  playerListStatusColumn: "Status",
  statusEliminated: "Afgevallen",
  statusCurrentTurn: "Aan de beurt",
  statusWaiting: "Wacht",

  historyLabel: "Spelverloop",
  gameOverLabel: (winnerName) => `Spel afgelopen – Winnaar: ${winnerName}`,
  eliminatedOptionsLabel:
    "U kunt blijven toekijken, of gebruik de knoppen hieronder om opnieuw te spelen of een nieuw spel te beginnen.",
  playAgainButton: "Opnieuw spelen",
  newGameButton: "Nieuw spel",

  helpTitle: "Spelregels",
  helpButton: "Spelregels",
  closeButton: "Sluiten",
  helpChapters: [
    {
      heading: "Doel van het spel",
      body: "Winnaar is wie na meerdere rondes als enige speler nog minstens één eigen dobbelsteen heeft.",
    },
    {
      heading: "Voorbereiding",
      body:
        "Elke speler krijgt 5 dobbelstenen met de getallen 1 tot en met 5 plus een ster (joker). Alle " +
        "spelers gooien verdekt en zien alleen hun eigen dobbelstenen. Er wordt een startspeler bepaald.",
    },
    {
      heading: "Spelverloop",
      body:
        "De startspeler doet een eerste aankondiging (bod) over het totale aantal van een bepaald " +
        'ogental dat bij alle spelers samen aanwezig is (bijvoorbeeld "vier drieën"). De volgende ' +
        "speler met de klok mee is aan de beurt en heeft twee opties: het bod verhogen of twijfelen.",
    },
    {
      heading: "Verhogen: zelfde aantal, hoger ogental",
      body:
        'Blijf je bij hetzelfde aantal dobbelstenen, dan moet je het ogental verhogen. Voorbeeld: je ' +
        'voorganger biedt "drie tweeën" - je kunt verhogen naar "drie drieën", "drie vieren" of ' +
        '"drie vijven". Terugschakelen naar "drie enen" is verboden, het bod mag nooit achteruitgaan.',
    },
    {
      heading: "Verhogen: hoger aantal, vrije keuze van ogental",
      body:
        "Verhoog je het aantal dobbelstenen, dan ben je weer volledig vrij in de keuze van het " +
        'ogental. Voorbeeld: je voorganger biedt "drie tweeën" - verhoog je naar minstens vier ' +
        'dobbelstenen, dan mag je elk ogental van 1 tot 5 kiezen, ook "vier enen".',
    },
    {
      heading: "Verhogen: sterren (joker)",
      body:
        "Sterren zijn zeldzamer dan losse getallen, daarom volstaat bij het overschakelen naar een " +
        'sterrenbod een kleiner aantal: minstens de helft van het laatst geboden aantal, naar beneden ' +
        'afgerond, met een minimum van 1 (van "acht drieën" wordt zo minimaal "vier sterren"). Is ' +
        "er al op sterren geboden, dan moet elke volgende verhoging een hoger aantal sterren bieden. " +
        "Terugschakelen van sterren naar een getal kan alleen als het nieuwe aantal duidelijk meer is " +
        "dan wat het huidige aantal sterren zou hebben opgeleverd - ook dat mag nooit achteruitgaan.",
    },
    {
      heading: "Twijfelen",
      body:
        "In plaats van te verhogen kun je je voorganger niet geloven en de bekers laten onthullen " +
        '("bekers omhoog!"). Het eerste bod van een ronde kan niet worden betwijfeld.',
    },
    {
      heading: "Onthullen en einde van de ronde",
      body:
        "Bij twijfelen worden alle dobbelstenen onthuld en geteld. Elke ster telt daarbij mee als " +
        "joker voor het gezochte getal - behalve bij een zuiver sterrenbod, daar tellen alleen echte " +
        "sterren mee. Was het werkelijke aantal lager dan het bod, dan heeft de bieder te hoog " +
        "geboden en levert hij dobbelstenen in gelijk aan het verschil tussen bod en werkelijk " +
        "aantal. Was het werkelijke aantal hoger, dan zat de twijfelaar ernaast en levert die op zijn " +
        "beurt evenveel dobbelstenen in. Klopt het bod precies, dan hebben alle spelers behalve de " +
        "bieder pech: ieder van hen levert precies één dobbelsteen in. Wie geen dobbelstenen meer " +
        "heeft, valt af - maar blijft met zijn status zichtbaar in het spelersoverzicht.",
    },
    {
      heading: "Bediening & toegankelijkheid",
      body:
        "Het statusgebied bovenaan toont altijd het huidige bod, uw eigen dobbelstenen en wie er " +
        "aan de beurt is - leesbaar voor zowel ziende als screenreader-gebruikers, zonder dat daar " +
        "een handeling voor nodig is. Elke spelgebeurtenis wordt bovendien direct aangekondigd op " +
        "het moment dat ze plaatsvindt. Het spelverloop daaronder blijft volledig bewaard en is te " +
        "allen tijde na te lezen.",
    },
  ],

  soundOnLabel: "Geluid: Aan",
  soundOffLabel: "Geluid: Uit",
};
