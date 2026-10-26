const { chromium } = require("playwright-core");
const AXE = require.resolve("axe-core/axe.min.js");
const BASE = process.env.BASE || "http://localhost:3100";
// A fresh phone number each run: the database allows 5 requests an hour per number, and this check sends real ones.
const DIGITS = "07700" + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
const WORDS = ["oh", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const SPOKEN_PHONE = DIGITS.split("").map((d) => WORDS[+d]).join(" ");
const FORM_PHONE = "07700 " + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
const ANSWERS = [
  "I need an electrician my sockets keep sparking postcode SW1A 1AA tomorrow morning",
  "yes", "yes", "my name is sam khan",
  SPOKEN_PHONE, "yes",
  "sam dot khan at gmail dot com", "yes", "send",
];
function fakeSpeech(answers) {
  window.__answers = answers.slice(); window.__spoken = []; window.__heard = [];
  class FakeRecognition {
    start() { this.t = setTimeout(() => { const t = window.__answers.shift();
      if (t === undefined) this.onerror && this.onerror({ error: "no-speech" });
      else { window.__heard.push(t); this.onresult && this.onresult({ results: [[{ transcript: t }]] }); }
      this.onend && this.onend(); }, 40); }
    stop() {} abort() { clearTimeout(this.t); this.onerror && this.onerror({ error: "aborted" }); this.onend && this.onend(); }
  }
  window.SpeechRecognition = FakeRecognition; window.webkitSpeechRecognition = FakeRecognition;
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak(u) { window.__spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 5); }, cancel() {} } });
}
let failed = false;
const expect = (label, ok, extra = "") => { if (!ok) failed = true; console.log(`${ok ? "ok  " : "FAIL"} ${label}${extra ? ": " + extra : ""}`); };
async function axe(page, label) {
  await page.addScriptTag({ path: AXE });
  const v = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((x) => `${x.id}(${x.impact}) x${x.nodes.length}: ${x.nodes[0].target}`));
  expect(`axe ${label}`, v.length === 0, v.join(" | "));
}
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

  // 1. Whole booking by voice, starting from the hero button.
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(fakeSpeech, ANSWERS);
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Book by voice" }).click();
  await page.waitForURL(/\/book\?voice=1/);
  const start = page.getByRole("button", { name: "Start voice booking" });
  await start.waitFor();
  expect("start button has focus after arriving", await start.evaluate((el) => el === document.activeElement));
  await start.click();
  try { await page.getByRole("heading", { name: "Request sent" }).waitFor({ timeout: 30000 }); }
  catch (e) { console.log(JSON.stringify(await page.evaluate(() => ({ spoken: window.__spoken, heard: window.__heard, left: window.__answers })), null, 1)); throw e; }
  await page.waitForFunction(() => window.__spoken.some((s) => s.startsWith("Your request has been sent")), null, { timeout: 12000 }).catch(() => {});
  const spoken = await page.evaluate(() => window.__spoken);
  const ref = await page.locator("p.text-text-2", { hasText: "Your reference is" }).textContent();
  expect("request sent with a reference", /PT[A-Z0-9]{5}/.test(ref), ref);
  expect("all answers used", (await page.evaluate(() => window.__answers.length)) === 0);
  expect("understood electrician + socket job", spoken.some((s) => s.includes("a job for an electrician: Replace a socket or switch")));
  expect("postcode spelt back", spoken.some((s) => s.includes("S W 1 A 1 A A")));
  expect("phone read back digit by digit", spoken.some((s) => s.includes(DIGITS.split("").join(" "))));
  expect("email spelt back", spoken.some((s) => s.includes("s a m dot k h a n at g m a i l dot c o m")));
  expect("tomorrow morning picked up", spoken.some((s) => /^Tomorrow, .* in the morning/.test(s)));
  expect("final words spoken", spoken.some((s) => s.startsWith("Your request has been sent")));
  expect("no page errors", errs.length === 0, errs.join("; "));
  await axe(page, "booking done screen");
  await ctx.close();

  // 2. "stop" pauses and keeps answers; "carry on" by voice resumes with no button press;
  //    talk in the room while paused is ignored; the Stop button turns it off.
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.addInitScript(fakeSpeech, ["plumber please", "stop", "hang on a minute love", "carry on", "number one"]);
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p2.getByRole("button", { name: "Start voice booking" }).click();
  await p2.waitForFunction(() => window.__spoken.some((s) => s.startsWith("Dripping tap")), null, { timeout: 15000 }).catch(() => {});
  const s2 = await p2.evaluate(() => window.__spoken);
  expect("stop pauses", s2.some((s) => s.startsWith("Paused")));
  expect("voice is not turned off by stop", s2.every((s) => !s.startsWith("Voice booking is off")));
  expect("carry on resumes by voice", s2.some((s) => s.startsWith("Carrying on")));
  expect("talk while paused ignored", !s2.some((s) => s.includes("hang on a minute")));
  expect("plumbing kept after pause", await p2.getByRole("radio", { name: /Plumbing/ }).isChecked());
  expect("answer after resume used", await p2.getByRole("radio", { name: /Dripping tap/ }).isChecked());
  expect("phone width: no sideways scroll", (await p2.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  await p2.getByRole("button", { name: "Stop voice booking" }).click();
  await p2.getByRole("button", { name: "Carry on by voice" }).waitFor({ timeout: 5000 });
  expect("Stop button turns voice off", true);
  await ctx2.close();

  // 2b. Paused, then the "Carry on" button resumes, for anyone not speaking.
  const ctx2b = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx2b.addInitScript(fakeSpeech, ["electrician", "stop"]);
  const p2b = await ctx2b.newPage();
  await p2b.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p2b.getByRole("button", { name: "Start voice booking" }).click();
  await p2b.getByRole("button", { name: "Carry on", exact: true }).click({ timeout: 15000 });
  await p2b.waitForFunction(() => window.__spoken.some((s) => s.startsWith("Carrying on")), null, { timeout: 5000 }).catch(() => {});
  expect("Carry on button resumes", (await p2b.evaluate(() => window.__spoken)).some((s) => s.startsWith("Carrying on")));
  await ctx2b.close();

  // 2c. A job chosen on a service page arrives already chosen in booking.
  const ctx2c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p2c = await ctx2c.newPage();
  await p2c.goto(BASE + "/services/painting", { waitUntil: "networkidle" });
  await axe(p2c, "service page");
  await p2c.getByRole("link", { name: "Hang wallpaper" }).click();
  await p2c.waitForURL(/job=wallpaper/);
  await p2c.getByRole("radio", { name: /Hang wallpaper/ }).waitFor();
  expect("service page job preselected", await p2c.getByRole("radio", { name: /Hang wallpaper/ }).isChecked());
  expect("booking h1 names the trade", (await p2c.locator("h1:visible").textContent()) === "Book a painter and decorator");
  // A popular job under the hero goes straight into booking with the job chosen.
  await p2c.goto(BASE + "/", { waitUntil: "networkidle" });
  await p2c.getByRole("navigation", { name: "Popular jobs:" }).getByRole("link", { name: "Mount a TV" }).click();
  await p2c.waitForURL(/job=tv-mounting/);
  await p2c.getByRole("radio", { name: /Mount a TV on the wall/ }).waitFor();
  expect("hero popular job preselected", await p2c.getByRole("radio", { name: /Mount a TV on the wall/ }).isChecked());
  await ctx2c.close();

  // 2d. Account pages: signup errors are summarised and focused; login, signup and legal pages pass axe.
  const ctx2d = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p2d = await ctx2d.newPage();
  await p2d.goto(BASE + "/signup/provider", { waitUntil: "networkidle" });
  await axe(p2d, "provider signup");
  await p2d.getByRole("button", { name: "Create tradesperson account" }).click();
  const signAlert = p2d.getByRole("alert", { name: /problem/ });
  await signAlert.waitFor();
  expect("signup: error summary focused", await signAlert.evaluate((el) => el === document.activeElement));
  expect("signup: 4 problems listed", (await signAlert.locator("li").count()) === 4);
  await axe(p2d, "provider signup with errors");
  expect("signup: phone width no sideways scroll", (await p2d.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  await p2d.goto(BASE + "/provider", { waitUntil: "networkidle" });
  expect("dashboard sends signed-out visitors to login", p2d.url().includes("/login?next=%2Fprovider"), p2d.url());
  await p2d.goto(BASE + "/admin", { waitUntil: "networkidle" });
  expect("team page sends signed-out visitors to login", p2d.url().includes("/login?next=%2Fadmin"), p2d.url());
  for (const path of ["/login", "/signup", "/forgot-password", "/join", "/privacy", "/terms", "/services", "/pricing", "/help", "/about", "/how-it-works"]) {
    await p2d.goto(BASE + path, { waitUntil: "networkidle" });
    await axe(p2d, path);
  }
  await ctx2d.close();

  // 3. Form by keyboard: errors take focus, then each step moves focus to its heading.
  const ctx3 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p3 = await ctx3.newPage();
  await p3.goto(BASE + "/book", { waitUntil: "networkidle" });
  await axe(p3, "booking step 1");
  await p3.getByRole("button", { name: "Continue" }).click();
  const alert = p3.getByRole("alert", { name: /problem/ });
  await alert.waitFor();
  expect("error summary focused", await alert.evaluate((el) => el === document.activeElement));
  expect("error summary lists 2 problems", (await alert.locator("li").count()) === 2);
  await axe(p3, "booking step 1 with errors");
  await p3.getByRole("radio", { name: /Heating and boilers/ }).check();
  await p3.getByRole("radio", { name: /Annual boiler service/ }).check();
  await p3.getByLabel("Postcode where the job is").fill("sw21aa");
  await p3.getByRole("button", { name: "Continue" }).click();
  const h = p3.locator("#step-title");
  expect("step 2 heading focused", await h.evaluate((el) => el === document.activeElement && el.textContent.includes("When")));
  await p3.getByRole("radio", { name: /Let us choose for me/ }).waitFor();
  expect("who comes: let us choose is the default", await p3.getByRole("radio", { name: /Let us choose for me/ }).isChecked());
  await p3.locator("input[name=date]").nth(2).check();
  await p3.getByRole("radio", { name: /Evening/ }).check();
  await p3.getByRole("button", { name: "Continue" }).click();
  await p3.getByLabel("Your name").fill("Jo Smith");
  await p3.getByLabel("Phone number").fill("123");
  await p3.getByRole("button", { name: "Continue" }).click();
  await p3.getByRole("alert", { name: /problem/ }).waitFor();
  expect("short phone rejected", (await p3.getByRole("alert", { name: /problem/ }).textContent()).includes("at least 10 digits"));
  await p3.getByLabel("Phone number").fill(FORM_PHONE);
  await p3.getByRole("button", { name: "Continue" }).click();
  expect("review shows formatted postcode", (await p3.locator("dl").first().textContent()).includes("SW2 1AA"));
  await axe(p3, "booking review");
  await p3.reload({ waitUntil: "networkidle" });
  expect("reload keeps the step", (await p3.locator("#step-title").textContent()).includes("Check and send"));
  await p3.getByRole("button", { name: "Send booking request" }).click();
  await p3.getByRole("heading", { name: "Request sent" }).waitFor();
  expect("form booking sent", true);
  await p3.goto(BASE + "/", { waitUntil: "networkidle" });
  await axe(p3, "home page");
  await ctx3.close();

  // 4. A gas smell is treated as an emergency, not a booking.
  const ctx4 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx4.addInitScript(fakeSpeech, ["I can smell gas in the kitchen"]);
  const p4 = await ctx4.newPage();
  await p4.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p4.getByRole("button", { name: "Start voice booking" }).click();
  await p4.waitForFunction(() => window.__spoken.some((t) => t.includes("0800 111 999")), null, { timeout: 15000 }).catch(() => {});
  expect("gas smell gets the emergency number", (await p4.evaluate(() => window.__spoken)).some((t) => t.includes("0800 111 999")));
  expect("emergency did not start a booking", !(await p4.getByRole("radio", { name: /^Gas From/ }).isChecked()));
  await p4.getByRole("radio", { name: /^Gas From/ }).check();
  expect("gas notice shown on the form", await p4.getByRole("note").isVisible());
  await ctx4.close();

  // 5. New trades are understood by voice.
  const ctx5 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx5.addInitScript(fakeSpeech, ["I need a painter to paint my bedroom", "stop"]);
  const p5 = await ctx5.newPage();
  await p5.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p5.getByRole("button", { name: "Start voice booking" }).click();
  await p5.getByRole("button", { name: "Carry on", exact: true }).waitFor({ timeout: 15000 });
  expect("painter + paint a room understood", (await p5.evaluate(() => window.__spoken)).some((t) => t.includes("painter and decorator: Paint a room")));
  expect("painting chosen on the form", await p5.getByRole("radio", { name: /Painting and decorating/ }).isChecked());
  await ctx5.close();

  // 6. Misheard words: numbers work, and the first half of a postcode is accepted.
  const ctx6 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx6.addInitScript(fakeSpeech, ["I want a plumber", "number one", "s w two", "no", "stop"]);
  const p6 = await ctx6.newPage();
  await p6.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p6.getByRole("button", { name: "Start voice booking" }).click();
  await p6.getByRole("button", { name: "Carry on", exact: true }).waitFor({ timeout: 20000 });
  expect("number one chose the first job", await p6.getByRole("radio", { name: /Dripping tap/ }).isChecked());
  expect("postcode area SW2 accepted", (await p6.getByLabel("Postcode where the job is").inputValue()) === "SW2");
  await ctx6.close();

  // 7. An answer typed into the voice panel is used like a spoken one.
  const ctx7 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  // No scripted answers: the recogniser hears nothing, so only the typed answer can move things on.
  await ctx7.addInitScript(fakeSpeech, []);
  const p7 = await ctx7.newPage();
  await p7.goto(BASE + "/book", { waitUntil: "networkidle" });
  await p7.getByRole("button", { name: "Start voice booking" }).click();
  const box = p7.getByLabel("Not understood? Type your answer instead");
  await box.waitFor();
  await box.fill("electrician, my fuse box keeps tripping");
  await p7.getByRole("button", { name: "Send answer" }).click();
  await p7.waitForFunction(() => document.querySelector("input[name=trade]:checked")?.value === "electrical", null, { timeout: 15000 }).catch(() => {});
  expect("typed answer chose electrical", await p7.getByRole("radio", { name: /^Electrical/ }).isChecked());
  expect("typed answer chose the fuse job", await p7.getByRole("radio", { name: /Fuse box keeps tripping/ }).isChecked());
  await ctx7.close();

  await b.close();
  console.log(failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED");
})();
