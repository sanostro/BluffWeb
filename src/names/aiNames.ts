/**
 * KI-Namenspool - TS-Pendant zu Bluff/Names/AiNameProvider.cs + names.txt. Eine PWA hat keine
 * editierbare Datei neben einer .exe; stattdessen ein Default-Pool als Startwert plus eine per
 * localStorage jederzeit editierbare Liste (siehe setupScreen.ts für den Editor).
 */
const STORAGE_KEY = "bluff.aiNames";

// Übernommen aus der tatsächlich von Bluff.exe genutzten Kopie (bin/Debug/net8.0-windows/names.txt),
// nicht aus der zuvor veralteten Quelldatei Bluff/names.txt (die beiden waren auseinandergelaufen,
// weil CopyToOutputDirectory=PreserveNewest eine direkt im Ausgabeordner bearbeitete Datei nicht
// mit einer älteren Quelle überschreibt - jetzt wieder synchron gehalten, siehe Bluff/names.txt).
const DEFAULT_NAMES = [
  "Klara Fall",
  "Axel Schweiß",
  "Anna Bolika",
  "Amin Gips",
  "Christian Hals",
  "Reiner Zufall",
  "Ernst Haft",
  "Peter Silie",
  "Erkan Alles",
  "Andi Arbeit",
  "Mario Ana",
  "Wilma Bumsen",
  "Karl Auer",
  "Ali Baba",
  "Johannes Behre",
  "Mira Bellen",
  "Tim Buktu",
  "Bernhard Iner",
  "Rosa Schlüpfer",
  "Johannes Kraut",
  "Karl Gon",
  "Isolde Baden",
  "Kai Mauer",
  "Anna Nas",
  "Mario Nette",
  "Marta Pfahl",
  "Alexander Platz",
  "Marcus Platz",
  "Frank Reich",
  "Anne Theke",
  "Anders Rum",
  "Andreas Kreuz",
  "Andreas Spalte",
  "Anne Mone",
  "Justin Case",
  "Justin Time",
  "Chris Cross",
  "Candy Crush",
  "Marry Christmas",
  "Ulla La",
  "Andi Langeleine",
  "Ada Hammas",
  "Volker Racho",
  "Netta Spruch",
  "Lasse Schlafen",
  "Fatma Heim",
  "Willy show",
  "Tai Fun",
  "Sue Nami",
  "Bill Brook",
  "Bill Stedt",
  "Jana Türlich",
  "Carla Mari",
  "Rudi Mentär",
  "Roman Schreiber",
  "Ellen Bogen",
  "Dieter Mine",
  "Vita Mine",
  "Marc Aroni",
  "Micha Nismus",
  "Micha Troniker",
  "Heidi Kanns",
  "Heide Witzka",
  "Theo Retisch",
  "Sam Mitery",
  "Karl Lender",
  "Tom Bola",
  "Sara Jevo",
  "Kali Fat",
  "Mara Kuja",
  "Kai Neahnung",
  "Bill Ding",
  "Yuka Palme",
  "Donna Wetter",
  "Mara Donna",
  "Käte Ring",
  "Kate Terring",
  "Volker Putt",
  "Anette Halbestunde",
  "Tai Ming",
  "Ben Ding",
  "Anett Shovida",
  "Clay Zwerschmitt-Brill",
  "Amanda Hugginkiss",
  "Anita Bath",
  "Maya Normousbud",
  "Al Coholic",
  "Tess T Culls",
  "Clair Werk",
  "Clair Grube",
];

export function getNamePoolText(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ?? DEFAULT_NAMES.join("\n");
}

export function setNamePoolText(text: string): void {
  localStorage.setItem(STORAGE_KEY, text);
}

function parsePool(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    ),
  );
}

/** Liefert `count` zufällige, untereinander verschiedene Namen; reicht der Pool nicht, werden
 * die restlichen Plätze mit "Computer N" aufgefüllt statt Namen zu wiederholen. */
export function getRandomAiNames(count: number): string[] {
  const pool = parsePool(getNamePoolText());
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(i < shuffled.length ? shuffled[i] : `Computer ${i + 1}`);
  }
  return result;
}
