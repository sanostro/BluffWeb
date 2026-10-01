import { audioEngine } from "../audio/audioEngine";
import { Language } from "../i18n/language";
import { getNamePoolText, setNamePoolText } from "../names/aiNames";
import { clear, h } from "./dom";
import { createSoundToggleButton } from "./soundToggle";

export interface GameSettings {
  readonly playerName: string;
  readonly aiCount: number;
}

export function renderSetupScreen(
  container: HTMLElement,
  lang: Language,
  onStart: (settings: GameSettings) => void,
  onChangeLanguage: () => void,
  onOpenHelp: () => void,
): void {
  clear(container);

  const nameInput = h("input", { type: "text", id: "player-name", autocomplete: "off" }) as HTMLInputElement;

  const aiCountSelect = h(
    "select",
    { id: "ai-count" },
    [1, 2, 3, 4, 5].map((n) => h("option", { value: String(n) }, [lang.aiCountItem(n)])),
  ) as HTMLSelectElement;
  aiCountSelect.value = "2";

  const namesTextarea = h("textarea", { id: "ai-names", rows: "8" }) as HTMLTextAreaElement;
  namesTextarea.value = getNamePoolText();
  namesTextarea.addEventListener("change", () => setNamePoolText(namesTextarea.value));

  const changeLangButton = h("button", { type: "button", class: "secondary" }, [lang.changeLanguageButton]);
  changeLangButton.addEventListener("click", onChangeLanguage);

  const helpButton = h("button", { type: "button", class: "secondary" }, [lang.helpButton]);
  helpButton.addEventListener("click", onOpenHelp);

  const soundToggleButton = createSoundToggleButton(lang);

  const startButton = h("button", { type: "button", class: "primary" }, [lang.startButton]);
  startButton.addEventListener("click", () => {
    // Sicherheitsnetz: falls die Sprache bereits gespeichert war, wurde der Sprachauswahl-
    // Bildschirm (und damit der dortige unlock()-Aufruf) übersprungen - der AudioContext
    // braucht trotzdem eine echte Nutzerinteraktion, um Sound abspielen zu dürfen.
    audioEngine.unlock();
    const playerName = nameInput.value.trim() || lang.defaultPlayerNameFallback;
    onStart({ playerName, aiCount: Number(aiCountSelect.value) });
  });

  const form = h("form", {}, [
    h("div", { class: "field" }, [h("label", { for: "player-name" }, [lang.yourNameLabel]), nameInput]),
    h("div", { class: "field" }, [h("label", { for: "ai-count" }, [lang.aiCountLabel]), aiCountSelect]),
    h("details", { class: "field" }, [
      h("summary", {}, [lang.namesEditorLabel]),
      h("p", { class: "hint" }, [lang.namesEditorHint]),
      namesTextarea,
    ]),
    h("div", { class: "actions" }, [startButton, changeLangButton]),
  ]);
  form.addEventListener("submit", (e) => e.preventDefault());

  container.append(
    h("main", { class: "screen setup-screen" }, [
      h("div", { class: "game-header" }, [h("h1", {}, [lang.setupTitle]), h("div", { class: "header-actions" }, [soundToggleButton, helpButton])]),
      form,
    ]),
  );

  nameInput.focus();
}
