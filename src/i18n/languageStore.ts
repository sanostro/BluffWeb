import { dutch } from "./dutch";
import { english } from "./english";
import { german } from "./german";
import { Language, LanguageId } from "./language";

const STORAGE_KEY = "bluff.language";

export const allLanguages: readonly Language[] = [german, english, dutch];

export function getStoredLanguage(): Language | null {
  const id = localStorage.getItem(STORAGE_KEY) as LanguageId | null;
  return allLanguages.find((l) => l.id === id) ?? null;
}

export function setStoredLanguage(language: Language): void {
  localStorage.setItem(STORAGE_KEY, language.id);
}
