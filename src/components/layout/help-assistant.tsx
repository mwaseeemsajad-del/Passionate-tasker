"use client";

import { ArrowLeft, Headset, Mic, Square, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Button, Switch } from "@/components/ui";
import { assistant } from "@/data/assistant";
import { getService } from "@/data/services";
import { understandRequest, type HelpIntent } from "@/features/assistant/understand";
import { cn } from "@/lib/cn";
import { setHighContrast, setLargeText } from "@/lib/display-prefs";
import { canSpeak, getSpeechRecognition, listenOnce, primeAudio, speakAndWait, stopSpeaking } from "@/lib/speech";
import { getServerVoiceSession, getVoiceSession, subscribeVoiceSession } from "@/lib/voice-session";
import { DisplayToggles } from "./display-settings";

/*
 * The help assistant in the bottom-right corner of every public page. A short
 * spoken conversation, for people who cannot see the screen: it asks what the
 * visitor needs, listens after a beep, and does it for them. It books (by
 * handing over to the voice booking on /book), answers questions about prices
 * and checks, turns on larger text or high contrast, and opens pages. Then it
 * asks "Anything else?" and listens again. Scripted, not AI: the words it
 * understands are in src/features/assistant/understand.ts, what it says is in
 * src/data/assistant.ts. Every answer is also on screen as buttons.
 *
 * - Opens by itself once per visit, small, without taking focus. Not on
 *   /book, where the voice booking does the talking. Once open it stays open
 *   from page to page until Close, Escape or "goodbye", because someone who
 *   cannot see the screen relies on it. While the voice booking runs, it
 *   shows the booking's step, question and Stop.
 * - Browsers only allow speech after a click or key press, so the greeting
 *   starts on the visitor's first one.
 * - Not a modal: the page stays usable. Stop is always there while it talks
 *   or listens, Escape and Close put it away, and once closed with Close it no
 *   longer opens by itself.
 */

const CLOSED_KEY = "pt-helper"; // localStorage "closed": closed with Close, so it waits to be asked
const VOICE_KEY = "pt-helper-voice"; // localStorage "off": reading aloud turned off
const SHOWN_KEY = "pt-helper-shown"; // sessionStorage "1": already opened by itself this visit
const SERVER = "server";

type Status = "idle" | "speaking" | "listening";

// The choices live in browser storage, read as an external store so the
// server render (helper closed) matches the first browser render.
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
const store = (kind: "local" | "session") => (kind === "local" ? localStorage : sessionStorage);
function read(kind: "local" | "session", key: string) {
  try {
    return store(kind).getItem(key) ?? "";
  } catch {
    return "";
  }
}
function write(kind: "local" | "session", key: string, value: string, notify = true) {
  try {
    store(kind).setItem(key, value);
  } catch {
    // Private mode: the choice lasts until the page is left.
  }
  if (notify) listeners.forEach((l) => l());
}
const useStored = (kind: "local" | "session", key: string) => useSyncExternalStore(subscribe, () => read(kind, key), () => SERVER);
// "Opened by itself this visit". The store reads it on every render, so it is
// only marked once the helper is put away or the page is being left;
// otherwise the helper would close on the page it just opened on.
const markShown = () => write("session", SHOWN_KEY, "1", false);

