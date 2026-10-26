const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  let failed = false;
  for (const path of ["/", "/book", "/accessibility", "/trust", "/how-it-works", "/pricing", "/help", "/about"]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto("http://localhost:3100" + path, { waitUntil: "networkidle" });
    const seen = new Set(); const bad = []; let stops = 0;
    for (let i = 0; i < 120; i++) {
      await p.keyboard.press("Tab");
      const r = await p.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        if (!el.dataset.walk) el.dataset.walk = String(Math.random());
        // A radio's ring and target are its whole card (the label around it).
        const target = el.type === "radio" ? el.closest("label") : el;
        const cs = getComputedStyle(target);
        const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
        // Links inside a sentence are exempt from the 24px target rule (WCAG 2.5.8).
        const inline = el.tagName === "A" && !!el.closest("p") && getComputedStyle(el).display === "inline";
        const label = (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().slice(0, 40);
        const rect = target.getBoundingClientRect();
        return { key: el.dataset.walk, ring, label, small: !inline && (rect.width < 24 || rect.height < 24) };
      });
      if (!r) continue;
      if (seen.has(r.key)) break;
      seen.add(r.key); stops++;
      if (!r.ring) bad.push("no ring: " + r.label);
      if (r.small) bad.push("under 24px: " + r.label);
    }
    const first = await p.evaluate(() => 0);
    console.log(`${bad.length ? "FAIL" : "ok  "} ${path}: ${stops} stops${bad.length ? " | " + bad.slice(0, 6).join(" | ") : ""}`);
    if (bad.length) failed = true;
    await p.close();
  }
  await b.close();
  console.log(failed ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED");
})();
