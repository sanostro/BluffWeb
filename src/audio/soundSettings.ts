const STORAGE_KEY = "bluff.soundEnabled";

/** Fehlt der Schlüssel (noch nie umgeschaltet), ist Sound wie bisher standardmäßig an. */
export function isSoundEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== "false";
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}
