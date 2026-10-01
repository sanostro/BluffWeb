import { getSuggestedRaises } from "./bidRules";
import { probabilityAtLeast } from "./aiHeuristics";
import { Bid, Face, IPlayerAgent, isSternGebot, NUMBER_FACES, PlayerAction, PlayerActionContext } from "./types";

const RAISE_CONFIDENCE_THRESHOLD = 0.5;
// ~3s Bedenkzeit mit leichtem Jitter - Ansagen zwischen aufeinanderfolgenden KI-Zügen brauchen
// genug Abstand, damit ein Screenreader ein Gebot fertig vorlesen kann, bevor das nächste kommt
// (derselbe Wert wie Bluff/Engine/AiPlayerAgent.cs ThinkDelayRange, nach demselben Bugfix).
const THINK_DELAY_MIN_MS = 2700;
const THINK_DELAY_MAX_MS = 3300;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

/** Einfache, nachvollziehbare Heuristik statt eines perfekten Solvers - TS-Port von
 * Bluff/Engine/AiPlayerAgent.cs. */
export class AiPlayerAgent implements IPlayerAgent {
  private readonly challengeThreshold = 0.35 + (Math.random() - 0.5) * 0.1;

  async getAction(context: PlayerActionContext): Promise<PlayerAction> {
    await delay(randomInt(THINK_DELAY_MIN_MS, THINK_DELAY_MAX_MS));

    if (context.currentBid === null) {
      return { isChallenge: false, bid: firstBid(context.ownDice) };
    }

    const unknownDiceCount = context.state.totalDiceInPlay - context.ownDice.length;
    const probCurrentHolds = estimateProbability(context.currentBid, context.ownDice, unknownDiceCount);

    if (context.canChallenge && probCurrentHolds < this.challengeThreshold) {
      return { isChallenge: true, bid: null };
    }

    const maxAnzahl = context.state.totalDiceInPlay * 2;
    const best = pickRaise(context.currentBid, context.ownDice, unknownDiceCount, maxAnzahl);

    if (best !== null) {
      return { isChallenge: false, bid: best };
    }

    if (context.canChallenge) {
      return { isChallenge: true, bid: null };
    }

    // Erstes Gebot der Runde kann nicht angezweifelt werden - Notlösung: kleinste legale Erhöhung.
    const fallback = getSuggestedRaises(context.currentBid, maxAnzahl)[0];
    return { isChallenge: false, bid: fallback };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Nimmt nicht stur die kleinste legale Erhöhung (das ergäbe bei gleicher Anzahl immer stures
// Hochzählen der Augenzahl 2,3,4,5...) - stattdessen zufällige Auswahl unter allen plausiblen
// (Wahrscheinlichkeit >= Schwelle) Erhöhungen, gewichtet nach deren geschätzter
// Wahrscheinlichkeit. Da die Wahrscheinlichkeit eigene Würfel einbezieht, werden Gebote, die zu
// den tatsächlich gehaltenen Würfeln passen, im Schnitt bevorzugt - aber nicht immer.
function pickRaise(
  currentBid: Bid,
  ownDice: readonly Face[],
  unknownDiceCount: number,
  maxAnzahl: number,
): Bid | null {
  const viable = getSuggestedRaises(currentBid, maxAnzahl)
    .map((bid) => ({ bid, probability: estimateProbability(bid, ownDice, unknownDiceCount) }))
    .filter((candidate) => candidate.probability >= RAISE_CONFIDENCE_THRESHOLD);

  if (viable.length === 0) {
    return null;
  }

  const totalWeight = viable.reduce((sum, c) => sum + c.probability, 0);
  const roll = Math.random() * totalWeight;
  let cumulative = 0;
  for (const candidate of viable) {
    cumulative += candidate.probability;
    if (roll <= cumulative) {
      return candidate.bid;
    }
  }

  return viable[viable.length - 1].bid; // Rundungssicherheit
}

function estimateProbability(bid: Bid, ownDice: readonly Face[], unknownDiceCount: number): number {
  const ownMatches = isSternGebot(bid)
    ? ownDice.filter((d) => d === Face.Stern).length
    : ownDice.filter((d) => d === bid.face || d === Face.Stern).length;

  const neededFromUnknown = bid.anzahl - ownMatches;
  const matchProbabilityPerDie = isSternGebot(bid) ? 1 / 6 : 2 / 6;

  return probabilityAtLeast(neededFromUnknown, unknownDiceCount, matchProbabilityPerDie);
}

function firstBid(ownDice: readonly Face[]): Bid {
  let bestFace = Face.One;
  let bestCount = -1;

  for (const f of NUMBER_FACES) {
    const count = ownDice.filter((d) => d === f || d === Face.Stern).length;
    if (count > bestCount) {
      bestCount = count;
      bestFace = f;
    }
  }

  return { anzahl: Math.max(1, bestCount + 1), face: bestFace };
}
