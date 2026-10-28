import { matchJob, matchTrade } from "@/features/booking/understand";
import type { Trade } from "@/types/content";

/*
 * What a visitor asked the help assistant for, worked out from the words the
 * browser heard. Keyword matching, not AI: every request maps to one of a few
 * things the assistant can do. The recogniser's other guesses are tried in
 * turn, because it often mishears ("plumber" as "plant").
 */

export type HelpIntent =
  | { kind: "topic"; id: "what" | "who" | "person" }
  | { kind: "price"; trade: Trade | null }
  | { kind: "book"; trade: Trade | null; job: string | null }
  | { kind: "text"; on: boolean }
  | { kind: "contrast"; on: boolean }
  | { kind: "go"; href: string; name: string }
  | { kind: "repeat" }
  | { kind: "options" }
  | { kind: "close" };

/** Lower case, punctuation to spaces, padded so whole words match. */
const clean = (text: string) => ` ${text.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim()} `;
const hasAny = (cleaned: string, phrases: string[]) => phrases.some((p) => cleaned.includes(` ${p} `));
const wordCount = (cleaned: string) => cleaned.trim().split(" ").filter(Boolean).length;

const CLOSE = ["no", "nope", "no thanks", "no thank you", "nothing", "nothing else", "that's all", "thats all", "that is all", "bye", "goodbye", "stop", "cancel", "close", "thank you", "thanks", "i'm done", "im done", "finished", "all done"];
const REPEAT = ["repeat", "say that again", "again", "pardon", "sorry", "come again", "one more time"];
const OPTIONS = ["help", "options", "what can i say", "what can you do", "menu", "choices", "what are my options"];

const BIGGER = ["bigger", "larger", "big text", "large text", "zoom", "can't see", "cant see", "cannot see", "can't read", "cant read", "cannot read", "hard to see", "hard to read", "text size", "font size"];
const SMALLER = ["smaller", "normal size", "normal text", "small text", "less big"];
const CONTRAST = ["contrast", "darker", "clearer", "sharper", "colours", "colors", "brighter"];
const CONTRAST_OFF = ["normal colours", "normal colors", "contrast off", "turn off contrast", "less contrast"];

const PRICE = ["price", "prices", "pricing", "cost", "costs", "how much", "charge", "charges", "pay", "payment", "fee", "fees", "expensive", "cheap", "quote", "money"];
const PERSON = ["call", "phone", "telephone", "number", "human", "real person", "a person", "someone to talk", "talk to someone", "speak to someone", "contact", "staff", "customer service"];
const WHO = ["who", "checked", "checks", "check", "safe", "safety", "trust", "dbs", "insurance", "insured", "vetted", "verified", "background", "police"];
const BOOK = ["book", "booking", "appointment", "need someone", "need a", "fix", "repair", "broken", "mend", "install", "fit", "job", "hire", "send someone", "by voice", "by speaking"];
const WHAT = ["what is this", "what's this", "whats this", "website", "this site", "about", "what do you do", "how does it work", "how it works", "explain"];

const PAGES: { words: string[]; href: string; name: string }[] = [
  { words: ["home", "home page", "start page", "front page"], href: "/", name: "home page" },
  { words: ["services", "service list", "all services"], href: "/services", name: "services page" },
  { words: ["pricing page", "prices page", "price page"], href: "/pricing", name: "prices page" },
  { words: ["how it works page", "steps page"], href: "/how-it-works", name: "how it works page" },
  { words: ["help page", "faq", "questions page"], href: "/help", name: "help page" },
  { words: ["trust", "trust page", "safety page"], href: "/trust", name: "trust and safety page" },
  { words: ["accessibility", "accessibility page"], href: "/accessibility", name: "accessibility page" },
];
const GO = ["go to", "open", "take me", "show me", "show", "page"];

function understandOne(text: string): HelpIntent | null {
  const t = clean(text);
  if (!t.trim()) return null;
  const short = wordCount(t) <= 4;
  const trade = matchTrade(text);

  // Short replies first, so "no thanks" closes rather than matching anything
  // else. Not when a trade is named: "no hot water" is a heating job.
  if (short && !trade && hasAny(t, CLOSE)) return { kind: "close" };
  if (short && hasAny(t, REPEAT)) return { kind: "repeat" };
  if (short && hasAny(t, OPTIONS)) return { kind: "options" };

  if (hasAny(t, CONTRAST_OFF)) return { kind: "contrast", on: false };
  if (hasAny(t, CONTRAST)) return { kind: "contrast", on: true };
  if (hasAny(t, SMALLER)) return { kind: "text", on: false };
  if (hasAny(t, BIGGER)) return { kind: "text", on: true };

  if (hasAny(t, GO)) {
    const page = PAGES.find((p) => hasAny(t, p.words));
    if (page) return { kind: "go", href: page.href, name: page.name };
  }

  if (hasAny(t, ["who are you", "what are you"])) return { kind: "topic", id: "what" };
  if (hasAny(t, PRICE)) return { kind: "price", trade };
  if (hasAny(t, PERSON)) return { kind: "topic", id: "person" };
  // "Who will come" and "is it safe" are about the checks, unless a trade is named.
  if (!trade && hasAny(t, WHO)) return { kind: "topic", id: "who" };
  if (trade || hasAny(t, BOOK)) {
    // "Fix my leaking tap": the job too, so the booking need not ask for it.
    const job = trade ? matchJob(text, trade) : null;
    return { kind: "book", trade, job: job && job.slug !== "something-else" ? job.slug : null };
  }
  if (hasAny(t, WHAT)) return { kind: "topic", id: "what" };
  return null;
}

/** The first of the recogniser's guesses that means something, or null. */
export function understandRequest(guesses: string[]): HelpIntent | null {
  for (const guess of guesses) {
    const intent = understandOne(guess);
    if (intent) return intent;
  }
  return null;
}
