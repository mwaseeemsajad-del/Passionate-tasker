"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatFromPrice, getService, jobsFor, services } from "@/data/services";
import { isEcho, listenOnce, primeAudio, speakAndWait, stopSpeaking, type ListenResult } from "@/lib/speech";
import { supabaseConfigured } from "@/lib/supabase/env";
import { EMAIL, POSTCODE, SLOTS, describe, isPhone, isPostcodeOk, type Day, type Draft } from "./draft";
import {
  findChoice,
  findDay,
  findPostcode,
  findSlot,
  formatPhone,
  isBack,
  isNo,
  isRepeat,
  isResume,
  isShortAnswer,
  isSkip,
  isStop,
  isTurnOff,
  isYes,
  matchJob,
  matchTrade,
  spellOut,
  spokenEmail,
  spokenName,
  spokenPhone,
} from "./understand";

/*
 * Book by voice: a spoken conversation that fills in the booking form, for
 * people who cannot see the screen well enough to fill it in themselves.
 *
 * - One short question at a time, with the choices said out loud.
 * - It fills in the real form fields as answers come in, so a helper looking
 *   at the screen sees exactly the same booking.
 * - Every answer is read back. Postcodes, phone numbers and email addresses
 *   are spelt out, because one wrong character is the likeliest mistake and
 *   the hardest to notice by ear.
 * - "Go back" and "repeat" work at every question.
 * - Saying "stop" pauses it, and so do three silences in a row. While paused
 *   it keeps listening, quietly, so "carry on" picks the booking up again
 *   without finding the button. Escape or the Stop button turn it off.
 * - Nothing moves on without a clear yes.
 */

export type GuideContext = {
  draft: Draft;
  days: Day[];
  /** Set when the request has been sent. */
  reference: string | null;
  set: <K extends keyof Draft>(field: K, value: Draft[K]) => void;
  goTo: (step: number) => void;
  /** The form's own Continue button: checks the step, then moves on (or sends on the last step). */
  next: () => void;
  /** The form's first error, such as the server refusing the request, so it can be said out loud. */
  problem: string | null;
};

export type GuideStatus = "off" | "speaking" | "listening" | "paused";

/** How long a pause keeps listening for "carry on" before the microphone is turned off. */
const PAUSE_LIMIT_MS = 5 * 60 * 1000;

type Question = {
  key: string;
  prompt: string;
  /** Said instead of the prompt when the same question has to be asked again. */
  short?: string;
  /** What to say back, or null if the answer was not understood. */
  answer: (heard: string) => string | null;
};

/** Someone describing a gas leak right now. */
const GAS_EMERGENCY = /\b(smell(s|ing)? (of )?gas|gas (leak|leaking|smell)|leaking gas)\b/i;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const spellPostcode = (p: string) => spellOut(p.replace(/\s+/g, ""));

