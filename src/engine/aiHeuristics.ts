/** Kleine Wahrscheinlichkeitshelfer, TS-Port von Bluff/Engine/AiHeuristics.cs - keine perfekte
 * Lösung, nur eine Schätzung. */

/** P(X >= targetCount) für X ~ Binomial(unknownDiceCount, matchProbabilityPerDie). */
export function probabilityAtLeast(
  targetCount: number,
  unknownDiceCount: number,
  matchProbabilityPerDie: number,
): number {
  if (targetCount <= 0) {
    return 1.0;
  }

  if (targetCount > unknownDiceCount) {
    return 0.0;
  }

  let sum = 0;
  for (let i = targetCount; i <= unknownDiceCount; i++) {
    sum += binomialProbability(unknownDiceCount, i, matchProbabilityPerDie);
  }

  return sum;
}

function binomialProbability(n: number, k: number, p: number): number {
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0;
  }

  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }

  return result;
}