export function HelpAssistant() {
  const path = usePathname();
  const router = useRouter();
  const closedPref = useStored("local", CLOSED_KEY);
  const voicePref = useStored("local", VOICE_KEY);
  const shown = useStored("session", SHOWN_KEY);
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [heard, setHeard] = useState("");
  const [seenPath, setSeenPath] = useState(path);
  const booking = useSyncExternalStore(subscribeVoiceSession, getVoiceSession, getServerVoiceSession);

  const panelId = useId();
  const titleId = useId();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const answerRef = useRef<HTMLHeadingElement>(null);
  const talk = useRef<AbortController | null>(null);
  const navTargetRef = useRef<string | null>(null);
  const lastSaid = useRef<string>(assistant.greeting);
  const greeted = useRef(false);
  // Where focus goes after the next render; null leaves it where it is.
  const focusNext = useRef<"title" | "answer" | string | null>(null);

  const autoOpen = closedPref !== SERVER && closedPref !== "closed" && shown !== "1" && path !== "/book";
  const open = userOpen ?? autoOpen;

  // A new page: an open helper stays open, because someone who cannot see the
  // screen relies on it; only Close, Escape or "goodbye" put it away.
  if (path !== seenPath) {
    setSeenPath(path);
    setTopicId(null);
    if (open) setUserOpen(true);
  }
  const topic = assistant.topics.find((t) => t.id === topicId) ?? null;
  // Opened by itself, it stays small so it covers little of the page until asked.
  const full = expanded || topic !== null;
  const busy = status !== "idle";
  const bookingLive = booking.status !== "off";

  const stopTalking = () => {
    talk.current?.abort();
    talk.current = null;
    stopSpeaking();
  };

  /* ---- Doing what was asked ---- */

  /** Carry out one request. Returns what to say next, then listens again, or null when the conversation is over. */
  const act = async (intent: HelpIntent, say: (text: string) => Promise<void>): Promise<string | null> => {
    switch (intent.kind) {
      case "close":
        await say(assistant.goodbye);
        setUserOpen(false);
        markShown();
        return null;
      case "repeat":
        return lastSaid.current;
      case "options":
        return assistant.options;
      case "text":
        setLargeText(intent.on);
        return intent.on ? assistant.textOn : assistant.textOff;
      case "contrast":
        setHighContrast(intent.on);
        return intent.on ? assistant.contrastOn : assistant.contrastOff;
      case "topic": {
        const t = assistant.topics.find((x) => x.id === intent.id);
        setTopicId(intent.id);
        return t ? (t.spoken ?? t.answer) : assistant.options;
      }
      case "price": {
        const service = intent.trade ? getService(intent.trade) : null;
        setTopicId("price");
        return service ? assistant.tradePrice(service) : assistant.topics.find((x) => x.id === "price")!.answer;
      }
      case "go":
        if (intent.href === path) return assistant.goTo(intent.name);
        navTargetRef.current = intent.href;
        router.push(intent.href);
        return assistant.goTo(intent.name);
      case "book": {
        // The voice booking on /book asks the questions from here, with the
        // trade already chosen; this panel stays open and follows it.
        await say(assistant.bookHandoff);
        router.push(`/book?voice=start${intent.trade ? `&trade=${intent.trade}` : ""}${intent.job ? `&job=${intent.job}` : ""}`);
        return null;
      }
    }
  };

  /**
   * Say something, then listen and act, until the visitor is done. Called
   * from a click or key press, which browsers need before allowing sound.
   */
  const converse = async (opening: string) => {
    stopTalking();
    // Talking to it keeps it open on every page until it is closed.
    setUserOpen(true);
    if (voicePref === "off" || !canSpeak()) return;
    primeAudio();
    const controller = new AbortController();
    talk.current = controller;
    const { signal } = controller;
    const say = async (text: string) => {
      if (signal.aborted) return;
      setStatus("speaking");
      await speakAndWait(text, signal);
    };

    let prompt = opening;
    let misses = 0;
    try {
      while (!signal.aborted) {
        await say(prompt);
        if (signal.aborted) break;
        if (!getSpeechRecognition()) {
          await say(assistant.noMic);
          break;
        }
        setHeard("");
        setStatus("listening");
        const result = await listenOnce({ signal, onInterim: setHeard });
        if (signal.aborted) break;

        if ("problem" in result) {
          if (result.problem === "stopped") break;
          if (result.problem !== "no-speech") {
            await say(assistant.noMic);
            break;
          }
          // Two silences in a row: stop, rather than keep the microphone on.
          if (++misses >= 2) {
            await say(assistant.givingUp);
            break;
          }
          prompt = `${assistant.notHeard} ${assistant.options}`;
          continue;
        }

        misses = 0;
        setHeard(result.text);
        const intent = understandRequest(result.alternatives);
        if (!intent) {
          prompt = `${assistant.notUnderstood} ${assistant.options}`;
          continue;
        }
        const reply = await act(intent, say);
        if (reply === null) break;
        if (intent.kind !== "repeat") lastSaid.current = reply;
        prompt = intent.kind === "options" || intent.kind === "repeat" ? reply : `${reply} ${assistant.followUp}`;
      }
    } finally {
      if (talk.current === controller) talk.current = null;
      if (!talk.current) setStatus("idle");
    }
  };

  // Start the conversation on the first click or key press, if the helper opened by itself.
  useEffect(() => {
    if (!open || userOpen !== null || greeted.current || voicePref === "off") return;
    const greet = () => {
      greeted.current = true;
      void converse(assistant.greeting);
    };
    window.addEventListener("pointerdown", greet, { capture: true, once: true });
    window.addEventListener("keydown", greet, { capture: true, once: true });
    return () => {
      window.removeEventListener("pointerdown", greet, { capture: true });
      window.removeEventListener("keydown", greet, { capture: true });
    };
    // converse() is recreated every render; the listener only needs the latest one once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userOpen, voicePref]);

  // Leaving the page counts as having seen the helper, so it does not open again this visit.
  useEffect(() => {
    window.addEventListener("pagehide", markShown);
    return () => window.removeEventListener("pagehide", markShown);
  }, []);

  // Never keep talking over a page the visitor chose; carry on where the assistant took them.
  const lastPath = useRef(path);
  useEffect(() => {
    // Only a real change of page: effects also re-run on the same page.
    if (lastPath.current === path) return;
    lastPath.current = path;
    if (navTargetRef.current === path) {
      navTargetRef.current = null;
      return;
    }
    markShown();
    // Only the helper's own talk: the new page may be speaking already (the voice booking).
    talk.current?.abort();
    talk.current = null;
  }, [path]);

  useEffect(() => () => talk.current?.abort(), []);

  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "title") titleRef.current?.focus();
    else if (target === "answer") answerRef.current?.focus();
    else if (target) document.getElementById(target)?.focus();
  });

  /* ---- Buttons ---- */

  const openHelper = () => {
    greeted.current = true;
    setUserOpen(true);
    setExpanded(true);
    focusNext.current = "title";
    void converse(assistant.greeting);
  };

  const close = () => {
    stopTalking();
    setUserOpen(false);
    markShown();
    write("local", CLOSED_KEY, "closed");
    launcherRef.current?.focus();
  };

  const choose = (id: string) => {
    const next = assistant.topics.find((t) => t.id === id);
    if (!next) return;
    setTopicId(id);
    focusNext.current = "answer";
    const answer = next.spoken ?? next.answer;
    lastSaid.current = answer;
    void converse(`${answer} ${assistant.followUp}`);
  };

  const back = () => {
    stopTalking();
    focusNext.current = topicId ? `${panelId}-${topicId}` : "title";
    setTopicId(null);
    setExpanded(true);
  };

  const showQuestions = () => {
    setExpanded(true);
    focusNext.current = `${panelId}-${assistant.topics[0].id}`;
  };

  const setVoice = (on: boolean) => {
    if (!on) stopTalking();
    write("local", VOICE_KEY, on ? "on" : "off");
  };

  const quiet = "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 font-medium text-ink hover:border-ink";

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <aside
          id={panelId}
          aria-labelledby={titleId}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          // Short enough to leave the page header (Display, Menu) in view.
          className="grid max-h-[min(36rem,calc(100dvh-11rem))] w-[min(24rem,calc(100vw-2rem))] gap-4 overflow-y-auto rounded-xl border border-line bg-white p-5 text-ink shadow-[0_12px_40px_-12px_rgb(15_17_15/0.35)]"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-h4 outline-none">
              {assistant.title}
            </h2>
            <button type="button" onClick={close} aria-label="Close the helper" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-accent-50">
              <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          {busy && !bookingLive && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={stopTalking} className={cn(quiet, "border-ink")}>
                <Square aria-hidden="true" className="size-4" strokeWidth={1.5} />
                Stop
              </button>
              {/* For anyone helping who can see the screen; the beep tells everyone else. */}
              {status === "listening" && (
                <p className="flex items-center gap-2 font-semibold">
                  <Mic aria-hidden="true" className="size-5" strokeWidth={1.5} />
                  Listening{heard ? `: “${heard}”` : "…"}
                </p>
              )}
            </div>
          )}

          {bookingLive ? (
            // The booking form is asking the questions; follow it here. Not announced:
            // the questions are already being spoken.
            <div className="grid gap-3">
              <h3 className="text-lg font-semibold">Booking by voice</h3>
              <p className="text-[0.9375rem] font-medium text-text-3">{booking.step}</p>
              {booking.said && <p className="text-text-2">{booking.said}</p>}
              {booking.status === "listening" && (
                <p className="flex items-center gap-2 font-semibold">
                  <Mic aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.5} />
                  Listening{booking.heard ? `: “${booking.heard}”` : "…"}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {booking.status === "paused" && (
                  <Button onClick={booking.resume} className="w-fit">
                    Carry on
                  </Button>
                )}
                <button type="button" onClick={booking.stop} className={cn(quiet, "border-ink")}>
                  <Square aria-hidden="true" className="size-4" strokeWidth={1.5} />
                  Stop booking by voice
                </button>
              </div>
            </div>
          ) : topic ? (
            <div className="grid gap-4">
              <button type="button" onClick={back} className={cn(quiet, "w-fit")}>
                <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
                Other questions
              </button>
              <h3 ref={answerRef} tabIndex={-1} className="text-lg font-semibold outline-none">
                {topic.question}
              </h3>
              <p className="text-text-2">{topic.answer}</p>
              {topic.display && <DisplayToggles idPrefix="helper" />}
              {topic.link && (
                <Button href={topic.link.href} variant="outline" className="w-fit">
                  {topic.link.label}
                </Button>
              )}
            </div>
          ) : !full ? (
            <div className="grid gap-4">
              <p className="text-text-2">{assistant.intro}</p>
              <Button onClick={showQuestions} className="w-fit">
                Show questions
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <p className="text-text-2">{assistant.greetingText}</p>
              <ul className="grid gap-2">
                {assistant.topics.map((t) => (
                  <li key={t.id}>
                    <button
                      id={`${panelId}-${t.id}`}
                      type="button"
                      onClick={() => choose(t.id)}
                      className="flex min-h-11 w-full cursor-pointer items-center rounded-lg border border-line bg-white px-4 py-2 text-left font-medium hover:border-ink"
                    >
                      {t.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {full && canSpeak() && (
            <div className="border-t border-line pt-4">
              <Switch id={`${panelId}-voice`} label="Talk to me" description="Read answers aloud and listen for what you say." checked={voicePref !== "off"} onChange={setVoice} />
            </div>
          )}
        </aside>
      )}

      <button
        ref={launcherRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={open ? close : openHelper}
        // The white ring keeps it visible over the dark footer.
        className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-5 font-medium text-white shadow-[0_12px_40px_-12px_rgb(15_17_15/0.5)] ring-2 ring-white"
      >
        <Headset aria-hidden="true" className="size-5" strokeWidth={1.5} />
        {open ? "Close help" : "Help"}
      </button>
    </div>
  );
}
