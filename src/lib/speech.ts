/**
 * Browser speech helpers: dictation in, spoken replies out.
 *
 * Both APIs are progressive enhancements. Everything they do can also be done
 * by typing and reading, so a browser without them loses convenience, never
 * capability. Neither is in the TypeScript DOM lib, hence the local shapes.
 *
 * Real browsers have well-known quirks, worked around here:
 * - Chrome drops `onend` if the utterance object is garbage collected, so we
 *   keep a reference until it finishes.
 * - Chrome cuts off long utterances (about 15 seconds) and never fires `onend`,
 *   so text is spoken one sentence at a time, each with a watchdog timer.
 * - `cancel()` straight before `speak()` can make Chrome drop the new
 *   utterance, so we only cancel when something is actually speaking, and
 *   leave a short gap after it.
 * - Recognition is NOT run in continuous mode: tested with a real microphone
 *   in Chrome on Windows (17 Oct 2026), continuous mode froze after three or
 *   four words and never produced a final result. Single-answer mode finished
 *   cleanly. A slowly spelt postcode that gets cut short is asked for again.
 * - Recognition often mishears ("plumber" heard as "plant" or "flower"), so we
 *   ask for several guesses and the voice guide tries each one.
 */

/** Minimal shape of the Web Speech API's recogniser. */
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  start(): void;
  stop(): void;
  abort?(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event?: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
}

type SpeechCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognition(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** True when the browser can both listen and talk, so a voice booking can run. */
export function canUseVoice(): boolean {
  return canSpeak() && getSpeechRecognition() !== null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---- Speaking ---- */

// Utterances still speaking. Holding them stops Chrome losing their onend.
const live = new Set<SpeechSynthesisUtterance>();

let chosenVoice: SpeechSynthesisVoice | null | undefined;

/**
 * A British English voice if the device has one. Never waits: if the voice
 * list has not loaded yet, this sentence uses the browser's default for
 * en-GB, and the list is picked up for the next one.
 */
function britishVoice(): SpeechSynthesisVoice | null {
  if (chosenVoice) return chosenVoice;
  const synth = window.speechSynthesis;
  if (typeof synth.getVoices !== "function") return null;
  const voices = synth.getVoices();
  if (voices.length === 0) {
    synth.addEventListener?.("voiceschanged", () => (chosenVoice = undefined), { once: true });
    return null;
  }
  const gb = voices.filter((v) => v.lang?.toLowerCase().replace("_", "-") === "en-gb");
  // Prefer natural-sounding voices where the browser offers them.
  chosenVoice = gb.find((v) => /natural|neural|online|google/i.test(v.name)) ?? gb[0] ?? voices.find((v) => v.lang?.startsWith("en")) ?? null;
  return chosenVoice;
}

/** Split text into sentences, so no single utterance is long enough for Chrome to cut it off. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Say one sentence and resolve when it has finished, been stopped, or clearly stalled. */
function speakOne(text: string, voice: SpeechSynthesisVoice | null, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    if (voice) utterance.voice = voice;
    // Slower than the default: these words are listened to, not skimmed.
    utterance.rate = 0.9;

    let settled = false;
    // About 0.5s a word at this rate, plus slack. If onend never comes, carry on anyway.
    const watchdog = setTimeout(finish, 3000 + text.split(/\s+/).length * 550);
    function finish() {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      live.delete(utterance);
      signal?.removeEventListener("abort", finish);
      resolve();
    }
    utterance.onend = finish;
    utterance.onerror = finish;
    signal?.addEventListener("abort", finish, { once: true });

    live.add(utterance);
    synth.resume?.(); // Chrome can be left paused after a tab switch.
    synth.speak(utterance);
  });
}

/** Stop anything being said right now. */
export function stopSpeaking() {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending || live.size > 0) synth.cancel();
  live.clear();
}

/** Speak and resolve once everything has been said, or it was stopped. */
export async function speakAndWait(text: string, signal?: AbortSignal): Promise<void> {
  if (!canSpeak() || signal?.aborted || !text.trim()) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) {
    synth.cancel();
    await wait(60);
  }
  const voice = britishVoice();
  for (const sentence of sentences(text)) {
    if (signal?.aborted) break;
    await speakOne(sentence, voice, signal);
  }
  if (signal?.aborted) stopSpeaking();
}

