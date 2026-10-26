"use client";

import { Mic, Square } from "lucide-react";
import { useState, type Ref } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/cn";
import type { GuideStatus } from "../voice-guide";

type VoicePanelProps = {
  status: GuideStatus;
  said: string;
  heard: string;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
  /** An answer typed instead of spoken. */
  onType: (text: string) => void;
  /** Cut the question short and listen now. */
  onSkip: () => void;
  startRef?: Ref<HTMLButtonElement>;
};

/*
 * The "Book by voice" control. Large, high contrast and first on the page, so
 * a low-vision visitor finds it before the form. The words spoken and heard
 * are shown for anyone helping, but not announced by screen readers: the
 * guide is already speaking, and two voices at once is worse than one.
 */
export function VoicePanel({ status, said, heard, supported, onStart, onStop, onType, onSkip, startRef }: VoicePanelProps) {
  const active = status !== "off";
  const [typed, setTyped] = useState("");

  return (
    <section aria-labelledby="voice-title" className="on-dark grid gap-5 rounded-xl bg-ink p-6 text-white sm:p-8">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-ink">
          <Mic className="size-6" strokeWidth={1.75} />
        </span>
        <div className="grid gap-1.5">
          <h2 id="voice-title" className="text-h3">
            Book by voice
          </h2>
          <p className="text-on-ink-2">
            Can’t see the screen well? Press the button and talk. We ask one question at a time, read every answer back, and fill in
            the form for you.
          </p>
        </div>
      </div>

      {supported ? (
        <>
          {active ? (
            <div className="flex flex-wrap gap-3">
              {status === "speaking" && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-6 text-h4 font-semibold text-ink"
                >
                  <Mic aria-hidden="true" className="size-5" strokeWidth={2} />
                  Answer now
                </button>
              )}
              <button
                type="button"
                onClick={onStop}
                className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-full bg-white px-6 text-h4 font-semibold text-ink"
              >
                <Square aria-hidden="true" className="size-5" fill="currentColor" strokeWidth={0} />
                Stop voice booking
              </button>
            </div>
          ) : (
            <button
              ref={startRef}
              type="button"
              onClick={onStart}
              className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-6 text-h4 font-semibold text-ink transition-colors hover:bg-accent-100 sm:w-auto sm:justify-self-start"
            >
              <Mic aria-hidden="true" className="size-5" strokeWidth={2} />
              {said ? "Carry on by voice" : "Start voice booking"}
            </button>
          )}

          <p className="text-[0.9375rem] text-on-ink-3">
            You don’t have to wait: start talking and we stop to listen. Or press <b className="text-white">Space</b> to answer now. Say{" "}
            <b className="text-white">stop</b>, <b className="text-white">go back</b> or <b className="text-white">repeat</b> at any time, or press
            Escape. Your browser will ask to use the microphone the first time.
          </p>

          {(active || said) && (
            <div aria-live="off" className="grid gap-3 rounded-lg border border-ink-line bg-ink-surface p-5">
              <p className="flex items-center gap-2.5 text-sm font-semibold">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 rounded-full",
                    status === "listening" && "animate-pulse bg-accent motion-reduce:animate-none",
                    status === "speaking" && "bg-white",
                    status === "off" && "bg-on-ink-3",
                  )}
                />
                {status === "listening" ? "Listening: say your answer now" : status === "speaking" ? "Speaking: talk any time to answer" : "Paused"}
              </p>
              {said && (
                <p className="text-body text-white">
                  <span className="text-on-ink-3">We said: </span>
                  {said}
                </p>
              )}
              {heard && (
                <p className="text-body text-accent-100">
                  <span className="text-on-ink-3">We heard: </span>
                  {heard}
                </p>
              )}
            </div>
          )}

          {active && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onType(typed);
                setTyped("");
              }}
              className="grid gap-2"
            >
              <label htmlFor="voice-typed" className="text-[0.9375rem] font-semibold">
                Not understood? Type your answer instead
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="voice-typed"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="min-h-12 min-w-0 flex-1 basis-56 rounded-md border border-ink-line bg-white px-4 text-body text-ink"
                />
                <button type="submit" className="min-h-12 cursor-pointer rounded-full bg-white px-6 font-semibold text-ink">
                  Send answer
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <p className="rounded-lg border border-ink-line bg-ink-surface p-5 text-on-ink-2">
          Voice booking needs Chrome or Edge on a computer or an Android phone. You can fill in the form below, or call us on{" "}
          <a href={site.phone.href} className="font-semibold text-white underline underline-offset-4">
            {site.phone.display}
          </a>{" "}
          ({site.supportHours}) and we will book it for you.
        </p>
      )}
    </section>
  );
}
