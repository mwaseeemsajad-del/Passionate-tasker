/*
 * Understanding what people say when they book by voice.
 *
 * Plain keyword and pattern matching, no model call: it works with no backend
 * and no API key, and every guess is read back before the booking moves on, so
 * a wrong guess costs one "no", never a wrong booking. When a language model
 * is added later, keep these function signatures and swap the insides.
 *
 * Input is the raw words from the speech recogniser: no punctuation, and
 * numbers sometimes spelled out ("two") and sometimes digits ("2").
 */

import { jobsFor, services } from "@/data/services";
import type { ServiceJob, Trade } from "@/types/content";
import { POSTCODE, POSTCODE_AREA, SLOTS, formatPostcode, type Day, type SlotId } from "./draft";

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};

/** Inside a postcode or phone number, digits also arrive as sound-alike words. */
const DIGIT_SOUNDS: Record<string, string> = { ...NUMBER_WORDS, oh: "0", to: "2", too: "2", for: "4", ate: "8" };

/** Lower case, punctuation to spaces, single spaces, padded so whole words match. */
function clean(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9@ ]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

/** Whole-word or whole-phrase match, so "tap" does not match "tape". */
const has = (cleaned: string, phrase: string) => cleaned.includes(clean(phrase));
const hasAny = (cleaned: string, phrases: string[]) => phrases.some((p) => has(cleaned, p));

/* ---- Which trade and which job ---- */

const TRADE_WORDS: Record<Trade, string[]> = {
  plumbing: ["plumber", "plumbers", "plummer", "plumer", "plumbing", "leak", "leaking", "drip", "dripping", "tap", "taps", "toilet", "loo", "drain", "blocked", "sink", "bath", "shower", "pipe", "pipes", "water", "flush"],
  electrical: ["electrician", "electricians", "electrition", "electric", "electrical", "electrics", "socket", "sockets", "switch", "switches", "light", "lights", "lighting", "fuse", "fuses", "wiring", "power", "sparking", "tripping", "eicr"],
  gas: ["gas", "gas engineer", "gas man", "gas hob", "hob", "cooker", "oven", "gas fire", "gas safety", "gas leak", "smell gas", "smell of gas", "cap off", "gas pipe"],
  heating: ["heating", "heating engineer", "boiler", "radiator", "radiators", "hot water", "heater", "thermostat", "cold house", "combi"],
  painting: ["paint", "painter", "painting", "decorator", "decorating", "wallpaper", "emulsion", "repaint", "walls", "ceiling", "skirting"],
  carpentry: ["carpenter", "carpentry", "joiner", "joinery", "wood", "wooden", "alcove", "architrave", "skirting board", "skirting boards", "hang a door", "internal door", "cupboard doors"],
  handyman: ["handyman", "handyperson", "odd job", "odd jobs", "shelf", "shelves", "tv", "television", "mount", "door", "furniture", "flat pack", "flatpack", "assemble", "drill", "hang", "curtain", "wardrobe"],
};

const JOB_WORDS: Record<string, string[]> = {
  "dripping-tap": ["tap", "taps", "dripping", "drip"],
  "blocked-sink": ["blocked", "sink", "bath", "clogged", "drain"],
  "running-toilet": ["toilet", "loo", "flush", "cistern", "running"],
  "new-shower": ["shower", "new shower"],
  "burst-pipe": ["burst", "pipe", "leak", "leaking", "flood", "urgent", "emergency"],
  "socket-switch": ["socket", "sockets", "switch", "switches", "plug"],
  "ceiling-light": ["ceiling light", "light fitting", "light", "lights", "lamp"],
  "fuse-tripping": ["fuse", "fuses", "trip", "tripping", "tripped", "no power", "sparking"],
  "outdoor-light": ["outdoor", "outside light", "garden light", "security light", "sensor"],
  eicr: ["eicr", "certificate", "safety check", "electrical certificate"],
  "boiler-service": ["service", "boiler service", "annual"],
  "no-heating": ["no heating", "no hot water", "not working", "broken boiler", "cold", "no heat"],
  radiators: ["radiator", "radiators", "bleed"],
  "gas-certificate": ["landlord", "gas certificate", "gas safety", "cp12"],
  "gas-hob": ["hob", "cooker", "oven", "stove", "move"],
  "gas-fire": ["gas fire", "fire", "fireplace"],
  "gas-safety-check": ["safety check", "gas safety", "check", "certificate", "smell", "leak"],
  "cap-gas": ["cap", "cap off", "disconnect", "remove"],
  "paint-room": ["room", "bedroom", "living room", "lounge", "kitchen", "walls"],
  "paint-ceiling": ["ceiling", "ceilings"],
  "doors-skirting": ["doors", "door", "skirting", "woodwork", "gloss"],
  wallpaper: ["wallpaper", "paper", "feature wall"],
  "fence-exterior": ["fence", "fences", "outside", "exterior", "render", "masonry"],
  "hang-door": ["hang", "door", "new door", "internal door"],
  skirting: ["skirting", "skirting boards", "architrave"],
  alcove: ["alcove", "shelves", "cupboard", "built in", "wardrobe"],
  "cabinet-doors": ["kitchen", "cupboard doors", "cabinet", "hinges", "hinge"],
  "odd-jobs": ["odd jobs", "odd job", "list", "few jobs", "small jobs"],
  shelves: ["shelf", "shelves", "shelving"],
  "tv-mounting": ["tv", "television", "telly", "mount"],
  "sticking-door": ["door", "doors", "sticks", "sticking", "latch"],
  "flat-pack": ["flat pack", "flatpack", "furniture", "wardrobe", "bed", "assemble", "ikea"],
};

