import { allLanguages, setStoredLanguage } from "../i18n/languageStore";
import { Language } from "../i18n/language";
import { audioEngine } from "../audio/audioEngine";
import { clear, h } from "./dom";

/**
 * Allererster Bildschirm, vor allem anderen. Jede Sprache steht in sich selbst benannt in der
 * Liste ("Deutsch"/"English"/"Nederlands") - Standardkonvention bei Sprachauswahl, erkennbar
 * unabhängig von der noch nicht getroffenen Wahl. Der Titel bleibt bewusst Deutsch (siehe
 * BluffWeb/CLAUDE.md) statt einer vierten Übersetzungsebene für diesen einmaligen Bildschirm -
 * die Aufforderung, überhaupt eine Sprache zu wählen, steht dagegen in allen drei Sprachen da
 * (lang.languageSelectPrompt je Sprache), sonst versteht sie nur, wer schon Deutsch kann. Jede
 * dieser Zeilen sowie jeder Listeneintrag trägt ihr eigenes lang-Attribut (WCAG 3.1.2 "Language
 * of Parts") - sonst liest ein Screenreader "English"/"Nederlands" mit deutscher Aussprache vor,
 * weil die Dokumentsprache bis zur Auswahl auf "de" steht. Der Button heißt schlicht "Play" statt
 * einer Übersetzung pro Sprache - das Wort ist in allen drei Sprachen ohnehin verständlich.
 */
export function renderLanguageSelectScreen(container: HTMLElement, onChosen: (language: Language) => void): void {
  clear(container);

  let selected: Language = allLanguages[0];

  const list = h(
    "ul",
    { role: "radiogroup", "aria-label": "Sprache" },
    allLanguages.map((language, index) =>
      // role="presentation": die <ul> ist durch role="radiogroup" semantisch keine Liste mehr,
      // ihre <li>-Kinder brauchen daher explizit keine eigene listitem-Rolle mehr (die sonst ins
      // Leere zeigt, weil der Elternknoten keine Liste/Gruppe im Accessibility-Tree ist) - per
      // axe-core gefunden ("<li> elements must be contained in a <ul> or <ol>").
      h("li", { lang: language.id, role: "presentation" }, [
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

  const continueButton = h("button", { type: "button", class: "primary" }, ["Play"]);
  continueButton.addEventListener("click", () => {
    audioEngine.unlock();
    setStoredLanguage(selected);
    onChosen(selected);
  });

  container.append(
    h("main", { class: "screen language-screen" }, [
      h("h1", {}, ["Bluff – Sprache wählen"]),
      ...allLanguages.map((language) => h("p", { lang: language.id }, [language.languageSelectPrompt])),
      list,
      continueButton,
    ]),
  );

  continueButton.focus();
}
