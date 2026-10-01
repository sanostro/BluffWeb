import { renderLanguageSelectScreen } from "./ui/languageSelectScreen";
import { renderSetupScreen, GameSettings } from "./ui/setupScreen";
import { renderGameScreen } from "./ui/gameScreen";
import { openHelpDialog } from "./ui/helpScreen";
import { getStoredLanguage } from "./i18n/languageStore";
import { Language } from "./i18n/language";

const app = document.getElementById("app")!;

function start(): void {
  const stored = getStoredLanguage();
  if (stored) {
    showSetup(stored);
  } else {
    showLanguageSelect();
  }
}

function showLanguageSelect(): void {
  renderLanguageSelectScreen(app, (language) => showSetup(language));
}

function showSetup(lang: Language): void {
  document.documentElement.lang = lang.id;
  renderSetupScreen(
    app,
    lang,
    (settings) => showGame(lang, settings, null),
    () => showLanguageSelect(),
    () => openHelpDialog(lang),
  );
}

function showGame(lang: Language, settings: GameSettings, aiNames: string[] | null): void {
  renderGameScreen(
    app,
    lang,
    settings,
    aiNames,
    (choice, names) => {
      if (choice === "playAgain") {
        showGame(lang, settings, names);
      } else {
        showSetup(lang);
      }
    },
    () => openHelpDialog(lang),
  );
}

start();
