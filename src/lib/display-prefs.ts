/*
 * Display settings: larger text and high contrast.
 *
 * The source of truth is two attributes on <html>, data-text and
 * data-contrast, which globals.css keys off. A small script in the root
 * layout (DISPLAY_SCRIPT) sets them before the first paint, so a returning
 * visitor never sees a flash of the wrong size or colours. React only
 * subscribes to them, through useSyncExternalStore, for the toggles' state.
 */

export type DisplayPrefs = { largeText: boolean; highContrast: boolean };

const TEXT_KEY = "pt-text";
const CONTRAST_KEY = "pt-contrast";

/*
 * Runs in <head> before anything is painted. Keep in step with read() below.
 * High contrast follows the device's "more contrast" setting until the visitor
 * makes a choice here.
 */
export const DISPLAY_SCRIPT = `(function(){try{var r=document.documentElement,t=localStorage.getItem("${TEXT_KEY}"),c=localStorage.getItem("${CONTRAST_KEY}");r.setAttribute("data-text",t==="lg"?"lg":"normal");if(c!=="high"&&c!=="normal"){c=window.matchMedia&&matchMedia("(prefers-contrast: more)").matches?"high":"normal"}r.setAttribute("data-contrast",c)}catch(e){}})()`;

const DEFAULTS: DisplayPrefs = { largeText: false, highContrast: false };

function read(): DisplayPrefs {
  const root = document.documentElement;
  return { largeText: root.dataset.text === "lg", highContrast: root.dataset.contrast === "high" };
}

let snapshot: DisplayPrefs | null = null;
let listeners: (() => void)[] = [];

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): DisplayPrefs {
  if (!snapshot) snapshot = read();
  return snapshot;
}

export function getServerSnapshot(): DisplayPrefs {
  return DEFAULTS;
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the setting works for this visit, it just is not remembered */
  }
}

function apply(next: DisplayPrefs) {
  const root = document.documentElement;
  root.dataset.text = next.largeText ? "lg" : "normal";
  root.dataset.contrast = next.highContrast ? "high" : "normal";
  snapshot = next;
  for (const l of listeners) l();
}

export function setLargeText(on: boolean) {
  remember(TEXT_KEY, on ? "lg" : "normal");
  apply({ ...getSnapshot(), largeText: on });
}

export function setHighContrast(on: boolean) {
  remember(CONTRAST_KEY, on ? "high" : "normal");
  apply({ ...getSnapshot(), highContrast: on });
}