const score = (cleaned: string, words: string[]) => words.reduce((sum, w) => sum + (has(cleaned, w) ? w.split(" ").length : 0), 0);

/** The trade a sentence is most likely about, or null. */
export function matchTrade(text: string): Trade | null {
  const cleaned = clean(text);
  let best: { trade: Trade; score: number } | null = null;
  for (const service of services) {
    let s = score(cleaned, TRADE_WORDS[service.slug]);
    if (has(cleaned, service.name.toLowerCase())) s += 2;
    if (s > 0 && (!best || s > best.score)) best = { trade: service.slug, score: s };
  }
  return best?.trade ?? null;
}

/** The job within a trade a sentence is most likely about, or null. */
export function matchJob(text: string, trade: Trade): ServiceJob | null {
  const cleaned = clean(text);
  let best: { job: ServiceJob; score: number } | null = null;
  for (const job of jobsFor(trade)) {
    let s = score(cleaned, JOB_WORDS[job.slug] ?? []);
    if (cleaned.includes(clean(job.name))) s += 3;
    if (s > 0 && (!best || s > best.score)) best = { job, score: s };
  }
  if (!best && hasAny(cleaned, ["something else", "other", "none of them", "not on the list"])) {
    return jobsFor(trade).find((j) => j.slug === "something-else") ?? null;
  }
  return best?.job ?? null;
}

/* ---- Details that can be picked out of any sentence ---- */

/**
 * A UK postcode however it was said ("SW2 1AA", "s w two one a a"), written
 * "SW2 1AA". With `allowArea`, the first half on its own ("SW2") also counts;
 * only used when the postcode was asked for, because in a free sentence short
 * letter-and-number pairs turn up by accident ("fix it for me" → "IT4").
 */
export function findPostcode(text: string, allowArea = false): string | null {
  const tokens = text
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => DIGIT_SOUNDS[t.toLowerCase()] ?? t);

  for (let start = 0; start < tokens.length; start++) {
    let joined = "";
    for (let end = start; end < tokens.length && end < start + 8; end++) {
      if (tokens[end].length > 4) break;
      joined += tokens[end];
      if (joined.length >= 5 && joined.length <= 7 && POSTCODE.test(joined)) return formatPostcode(joined);
    }
  }
  if (!allowArea) return null;
  // No full postcode: take the longest postcode area that was said.
  let area: string | null = null;
  for (let start = 0; start < tokens.length; start++) {
    let joined = "";
    for (let end = start; end < tokens.length && end < start + 4; end++) {
      if (tokens[end].length > 4) break;
      joined += tokens[end];
      if (POSTCODE_AREA.test(joined) && (!area || joined.length > area.length)) area = joined;
    }
  }
  return area;
}

/** "tomorrow", "friday", "the day after tomorrow", as one of the offered days. */
export function findDay(text: string, days: Day[]): Day | null {
  const cleaned = clean(text);
  if (has(cleaned, "day after tomorrow")) return days[2] ?? null;
  if (hasAny(cleaned, ["today", "tonight", "this morning", "this afternoon", "this evening", "as soon as possible", "asap"])) return days[0] ?? null;
  if (has(cleaned, "tomorrow")) return days[1] ?? null;
  // Today is never matched by weekday: "friday" said on a Friday means next Friday.
  return days.slice(1).find((d) => has(cleaned, d.weekday)) ?? null;
}

export function findSlot(text: string): SlotId | null {
  const cleaned = clean(text);
  if (hasAny(cleaned, ["morning", "am", "early", "before lunch"])) return "morning";
  if (hasAny(cleaned, ["afternoon", "after lunch", "lunchtime", "midday", "pm"])) return "afternoon";
  if (hasAny(cleaned, ["evening", "tonight", "after work", "after 5"])) return "evening";
  return null;
}

export const slotFor = (id: SlotId | null) => SLOTS.find((s) => s.id === id) ?? null;

