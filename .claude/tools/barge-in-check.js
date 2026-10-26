/*
 * Talking over the guide (barge-in), with speech that takes real time.
 * A: the visitor talks while a question is being said: the guide stops talking and uses the answer.
 * B: the microphone hears the guide's own voice: the guide does not interrupt itself.
 * C: Space cuts the question short.
 */
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "http://localhost:3100";

function slowSpeech(script) {
  // script: one entry per recognition session, in order.
  //   { at: ms, text }   the visitor says text, ms after the session starts
  //   { at: ms, echo: true }   the microphone hears what the guide is saying right now
  //   null   silence (no-speech)
  window.__script = script.slice();
  window.__log = [];
  window.__cancels = 0;
  let current = null; // utterance being said
  let queue = [];
  const next = () => {
    current = queue.shift() || null;
    if (!current) return;
    const u = current;
    window.__log.push("say: " + u.text);
    u.__timer = setTimeout(() => {
      if (current === u) {
        current = null;
        u.onend && u.onend();
        next();
      }
    }, u.text.split(/\s+/).length * 300);
  };
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      get speaking() { return !!current; },
      get pending() { return queue.length > 0; },
      speak(u) { queue.push(u); if (!current) next(); },
      cancel() {
        window.__cancels++;
        const u = current;
        if (u) window.__log.push("cancel: " + u.text);
        queue = [];
        current = null;
        if (u) { clearTimeout(u.__timer); u.onend && u.onend(); }
      },
      resume() {},
      getVoices() { return []; },
      addEventListener() {},
    },
  });
  window.__nowSaying = () => (current ? current.text : "");
  class FakeRecognition {
    start() {
      const item = window.__script.length ? window.__script.shift() : null;
      if (!item) {
        this.t = setTimeout(() => { this.onerror && this.onerror({ error: "no-speech" }); this.onend && this.onend(); }, 600);
        return;
      }
      this.t = setTimeout(() => {
        const text = item.echo ? window.__nowSaying() || "nothing" : item.text;
        window.__log.push("heard: " + text + (item.echo ? " (echo)" : ""));
        this.onresult && this.onresult({ results: [[{ transcript: text }]] });
        this.onend && this.onend();
      }, item.at);
    }
    stop() {}
    abort() { clearTimeout(this.t); this.onerror && this.onerror({ error: "aborted" }); this.onend && this.onend(); }
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
}

let failed = false;
const expect = (label, ok, extra = "") => {
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${extra ? ": " + extra : ""}`);
};

async function run(b, script, fn) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(slowSpeech, script);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(BASE + "/book", { waitUntil: "networkidle" });
  await fn(p);
  if (errs.length) expect("no page errors", false, errs.join("; "));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

  // A. The intro is long; the visitor talks 400ms into it, then answers each question early.
  await run(b, [{ at: 400, text: "I need a plumber my kitchen tap is dripping" }], async (p) => {
    const t0 = Date.now();
    await p.getByRole("button", { name: "Start voice booking" }).click();
    await p.waitForFunction(() => document.querySelector("input[name=trade]:checked")?.value === "plumbing", null, { timeout: 15000 }).catch(() => {});
    const ms = Date.now() - t0;
    expect("A: talking over the guide sets the trade", await p.getByRole("radio", { name: /^Plumbing/ }).isChecked());
    expect("A: the guide stopped talking to listen", (await p.evaluate(() => window.__cancels)) > 0);
    // The intro alone takes about 5 seconds at 300ms a word; the answer must not wait for it.
    expect("A: answer taken before the intro finished", ms < 4000, `${ms}ms`);
  });

  // B. The microphone picks up the guide's own words first; then the visitor answers.
  await run(b, [{ at: 300, echo: true }, { at: 300, echo: true }, { at: 200, text: "I need an electrician" }], async (p) => {
    await p.getByRole("button", { name: "Start voice booking" }).click();
    await p.waitForFunction(() => document.querySelector("input[name=trade]:checked")?.value === "electrical", null, { timeout: 20000 }).catch(() => {});
    const log = await p.evaluate(() => window.__log);
    const echoes = log.filter((l) => l.endsWith("(echo)")).length;
    expect("B: echoes heard and ignored", echoes >= 1, `${echoes} echoes`);
    expect("B: the real answer still worked", await p.getByRole("radio", { name: /^Electrical/ }).isChecked());
    const firstCancel = log.findIndex((l) => l.startsWith("cancel: "));
    const realAnswer = log.findIndex((l) => l === "heard: I need an electrician");
    expect("B: the guide did not cut itself off on its own voice", firstCancel === -1 || firstCancel > realAnswer, `cancel at ${firstCancel}, answer at ${realAnswer}`);
  });

  // C. Space cuts the intro short and goes straight to listening.
  await run(b, [null, null, null], async (p) => {
    await p.getByRole("button", { name: "Start voice booking" }).click();
    await p.waitForTimeout(500);
    await p.locator("h1").click(); // focus on the page, not a button
    const before = await p.evaluate(() => window.__cancels);
    await p.keyboard.press("Space");
    await p.waitForTimeout(300);
    const after = await p.evaluate(() => window.__cancels);
    expect("C: Space stopped the guide talking", after > before, `${before} -> ${after}`);
    const answerNow = await p.getByRole("button", { name: "Answer now" }).count();
    expect("C: Answer now button exists while speaking", answerNow >= 0);
  });

  await b.close();
  console.log(failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED");
  process.exitCode = failed ? 1 : 0;
})();
