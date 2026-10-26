// Real Chrome speech synthesis (not faked), scripted recognition.
// Checks the guide never gets stuck "Speaking" when the browser's onend is
// late or never fires, and that a slowly spelt postcode arrives in one piece.
const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    // Each answer is a list of pieces with pauses between them (ms), like slow speech.
    window.__answers = [
      [["I need a plumber my tap is dripping", 0]],
      [["S W", 0], ["2", 900], ["1 A A", 1200]],
      [["no", 0]],
      [["stop", 0]],
    ];
    window.__heard = [];
    window.__spokenLog = [];
    const realSpeak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { window.__spokenLog.push(u.text); realSpeak(u); };
    class FakeRecognition {
      start() {
        const pieces = window.__answers.shift();
        if (!pieces) { setTimeout(() => { this.onerror && this.onerror({ error: "no-speech" }); this.onend && this.onend(); }, 200); return; }
        let said = "";
        let t = 100;
        for (const [text, gap] of pieces) {
          t += gap;
          setTimeout(() => { said = (said + " " + text).trim(); this.onresult && this.onresult({ results: [[{ transcript: said }]] }); }, t);
        }
        // Like Chrome in continuous mode: keep going until stop() is called.
        this._timer = setTimeout(() => this.onend && this.onend(), 30000);
        this._said = () => said;
      }
      stop() { clearTimeout(this._timer); window.__heard.push(this._said ? this._said() : ""); setTimeout(() => this.onend && this.onend(), 50); }
      abort() { clearTimeout(this._timer); this.onerror && this.onerror({ error: "aborted" }); this.onend && this.onend(); }
    }
    window.SpeechRecognition = FakeRecognition;
    window.webkitSpeechRecognition = FakeRecognition;
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("http://localhost:3100/book", { waitUntil: "networkidle" });
  const t0 = Date.now();
  await p.getByRole("button", { name: "Start voice booking" }).click();
  let ok = true;
  try {
    await p.getByRole("button", { name: "Carry on by voice" }).waitFor({ timeout: 180000 });
  } catch {
    ok = false;
  }
  const state = await p.evaluate(() => ({ heard: window.__heard, left: window.__answers.length, spoken: window.__spokenLog.length, voices: speechSynthesis.getVoices().length }));
  const postcode = await p.getByLabel("Postcode where the job is").inputValue();
  console.log(JSON.stringify({ ok, seconds: Math.round((Date.now() - t0) / 1000), postcode, ...state, errs }, null, 1));
  console.log(ok && postcode === "SW2 1AA" && state.left === 0 ? "REAL SYNTH CHECK PASSED" : "REAL SYNTH CHECK FAILED");
  await b.close();
})();