/* ---- The "your turn" tone ---- */

let audio: AudioContext | null = null;

/**
 * Prepare sound for the listening tone. Browsers only allow audio after a
 * click or key press, so call this from the button that starts the voice guide.
 */
export function primeAudio() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audio ??= new Ctor();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

/** A short soft rising tone that says "speak now", so nobody has to watch the screen. */
async function playTone() {
  if (!audio || audio.state !== "running") return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.linearRampToValueAtTime(880, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.2);
  await wait(220);
}

/* ---- Telling the guide's own voice apart from the visitor's ---- */

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

/**
 * True when what the microphone heard is most likely the guide's own voice
 * coming back through the speakers: at least 80% of the words heard are words
 * the guide is saying. Used so the guide does not interrupt itself. Questions
 * must not contain example answers, or a visitor repeating the example would
 * be taken for an echo.
 */
export function isEcho(heard: string, beingSaid: string): boolean {
  const said = new Set(words(beingSaid));
  const got = words(heard);
  if (got.length === 0) return true;
  const fromGuide = got.filter((w) => said.has(w)).length;
  return fromGuide / got.length >= 0.8;
}

/* ---- Listening ---- */

/** Why listening produced no words. */
export type ListenProblem = "unsupported" | "blocked" | "no-speech" | "network" | "stopped";

/** What was heard: the best guess first, then the recogniser's other guesses. */
export type ListenResult = { text: string; alternatives: string[] } | { problem: ListenProblem };

type ListenOptions = {
  signal?: AbortSignal;
  onInterim?: (text: string) => void;
  /** Play the "your turn" tone first. Off when listening while the guide is still talking. */
  tone?: boolean;
};

/**
 * Listen for one spoken answer, after a short tone. The browser decides when
 * the answer has ended. `onInterim` receives the words as they are heard.
 */
export async function listenOnce({ signal, onInterim, tone = true }: ListenOptions = {}): Promise<ListenResult> {
  const Ctor = getSpeechRecognition();
  if (!Ctor) return { problem: "unsupported" };
  if (signal?.aborted) return { problem: "stopped" };

  if (tone) await playTone();
  if (signal?.aborted) return { problem: "stopped" };

  return new Promise((resolve) => {
    const recognition = new Ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    let guesses: string[] = [];
    let interim = "";
    let problem: ListenProblem | null = null;
    let ended = false;

    // Never leave the microphone on: one answer never takes 20 seconds.
    const capTimer = setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }, 20000);

    const onAbort = () => {
      problem = "stopped";
      if (recognition.abort) recognition.abort();
      else recognition.stop();
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    recognition.onresult = (event) => {
      const results = Array.from(event.results) as ArrayLike<{ transcript: string }>[];
      interim = results.map((r) => r[0].transcript).join(" ").trim();
      onInterim?.(interim);
      // Every guess for the latest result, with the earlier results in front of it.
      const before = results.slice(0, -1).map((r) => r[0].transcript).join(" ");
      const last = results[results.length - 1];
      guesses = Array.from(last)
        .map((alt) => `${before} ${alt.transcript}`.trim())
        .filter((g, i, all) => g && all.indexOf(g) === i);
    };
    recognition.onerror = (event) => {
      if (problem) return;
      const code = event?.error;
      problem =
        code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture"
          ? "blocked"
          : code === "network"
            ? "network"
            : code === "aborted"
              ? "stopped"
              : "no-speech";
    };
    recognition.onend = () => {
      if (ended) return;
      ended = true;
      clearTimeout(capTimer);
      signal?.removeEventListener("abort", onAbort);
      const best = guesses[0] ?? interim;
      if (problem === "stopped" || problem === "blocked" || problem === "network") resolve({ problem });
      else if (best) resolve({ text: best, alternatives: guesses.length ? guesses : [best] });
      else resolve({ problem: "no-speech" });
    };

    try {
      recognition.start();
    } catch {
      ended = true;
      clearTimeout(capTimer);
      signal?.removeEventListener("abort", onAbort);
      resolve({ problem: "blocked" });
    }
  });
}
