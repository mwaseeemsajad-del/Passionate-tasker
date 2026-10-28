/*
 * The voice booking as the help assistant sees it. The booking form runs the
 * conversation and publishes its state here; the assistant in the corner
 * shows it, so a visitor who started with the assistant keeps one place to
 * look and one Stop button while the booking questions are asked.
 */

export type VoiceSession = {
  status: "off" | "speaking" | "listening" | "paused";
  /** "Step 1 of 4: The job". */
  step: string;
  said: string;
  heard: string;
  stop: () => void;
  resume: () => void;
};

const noop = () => {};
export const NO_SESSION: VoiceSession = { status: "off", step: "", said: "", heard: "", stop: noop, resume: noop };

let current = NO_SESSION;
const listeners = new Set<() => void>();

export function publishVoiceSession(next: VoiceSession) {
  current = next;
  listeners.forEach((l) => l());
}

export const subscribeVoiceSession = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export const getVoiceSession = () => current;
export const getServerVoiceSession = () => NO_SESSION;
