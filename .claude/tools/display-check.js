/*
 * Display settings and information pages (milestone 02).
 *
 *  1. The Display menu: opens, switches apply to <html>, Escape closes it and
 *     returns focus, choices survive a reload, and high contrast follows the
 *     device's "more contrast" setting until a choice is made.
 *  2. axe on every public page in four settings: normal, high contrast,
 *     larger text, and both.
 *  3. No sideways scrolling at six widths, with larger text on and off.
 *  4. One h1 per page and no skipped heading levels.
 *
 * Needs: npm run build && npx next start -p 3100, then: node display-check.js
 */
const { chromium } = require("playwright-core");
const AXE = require.resolve("axe-core/axe.min.js");
const BASE = process.env.BASE || "http://localhost:3100";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PAGES = ["/", "/book", "/accessibility", "/trust", "/how-it-works", "/pricing", "/help", "/about"];
const SETTINGS = [
  { name: "normal", text: "normal", contrast: "normal" },
  { name: "high contrast", text: "normal", contrast: "high" },
  { name: "larger text", text: "lg", contrast: "normal" },
  { name: "both", text: "lg", contrast: "high" },
];

let failed = false;
const expect = (label, ok, extra = "") => {
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${extra ? ": " + extra : ""}`);
};

async function withSettings(context, s) {
  await context.addInitScript((s) => {
    localStorage.setItem("pt-text", s.text);
    localStorage.setItem("pt-contrast", s.contrast);
  }, s);
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });

  /* 1. The menu */
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const display = p.getByRole("button", { name: "Display" });
  await display.click();
  await p.getByRole("switch", { name: "Larger text" }).first().click();
  await p.getByRole("switch", { name: "High contrast" }).first().click();
  const attrs = await p.evaluate(() => [document.documentElement.dataset.text, document.documentElement.dataset.contrast]);
  expect("switches set <html> attributes", attrs[0] === "lg" && attrs[1] === "high", attrs.join(","));
  expect("switch reports on", (await p.getByRole("switch", { name: "Larger text" }).first().getAttribute("aria-checked")) === "true");
  await p.keyboard.press("Escape");
  expect("Escape closes and returns focus", await display.evaluate((el) => el === document.activeElement && el.getAttribute("aria-expanded") === "false"));
  await p.reload({ waitUntil: "networkidle" });
  const after = await p.evaluate(() => [document.documentElement.dataset.text, document.documentElement.dataset.contrast]);
  expect("choices survive a reload", after[0] === "lg" && after[1] === "high", after.join(","));
  const fontSize = await p.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  expect("larger text scales the root size", fontSize === "20px", fontSize);
  await ctx.close();

  const ctxMore = await b.newContext({ viewport: { width: 1280, height: 900 }, contrast: "more" });
  const pm = await ctxMore.newPage();
  await pm.goto(BASE + "/accessibility", { waitUntil: "networkidle" });
  expect("device 'more contrast' turns high contrast on", (await pm.evaluate(() => document.documentElement.dataset.contrast)) === "high");
  await ctxMore.close();

  /* 2 and 4. axe and headings on every page, in every setting */
  for (const s of SETTINGS) {
    const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await withSettings(c, s);
    const page = await c.newPage();
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.addScriptTag({ path: AXE });
      const v = await page.evaluate(async () =>
        (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map(
          (x) => `${x.id}(${x.impact}) x${x.nodes.length}: ${x.nodes[0].target}`,
        ),
      );
      expect(`axe ${path} [${s.name}]`, v.length === 0, v.join(" | "));
      if (s.name === "normal") {
        const h = await page.evaluate(() => {
          const levels = [...document.querySelectorAll("h1,h2,h3,h4")].filter((e) => e.offsetParent !== null).map((e) => Number(e.tagName[1]));
          const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1).length;
          return { h1: levels.filter((l) => l === 1).length, skips };
        });
        expect(`headings ${path}`, h.h1 === 1 && h.skips === 0, JSON.stringify(h));
      }
    }
    await c.close();
  }

  /* 3. No sideways scrolling */
  for (const text of ["normal", "lg"]) {
    for (const width of [320, 390, 768, 992, 1280, 1440]) {
      const c = await b.newContext({ viewport: { width, height: 900 } });
      await withSettings(c, { text, contrast: "normal" });
      const page = await c.newPage();
      const wide = [];
      for (const path of PAGES) {
        await page.goto(BASE + path, { waitUntil: "networkidle" });
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        if (sw > width) wide.push(`${path} ${sw}px`);
      }
      expect(`no sideways scroll at ${width}px [text ${text}]`, wide.length === 0, wide.join(", "));
      await c.close();
    }
  }

  await b.close();
  console.log(failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED");
  process.exitCode = failed ? 1 : 0;
})();
