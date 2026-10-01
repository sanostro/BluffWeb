import { allLanguages, setStoredLanguage } from "../i18n/languageStore";
import { Language } from "../i18n/language";
import { audioEngine } from "../audio/audioEngine";
import { clear, h } from "./dom";

/**
 * Allererster Bildschirm, vor allem anderen. Jede Sprache steht in sich selbst benannt in der
 * Liste ("Deutsch"/"English"/"Nederlands") - Standardkonvention bei Sprachauswahl, erkennbar
 * unabhängig von der noch nicht getroffenen Wahl. Titel/Buttons bleiben bewusst Deutsch (siehe
 * BluffWeb/CLAUDE.md) statt einer vierten Übersetzungsebene für diesen einmaligen Bildschirm.
 */
export function renderLanguageSelectScreen(container: HTMLElement, onChosen: (language: Language) => void): void {
  clear(container);

  let selected: Language = allLanguages[0];

  const list = h(
    "ul",
    { role: "radiogroup", "aria-label": "Sprache" },
    allLanguages.map((language, index) =>
      h("li", {}, [
        h("label", { class: "language-option" }, [
          h("input", {
            type: "radio",
            name: "language",
            value: language.id,
            checked: index === 0,
          }),
          document.createTextNode(" " + language.displayName),
        ]),
      ]),
    ),
  );

  list.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    const found = allLanguages.find((l) => l.id === target.value);
    if (found) {
      selected = found;
    }
  });

  const continueButton = h("button", { type: "button", class: "primary" }, ["Weiter"]);
  continueButton.addEventListener("click", () => {
    audioEngine.unlock();
    setStoredLanguage(selected);
    onChosen(selected);
  });

  container.append(
    h("main", { class: "screen language-screen" }, [
      h("h1", {}, ["Bluff – Sprache wählen"]),
      h("p", {}, ["Wählen Sie die Sprache des Spiels:"]),
      list,
      continueButton,
    ]),
  );

  continueButton.focus();
}
