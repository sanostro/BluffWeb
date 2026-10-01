/** Kleine Hilfsfunktion, um Elemente mit Attributen/Kindern ohne Framework zu bauen. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) {
      continue;
    }
    if (key === "text") {
      el.textContent = String(value);
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    el.append(child);
  }
  return el;
}

export function clear(container: HTMLElement): void {
  container.replaceChildren();
}
