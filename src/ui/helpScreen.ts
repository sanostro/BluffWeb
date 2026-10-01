import { Language } from "../i18n/language";
import { h } from "./dom";

/**
 * Nur-Lese-Ansicht der Spielanleitung - TS-Pendant zu Bluff/Forms/HelpForm.cs. Läuft als
 * natives <dialog>-Element über dem laufenden Spiel statt es zu ersetzen: die GameEngine läuft
 * währenddessen unverändert im Hintergrund weiter, genau wie das modale HelpForm unter WinForms
 * GameForm nicht schließt. <dialog>.showModal() übernimmt Fokus-Falle und Escape-zum-Schließen
 * nativ und barrierefrei, ohne eigenen Code dafür.
 *
 * Anders als HelpForm.cs (ListBox mit Kapitelnamen + TextBox, die per SelectedIndexChanged
 * getauscht wird) zeigt die Web-Version alle Kapitel in einem Rutsch, jedes mit einer echten
 * <h2>-Überschrift - kein Kapitel-für-Kapitel-Umschalten nötig, weil Web-Screenreader ohnehin
 * die gesamte Seite über ihren virtuellen Cursor durchsuchen und per Überschriften-Sprungmarke
 * (VoiceOver-Rotor, JAWS/NVDA "H") direkt zwischen Kapiteln springen können.
 */
export function openHelpDialog(lang: Language): void {
  const dialog = h("dialog", { class: "help-dialog", "aria-label": lang.helpTitle }) as HTMLDialogElement;

  const closeButton = h("button", { type: "button", class: "primary" }, [lang.closeButton]);
  closeButton.addEventListener("click", () => dialog.close());

  const chapters = lang.helpChapters.map((chapter, index) =>
    h("section", { "aria-labelledby": `help-chapter-${index}` }, [
      h("h2", { id: `help-chapter-${index}` }, [chapter.heading]),
      h("p", {}, [chapter.body]),
    ]),
  );

  dialog.append(
    h("div", { class: "help-header" }, [h("h1", {}, [lang.helpTitle]), closeButton]),
    h("div", { class: "help-body", tabindex: "0" }, chapters),
  );

  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}
