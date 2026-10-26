"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HeroVideo } from "@/data/videos";
import { cn } from "@/lib/cn";

/*
 * Background videos for the hero: a few short clips of tradespeople at work,
 * one after another, fading between them, round and round.
 *
 * - Decorative and silent: muted, hidden from screen readers, never focusable.
 * - The hero photo underneath stays visible until a clip is actually playing,
 *   so a slow connection shows the photo, never a black box.
 * - WCAG 2.2.2: anything moving for more than five seconds needs a way to stop
 *   it, so there is a Pause button, and the choice is remembered.
 * - Nothing plays for people who ask for reduced motion or to save data.
 */

/** Each clip plays for at most this long before the next one. */
const CLIP_SECONDS = 9;
const PAUSE_KEY = "pt-hero-video-paused";

const noop = () => () => {};
/** False on the server and during hydration, true once running in the browser. */
const useInBrowser = () => useSyncExternalStore(noop, () => true, () => false);

export function HeroVideo({ videos }: { videos: HeroVideo[] }) {
  const inBrowser = useInBrowser();
  const reduce = useReducedMotion();
  if (!inBrowser || reduce || videos.length === 0) return null;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) return null;
  return <Player videos={videos} />;
}

function Player({ videos }: { videos: HeroVideo[] }) {
  const [active, setActive] = useState(0);
  // Which clips have started playing at least once, so they can fade in over the photo.
  const [started, setStarted] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem(PAUSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  const playable = videos.map((_, i) => i).filter((i) => !failed.has(i));
  const next = () => {
    const pos = playable.indexOf(active);
    setActive(playable[(pos + 1) % playable.length] ?? 0);
  };

  // Play the active clip from the start; keep the others still.
  useEffect(() => {
    refs.current.forEach((video, i) => {
      if (!video) return;
      if (i !== active) {
        video.pause();
        return;
      }
      if (paused) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    });
  }, [active, paused]);

  const togglePause = () => {
    setPaused((p) => {
      try {
        localStorage.setItem(PAUSE_KEY, p ? "0" : "1");
      } catch {
        /* Storage blocked: the choice lasts for this page only. */
      }
      return !p;
    });
  };

  if (playable.length === 0) return null;

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0">
        {videos.map((v, i) => (
          <video
            key={v.src}
            ref={(el) => {
              refs.current[i] = el;
            }}
            src={v.src}
            muted
            playsInline
            // The active clip and the one after it load; the rest wait.
            preload={i === active || i === playable[(playable.indexOf(active) + 1) % playable.length] ? "auto" : "none"}
            tabIndex={-1}
            onPlaying={() => setStarted((s) => (s.has(i) ? s : new Set(s).add(i)))}
            onTimeUpdate={(e) => {
              // Backup for onPlaying, which can fire before React is listening.
              if (!started.has(i) && e.currentTarget.currentTime > 0) setStarted((s) => new Set(s).add(i));
              if (i === active && e.currentTarget.currentTime >= CLIP_SECONDS) {
                e.currentTarget.currentTime = 0;
                next();
              }
            }}
            onEnded={(e) => {
              e.currentTarget.currentTime = 0;
              if (i === active) next();
            }}
            onError={() => {
              setFailed((f) => new Set(f).add(i));
              if (i === active) next();
            }}
            className={cn(
              "absolute inset-0 size-full object-cover object-[70%_center] transition-opacity duration-1000 ease-soft",
              i === active && started.has(i) ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={togglePause}
        aria-pressed={paused}
        className="absolute right-4 bottom-4 z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/40 bg-ink/60 px-4 text-[0.9375rem] font-medium text-white backdrop-blur-sm transition-colors hover:border-accent hover:text-accent sm:right-6 sm:bottom-6"
      >
        {paused ? <Play aria-hidden="true" className="size-4" strokeWidth={2} /> : <Pause aria-hidden="true" className="size-4" strokeWidth={2} />}
        {paused ? "Play background video" : "Pause background video"}
      </button>
    </>
  );
}
