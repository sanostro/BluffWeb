# Bluff

Eine barrierefreie Progressive Web App des Würfel-Bluffspiels "Bluff" — spielbar im Browser, ein Mensch gegen bis zu fünf Computergegner, auf Deutsch, Englisch und Niederländisch. Gebaut insbesondere für Screenreader-Nutzung (VoiceOver unter macOS/iOS Safari, JAWS/NVDA unter Windows in jedem Browser).

Dies ist eine eigenständige Web-Neuimplementierung der ursprünglich für Windows (WinForms) gebauten Version desselben Spiels — gleiche Regeln, gleicher Funktionsumfang, aber plattformunabhängig und ohne Installation nutzbar.

## Spielregeln (kurz)

Jeder Spieler erhält 5 Würfel (Zahlen 1–5 plus ein Stern als Joker) und würfelt verdeckt. Reihum wird über die Gesamtzahl eines bestimmten Würfelwerts bei allen Spielern zusammen geboten; jedes folgende Gebot muss höher sein. Statt zu erhöhen kann man anzweifeln und aufdecken lassen — wer sich verschätzt hat, verliert Würfel. Wer keine Würfel mehr hat, scheidet aus; Sieger ist die letzte verbleibende Person. Eine vollständige, bebilderte Anleitung ist in der App selbst über den Button "Anleitung" erreichbar.

## Entwicklung

Voraussetzung: Node.js mit npm.

```bash
npm install
npm run dev       # Lokalen Entwicklungsserver starten
npm run build     # Produktions-Build nach dist/ (tsc -b && vite build)
npm run preview   # Produktions-Build lokal ausliefern
```

## Technik

Vanilla TypeScript + [Vite](https://vite.dev/), kein UI-Framework. Als PWA installierbar (Offline-Caching via `vite-plugin-pwa`). Barrierefreiheit beruht ausschließlich auf nativer, semantischer HTML/ARIA-Auszeichnung (echte `<select>`/`<table>`/`<dialog>`-Elemente, `aria-live`-Regionen für Ansagen, Überschriften-Struktur für Sprungmarken-Navigation) statt nachgebauter Steuerelemente.

Weitere Details zu Architektur und Entwurfsentscheidungen stehen in [CLAUDE.md](CLAUDE.md).
