import { ALL_FACES, Bid, Face, isSternGebot, NUMBER_FACES } from "./types";

/**
 * Regel-Kern, TS-Port von Bluff/Engine/BidRules.cs: gleiche Anzahl erfordert strikt höhere
 * Augenzahl; höhere Anzahl erlaubt freie Augenwahl; Wechsel auf Sterne braucht mindestens
 * floor(Anzahl/2) (min. 1) Sterne; auf Sternen weiter erhöhen braucht strikt mehr Sterne;
 * zurück von Sternen auf eine Zahl braucht floor(neueAnzahl/2) > sternAnzahl (strikt über den
 * Punkt hinaus, der auf diese Sternanzahl hätte reduzieren können).
 */
export function isLegalRaise(current: Bid | null, candidate: Bid): boolean {
  if (candidate.anzahl < 1) {
    return false;
  }

  if (current === null) {
    return true;
  }

  const currentIsStern = isSternGebot(current);
  const candidateIsStern = isSternGebot(candidate);

  if (!currentIsStern && !candidateIsStern) {
    if (candidate.anzahl === current.anzahl) {
      return candidate.face > current.face;
    }
    return candidate.anzahl > current.anzahl;
  }

  if (!currentIsStern && candidateIsStern) {
    const minSterne = Math.max(1, Math.floor(current.anzahl / 2));
    return candidate.anzahl >= minSterne;
  }

  if (currentIsStern && candidateIsStern) {
    return candidate.anzahl > current.anzahl;
  }

  // Stern -> Zahl
  return Math.floor(candidate.anzahl / 2) > current.anzahl;
}

/**
 * Minimal-legale nächste Gebote (Port von BidRules.GetSuggestedRaises) - Grundlage sowohl für
 * die KI-Bewertung als auch für die Live-Filterung der Augenzahl-Auswahl in der UI.
 */
export function getSuggestedRaises(current: Bid | null, maxAnzahl: number): Bid[] {
  const result: Bid[] = [];

  if (current === null) {
    result.push({ anzahl: 1, face: Face.One });
    return result;
  }

  if (!isSternGebot(current)) {
    for (let f = current.face + 1; f <= Face.Five; f++) {
      result.push({ anzahl: current.anzahl, face: f as Face });
    }

    if (current.anzahl + 1 <= maxAnzahl) {
      for (const f of NUMBER_FACES) {
        result.push({ anzahl: current.anzahl + 1, face: f });
      }
    }

    const minSterne = Math.max(1, Math.floor(current.anzahl / 2));
    if (minSterne <= maxAnzahl) {
      result.push({ anzahl: minSterne, face: Face.Stern });
    }
  } else {
    if (current.anzahl + 1 <= maxAnzahl) {
      result.push({ anzahl: current.anzahl + 1, face: Face.Stern });
    }

    const minZahl = current.anzahl * 2 + 2;
    if (minZahl <= maxAnzahl) {
      for (const f of NUMBER_FACES) {
        result.push({ anzahl: minZahl, face: f });
      }
    }
  }

  return result;
}

/** Alle Augenzahlen (inkl. Stern), die für die gegebene Anzahl aktuell legal wären. */
export function legalFacesForAnzahl(current: Bid | null, anzahl: number): Face[] {
  return ALL_FACES.filter((face) => isLegalRaise(current, { anzahl, face }));
}