/** Decide what to ask next from what the form holds right now. */
function nextQuestion(c: GuideContext, asked: Set<string>): Question {
  const { draft, days } = c;
  const { service, job, day, slot } = describe(draft, days);

  // When the postcode itself is asked for, the first half on its own is accepted too.
  const setPostcode = (heard: string, allowArea = false) => {
    const postcode = findPostcode(heard, allowArea);
    if (!postcode) return null;
    c.set("postcode", postcode);
    return POSTCODE.test(postcode)
      ? `Postcode ${spellPostcode(postcode)}.`
      : `Postcode area ${spellPostcode(postcode)}. We will ask for the rest of the postcode when we call.`;
  };
  const setDay = (heard: string) => {
    const found = findDay(heard, days);
    if (!found) return null;
    c.set("date", found.iso);
    return `${found.long}.`;
  };
  const setSlot = (heard: string) => {
    const found = SLOTS.find((s) => s.id === findSlot(heard));
    if (!found) return null;
    c.set("slot", found.id);
    return `${found.label}, ${found.hours}.`;
  };

  /* Step 1: the job */
  if (draft.step === 0) {
    if (!service) {
      return {
        key: "request",
        // No example answer here: a visitor repeating it would be mistaken for the guide's own echo.
        prompt: "What do you need help with?",
        // Numbers are recognised far more reliably than trade names, so the retry offers them.
        short: `Please say a number. ${services.map((s, i) => `${i + 1}, ${s.person.replace(/^an? /, "")}`).join(". ")}.`,
        answer: (heard) => {
          const trade = matchTrade(heard) ?? findChoice(heard, services, (s) => s.person.replace(/^an? /, ""))?.slug ?? null;
          if (!trade) return null;
          c.set("trade", trade);
          const found = matchJob(heard, trade);
          if (found && found.slug !== "something-else") c.set("job", found.slug);
          // Pick up anything else that was said in the same sentence.
          const postcode = findPostcode(heard);
          if (postcode) c.set("postcode", postcode);
          const d = findDay(heard, days);
          if (d) c.set("date", d.iso);
          const s = findSlot(heard);
          if (s) c.set("slot", s);
          if (heard.trim().split(/\s+/).length > 3) c.set("details", heard.trim());
          const chosen = getService(trade);
          const person = chosen?.person ?? "a tradesperson";
          const reply = found && found.slug !== "something-else" ? `That is a job for ${person}: ${found.name}.` : `You need ${person}.`;
          return chosen?.notice ? `${reply} ${chosen.notice}` : reply;
        },
      };
    }
    if (!job) {
      const jobs = jobsFor(draft.trade);
      // Prices are left out of the list to keep it short; the price is said once a job is chosen.
      const options = jobs.map((j, i) => `${i + 1}, ${j.name}.`).join(" ");
      return {
        key: "job",
        prompt: `Which job? ${options}`,
        short: `Please say a number from 1 to ${jobs.length}, or describe the job.`,
        answer: (heard) => {
          const chosen = findChoice(heard, jobs, (j) => j.name) ?? matchJob(heard, service.slug);
          if (!chosen) return null;
          c.set("job", chosen.slug);
          return `${chosen.name}. ${formatFromPrice(chosen)}.`;
        },
      };
    }
    if (!isPostcodeOk(draft.postcode)) {
      return {
        key: "postcode",
        prompt: "What is the postcode?",
        short: "Please say the postcode again, slowly. The first part on its own is fine, like S W 2. Or type it in the box under Book by voice.",
        answer: (heard) => setPostcode(heard, true),
      };
    }
    if (!draft.details.trim() && !asked.has("details")) {
      return {
        key: "details",
        prompt:
          job.slug === "something-else"
            ? "Tell me what needs doing, in your own words."
            : "Anything the tradesperson should know, like parking or pets? Or say no.",
        answer: (heard) => {
          if (job.slug !== "something-else" && isSkip(heard) && heard.trim().split(/\s+/).length <= 3) {
            asked.add("details");
            return "No extra details.";
          }
          asked.add("details");
          c.set("details", heard.trim());
          return "Noted.";
        },
      };
    }
    return {
      key: "confirm-0",
      prompt: `${service.person.replace(/^a/, "A")} for ${job.name}, at postcode ${spellPostcode(draft.postcode)}. Is that right?`,
      short: "Say yes, or say what to change: the job, the postcode or the notes.",
      answer: (heard) => {
        if (isYes(heard) && !isNo(heard)) {
          c.next();
          return "";
        }
        const newPostcode = setPostcode(heard);
        if (newPostcode) return `Changed. ${newPostcode}`;
        if (/postcode/i.test(heard)) {
          c.set("postcode", "");
          return "";
        }
        if (/\b(job|trade|wrong)\b/i.test(heard)) {
          c.set("trade", "");
          c.set("job", "");
          return "";
        }
        if (/\b(note|notes|detail|details)\b/i.test(heard)) {
          c.set("details", "");
          asked.delete("details");
          return "";
        }
        return null;
      },
    };
  }

  /* Step 2: when */
  if (draft.step === 1) {
    if (!day) {
      const last = days[days.length - 1];
      return {
        key: "date",
        prompt: "Which day? Today, tomorrow, or a day of the week?",
        short: `Please say a day, such as tomorrow or Friday. The latest is ${last.long}.`,
        answer: setDay,
      };
    }
    if (!slot) {
      return {
        key: "slot",
        prompt: "Morning, afternoon or evening?",
        short: "Morning is 8 till 12, afternoon 12 till 5, evening 5 till 8. Which would you like?",
        answer: setSlot,
      };
    }
    return {
      key: "confirm-1",
      prompt: `${day.long}, in the ${slot.label.toLowerCase()}. Is that right?`,
      short: "Say yes, or say a different day or time.",
      answer: (heard) => {
        if (isYes(heard) && !isNo(heard)) {
          c.next();
          return "";
        }
        const changed = [setDay(heard), setSlot(heard)].filter(Boolean).join(" ");
        return changed ? `Changed. ${changed}` : null;
      },
    };
  }

  /* Step 3: contact details */
  if (draft.step === 2) {
    if (!draft.name.trim()) {
      return {
        key: "name",
        prompt: "Nearly done. What is your name?",
        short: "Please say your name.",
        answer: (heard) => {
          const name = spokenName(heard);
          if (!name) return null;
          c.set("name", name);
          return `Thank you, ${name}.`;
        },
      };
    }
    if (!isPhone(draft.phone)) {
      return {
        key: "phone",
        prompt: "What is your phone number?",
        short: "Please say the phone number again, one number at a time.",
        answer: (heard) => {
          const digits = spokenPhone(heard);
          if (!isPhone(digits)) return null;
          c.set("phone", formatPhone(digits));
          return "";
        },
      };
    }
    const phone = draft.phone.replace(/\D/g, "");
    if (!asked.has(`phone-ok:${phone}`)) {
      return {
        key: "phone-check",
        prompt: `Your phone number is ${spellOut(phone)}. Is that right?`,
        short: "Is that phone number right? Yes or no.",
        answer: (heard) => {
          if (isNo(heard)) {
            c.set("phone", "");
            return "Let's try again.";
          }
          if (isYes(heard)) {
            asked.add(`phone-ok:${phone}`);
            return "Good.";
          }
          return null;
        },
      };
    }
    const email = draft.email.trim();
    if (!email && !asked.has("email")) {
      return {
        key: "email",
        prompt: "Would you like an email confirmation? Say your email address, or say no.",
        short: "Please say your email address with at and dot, like jo dot smith at gmail dot com. Or say no.",
        answer: (heard) => {
          if (isSkip(heard) && !/@|\bat\b/.test(heard)) {
            asked.add("email");
            return "No email. We will call you instead.";
          }
          const said = spokenEmail(heard);
          if (!EMAIL.test(said)) return null;
          c.set("email", said);
          return "";
        },
      };
    }
    if (email && !asked.has(`email-ok:${email}`)) {
      return {
        key: "email-check",
        prompt: `Your email address is ${spellOut(email)}. Is that right?`,
        short: "Is that email address right? Yes or no.",
        answer: (heard) => {
          if (isNo(heard)) {
            c.set("email", "");
            return "Let's try again.";
          }
          if (isYes(heard)) {
            asked.add(`email-ok:${email}`);
            c.next();
            return "";
          }
          return null;
        },
      };
    }
    // Everything on this step is answered and checked.
    return { key: "advance-2", prompt: "", answer: () => "" };
  }

  /* Step 4: check and send */
  const summary = [
    `${job?.name ?? "Your job"}, with ${service?.person ?? "a tradesperson"}, at postcode ${spellPostcode(draft.postcode)}.`,
    day && slot ? `${day.long}, in the ${slot.label.toLowerCase()}.` : "",
    job ? `${formatFromPrice(job)}.` : "",
    `We will call ${draft.name.trim()} on ${spellOut(draft.phone.replace(/\D/g, ""))}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    key: "confirm-3",
    prompt: `${summary} Shall I send it?`,
    short: "Say send, or say what to change: the job, the day, or your details.",
    answer: (heard) => {
      if (/\b(send|confirm|yes|book it|go ahead|finish)\b/i.test(heard) && !isNo(heard)) {
        c.next();
        return "";
      }
      if (/\b(job|postcode|trade|notes?)\b/i.test(heard)) {
        c.goTo(0);
        return "Going back to the job.";
      }
      if (/\b(day|date|time)\b/i.test(heard)) {
        c.set("date", "");
        c.set("slot", "");
        c.goTo(1);
        return "";
      }
      if (/\b(name|phone|number|email|details)\b/i.test(heard)) {
        c.goTo(2);
        return "Going back to your details.";
      }
      return null;
    },
  };
}

export function useVoiceGuide(context: GuideContext) {
  const [status, setStatus] = useState<GuideStatus>("off");
  const [said, setSaid] = useState("");
  const [heard, setHeard] = useState("");
  // The key of the question being asked ("postcode", "date"), so the form can highlight that field.
  const [asking, setAsking] = useState("");

  // The conversation is a long async loop; it reads the latest form state
  // through this ref instead of the values from when it started.
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  });

  const controllerRef = useRef<AbortController | null>(null);

  // Typed answers: the "Type instead" box hands its text to whichever question is waiting.
  const typedRef = useRef<((text: string) => void) | null>(null);
  const pendingTyped = useRef<string | null>(null);
  const answerByText = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    if (typedRef.current) typedRef.current(t);
    else pendingTyped.current = t;
  }, []);

  // "Answer now": cut the question short and listen straight away.
  const skipRef = useRef<(() => void) | null>(null);
  const skipToAnswer = useCallback(() => skipRef.current?.(), []);

  // "Carry on" while paused, for anyone pressing a button instead of speaking.
  const resumeRef = useRef<(() => void) | null>(null);
  const resume = useCallback(() => resumeRef.current?.(), []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    stopSpeaking();
    setStatus("off");
    setAsking("");
  }, []);

  // Never leave the microphone or the voice running after leaving the page.
  useEffect(() => stop, [stop]);

  // Escape stops it from anywhere on the page. Space, outside a form field or
  // button, cuts the current question short so the visitor can answer now.
  const active = status !== "off";
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return stop();
      const target = event.target as HTMLElement | null;
      const inControl = !!target?.closest("input, textarea, select, button, a, [contenteditable]");
      if (event.key === " " && !inControl && skipRef.current) {
        event.preventDefault();
        skipRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, stop]);

  const start = useCallback(async () => {
    // Must run inside the button press, before any await: browsers only allow sound after a click.
    primeAudio();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;

    const say = async (text: string) => {
      if (!text || signal.aborted) return;
      setSaid(text);
      setStatus("speaking");
      await speakAndWait(text, signal);
    };

    /*
     * Ask a question and wait for the answer. The microphone is already on
     * while the question is being said, so the visitor can talk over it: the
     * guide stops speaking as soon as it hears them. Pressing Space, the
     * "Answer now" button, or typing an answer also cuts the question short.
     */
    const ask = (prompt: string) =>
      new Promise<ListenResult>((resolve) => {
        let settled = false;
        let doneTalking = false;
        let interrupted = false;
        const talking = new AbortController();
        const barge = new AbortController();
        const listening = new AbortController();

        const finish = (result: ListenResult) => {
          if (settled) return;
          settled = true;
          talking.abort();
          barge.abort();
          listening.abort();
          typedRef.current = null;
          skipRef.current = null;
          signal.removeEventListener("abort", onStop);
          resolve(result);
        };
        const onStop = () => finish({ problem: "stopped" });
        signal.addEventListener("abort", onStop, { once: true });

        typedRef.current = (text) => finish({ text, alternatives: [text] });
        if (pendingTyped.current) {
          const text = pendingTyped.current;
          pendingTyped.current = null;
          return finish({ text, alternatives: [text] });
        }
        // Space or "Answer now": stop talking and go straight to listening.
        skipRef.current = () => talking.abort();

        const interrupt = (heard: string) => {
          if (interrupted) return;
          interrupted = true;
          talking.abort();
          setStatus("listening");
          setHeard(heard);
        };

        // Listen while the question is being said. The microphone also hears
        // the guide's own voice, so words that match the question are ignored.
        const listenOverQuestion = async (): Promise<ListenResult | null> => {
          while (!settled && !doneTalking && !interrupted) {
            const r = await listenOnce({
              signal: barge.signal,
              tone: false,
              // Two or more words that are not the guide's own: the visitor is talking.
              onInterim: (t) => t.split(/\s+/).length >= 2 && !isEcho(t, prompt) && interrupt(t),
            });
            if (settled) return null;
            if ("text" in r) {
              // A short answer ("yes", "two") only counts once it is a finished result of its own.
              if (interrupted || isShortAnswer(r.text) || !isEcho(r.text, prompt)) {
                interrupt(r.text);
                return r;
              }
              continue; // It was the guide's own voice: keep listening.
            }
            if (r.problem === "blocked" || r.problem === "network" || r.problem === "unsupported") return r;
            if (interrupted) return null;
          }
          return null;
        };

        setSaid(prompt);
        setHeard("");
        setStatus("speaking");
        const overQuestion = listenOverQuestion();

        void (async () => {
          await speakAndWait(prompt, talking.signal);
          doneTalking = true;
          if (settled) return;
          if (!interrupted) barge.abort();
          const early = await overQuestion;
          if (settled) return;
          if (early) return finish(early);
          // The question has been said in full (or skipped): the visitor's turn, after the tone.
          setStatus("listening");
          finish(await listenOnce({ signal: listening.signal, onInterim: setHeard }));
        })();
      });

    /*
     * Paused: say why, then keep listening without the tone until the visitor
     * says "carry on". Anything else heard is ignored, so a conversation in
     * the room does not move the booking on. True means carry on.
     */
    const pause = async (message: string): Promise<boolean> => {
      await say(message);
      const until = Date.now() + PAUSE_LIMIT_MS;
      // The "Carry on" button: stop the quiet listening and resume.
      let resumed = false;
      let listening = new AbortController();
      resumeRef.current = () => {
        resumed = true;
        listening.abort();
      };
      const onStop = () => listening.abort();
      signal.addEventListener("abort", onStop, { once: true });
      try {
        while (!signal.aborted && !resumed && Date.now() < until) {
          setStatus("paused");
          listening = new AbortController();
          const r = await listenOnce({ signal: listening.signal, tone: false, onInterim: setHeard });
          if (signal.aborted) return false;
          if (resumed) return true;
          if ("problem" in r) {
            if (r.problem !== "no-speech") return false;
            // Some browsers give up on silence at once; do not spin the microphone on and off.
            await wait(300);
            continue;
          }
          setHeard(r.text);
          if (isTurnOff(r.text)) {
            await say("Voice booking is off. Your answers are kept on this page.");
            return false;
          }
          if (isResume(r.text)) return true;
        }
        if (resumed) return true;
      } finally {
        resumeRef.current = null;
        signal.removeEventListener("abort", onStop);
      }
      if (!signal.aborted) await say("Voice booking has turned off. Your answers are kept. Press Start voice booking to carry on.");
      return false;
    };
    const PAUSED_HELP = "Say carry on when you are ready, or say turn off.";

    const asked = new Set<string>();
    let silences = 0;
    let lastKey = "";
    let stuck = 0;
    let notHeard = false;
    let lastProblem: string | null = null;

    // Said before the next question, as part of it, so it can be talked over too:
    // first the greeting, later the read-back of the last answer.
    let carry = "Hello. I'll ask a few short questions. Answer after the beep, or just start talking. Say stop to pause.";

    while (!signal.aborted) {
      const c = contextRef.current;

      if (c.reference) {
        await say(
          `${carry} Your request has been sent. Your reference is ${spellOut(c.reference)}. We will call you to confirm who is coming and the final price.${supabaseConfigured ? "" : " This is a demo, so for now nobody will actually call."}`,
        );
        break;
      }

      // Say a new problem from the form (the request was refused, say) before asking again.
      if (c.problem && c.problem !== lastProblem) carry = [carry, c.problem].filter(Boolean).join(" ");
      lastProblem = c.problem;

      const question = nextQuestion(c, asked);
      if (question.key === "advance-2") {
        // Moving on is the form's job; if it keeps refusing, stop rather than loop.
        if (++stuck >= 3) {
          await say("Something on the form needs checking. Please ask someone to look at the screen, or call us. Your answers are kept.");
          break;
        }
        c.next();
        await wait(150);
        continue;
      }
      stuck = 0;
      const prompt = question.key === lastKey && question.short ? question.short : question.prompt;
      setAsking(question.key);
      const result = await ask([carry, notHeard ? "Sorry, I did not hear anything." : "", prompt].filter(Boolean).join(" "));
      carry = "";
      notHeard = false;
      if (signal.aborted) break;

      if ("problem" in result) {
        if (result.problem === "unsupported") {
          await say("Voice booking does not work in this browser. Please try Chrome or Edge, or fill in the form.");
          break;
        }
        if (result.problem === "blocked") {
          await say("I cannot use the microphone. Please allow microphone access for this site, then press Start voice booking again.");
          break;
        }
        if (result.problem === "network") {
          await say("Voice booking needs an internet connection to understand speech, and it cannot reach the service right now. Please fill in the form, or call us.");
          break;
        }
        if (result.problem === "stopped") break;
        silences += 1;
        notHeard = true;
        if (silences >= 3) {
          if (!(await pause(`I have not heard anything, so I have paused. Your answers are kept. ${PAUSED_HELP}`))) break;
          silences = 0;
          notHeard = false;
          lastKey = "";
          carry = "Carrying on.";
          continue;
        }
        lastKey = question.key;
        continue;
      }

      silences = 0;
      const text = result.text;
      setHeard(text);

      // Safety first: a gas smell is an emergency, not a booking.
      if (result.alternatives.some((alt) => GAS_EMERGENCY.test(alt))) {
        await say(services.find((s) => s.slug === "gas")?.notice ?? "Call the National Gas Emergency Service on 0800 111 999 now.");
        break;
      }

      if (isStop(text)) {
        if (!(await pause(`Paused. Your answers are kept. ${PAUSED_HELP}`))) break;
        lastKey = "";
        carry = "Carrying on.";
        continue;
      }

      // The recogniser often mishears, so try each of its guesses in turn.
      let reply: string | null = null;
      for (const alt of result.alternatives) {
        reply = question.answer(alt);
        if (reply !== null) {
          setHeard(alt);
          break;
        }
      }
      if (reply !== null) {
        lastKey = "";
        carry = reply;
        // Let the form re-render with the new answer before deciding what is next.
        await wait(120);
        continue;
      }

      if (isBack(text) && c.draft.step > 0) {
        c.goTo(c.draft.step - 1);
        lastKey = "";
        carry = "Going back.";
        await wait(120);
        continue;
      }

      if (isRepeat(text)) {
        lastKey = "";
        continue;
      }

      carry = `Sorry, I did not understand "${text}".`;
      lastKey = question.key;
    }

    if (controllerRef.current === controller) {
      controllerRef.current = null;
      setStatus("off");
      setAsking("");
    }
  }, []);

  return { status, said, heard, asking, start, stop, resume, answerByText, skipToAnswer };
}