/** Which of a spoken list someone chose: "the second one", "two", or the item's own words. */
export function findChoice<T>(text: string, items: T[], nameOf: (item: T) => string): T | null {
  const cleaned = clean(text);
  const ordinals = [["first", "1st"], ["second", "2nd"], ["third", "3rd"], ["fourth", "4th"], ["fifth", "5th"], ["sixth", "6th"]];
  const numbers = [["one", "1"], ["two", "2", "to", "too"], ["three", "3"], ["four", "4", "for"], ["five", "5"], ["six", "6"]];
  for (const words of [ordinals, numbers]) {
    for (let i = 0; i < Math.min(items.length, words.length); i++) {
      if (hasAny(cleaned, words[i].map((w) => `option ${w}`)) || hasAny(cleaned, words[i].map((w) => `number ${w}`))) return items[i];
    }
  }
  // Without "option" in front, sound-alikes such as "for" are ordinary words, so only real numbers count.
  for (const words of [ordinals, numbers.map((n) => n.slice(0, 2))]) {
    for (let i = 0; i < Math.min(items.length, words.length); i++) {
      if (hasAny(cleaned, words[i])) return items[i];
    }
  }
  return items.find((item) => cleaned.includes(clean(nameOf(item)))) ?? null;
}

/* ---- Contact details ---- */

/** "jo dot smith at gmail dot com" → "jo.smith@gmail.com". */
export function spokenEmail(text: string): string {
  return ` ${text.toLowerCase()} `
    .replace(/^\s*(my email( address)? is|it's|it is|email)\s+/, " ")
    .replace(/\s+(at|at sign)\s+/g, "@")
    .replace(/\s+(dot|full stop|period|point)\s+/g, ".")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+(dash|hyphen)\s+/g, "-")
    .replace(/\s+/g, "")
    .replace(/\.$/, "");
}

/** Spelt out for reading back, so a wrong letter can be heard. */
export function spellOut(value: string): string {
  return value
    .split("")
    .filter((c) => c !== " ")
    .map((c) => (c === "@" ? "at" : c === "." ? "dot" : c === "_" ? "underscore" : c === "-" ? "dash" : c))
    .join(" ");
}

export function spokenName(text: string): string {
  return text
    .trim()
    .replace(/^(my name is|my name's|i am|i'm|it's|it is|this is|call me)\s+/i, "")
    .replace(/[.!?]+$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Digits from a spoken phone number: "oh seven seven double two ...". */
export function spokenPhone(text: string): string {
  const words = text.toLowerCase().replace(/[^a-z0-9+ ]+/g, " ").split(/\s+/);
  let out = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const repeat = w === "double" ? 2 : w === "triple" ? 3 : 1;
    const target = repeat > 1 ? (words[++i] ?? "") : w;
    const digit = /^\+?\d+$/.test(target) ? target : (DIGIT_SOUNDS[target] ?? "");
    out += digit.repeat(repeat);
  }
  return out;
}

/** Phone digits grouped the way they are said in the UK: "07700 900123". */
export function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

/* ---- Conversation words ---- */

export const isYes = (text: string) =>
  hasAny(clean(text), ["yes", "yeah", "yep", "yup", "correct", "right", "that's right", "sure", "ok", "okay", "confirm", "continue", "go ahead", "sounds good", "perfect", "fine", "next", "send", "send it"]);

export const isNo = (text: string) => hasAny(clean(text), ["no", "nope", "wrong", "not right", "incorrect", "nah"]);

export const isSkip = (text: string) => hasAny(clean(text), ["skip", "no", "nothing", "none", "nope", "no thanks", "not needed", "leave it"]);

export const isStop = (text: string) =>
  /^\s*(please )?(stop|cancel|quit|exit|end)( (it|now|please|voice|listening|talking))*\s*$/i.test(text);

/** Said while paused, to pick the booking up again. */
export const isResume = (text: string) =>
  hasAny(clean(text), ["carry on", "continue", "resume", "start", "start again", "go on", "i'm back", "im back", "i am back", "ready", "let's go", "lets go"]);

/** Said while paused, to turn voice booking off completely. */
export const isTurnOff = (text: string) => hasAny(clean(text), ["turn off", "switch off", "goodbye", "bye", "close voice", "finish voice"]);

export const isRepeat =(text: string) => hasAny(clean(text), ["repeat", "say that again", "again", "pardon", "what", "sorry"]);

export const isBack = (text: string) => hasAny(clean(text), ["go back", "back", "previous"]);

/**
 * A short reply of the kind people give to a question: "yes", "no", "stop",
 * "number two", "3". The guide accepts these even when the same word appears
 * in its own question, as long as they arrive as an answer of their own.
 */
export function isShortAnswer(text: string): boolean {
  const cleaned = clean(text);
  if (cleaned.trim().split(" ").length > 3) return false;
  return (
    /\d/.test(cleaned) ||
    hasAny(cleaned, Object.keys(NUMBER_WORDS)) ||
    isYes(text) ||
    isNo(text) ||
    isStop(text) ||
    isBack(text) ||
    isRepeat(text) ||
    hasAny(cleaned, ["first", "second", "third", "fourth", "fifth", "sixth", "morning", "afternoon", "evening", "today", "tomorrow"])
  );
}
