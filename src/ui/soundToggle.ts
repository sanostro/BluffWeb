import { audioEngine } from "../audio/audioEngine";
import { isSoundEnabled, setSoundEnabled } from "../audio/soundSettings";
import { Language } from "../i18n/language";
import { h } from "./dom";

/**
 * Umschaltbarer Sound-An/Aus-Button - als echter Toggle-Button (aria-pressed), nicht als
 * Checkbox, damit er sich nahtlos neben den Anleitung-Button in die bestehende .game-header-Zeile
 * auf Setup- und Spielbildschirm einfügt. Der Zustand liegt in localStorage (siehe
 * audio/soundSettings.ts) und wirkt sofort, unabhängig davon, wo der Button gerade angezeigt wird.
 */
export function createSoundToggleButton(lang: Language): HTMLButtonElement {
  const button = h("button", { type: "button", class: "secondary" }, [""]) as HTMLButtonElement;

  function refresh(): void {
    const enabled = isSoundEnabled();
    button.textContent = enabled ? lang.soundOnLabel : lang.soundOffLabel;
    button.setAttribute("aria-pressed", String(enabled));
  }

  button.addEventListener("click", () => {
    audioEngine.unlock();
    setSoundEnabled(!isSoundEnabled());
    refresh();
  });

  refresh();
  return button;
}
