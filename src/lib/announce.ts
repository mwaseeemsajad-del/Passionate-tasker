/*
 * Say something to screen reader users through the site-wide live region in
 * the root layout. For actions that remove the control that was pressed
 * (accepting a job moves its card to another list), where a live region
 * inside the card would vanish before it could be read.
 *
 * The region is cleared first and filled a moment later, so the same words
 * twice in a row are still read out.
 */
export const ANNOUNCER_ID = "site-announcer";

export function announce(text: string, { focusMain = false } = {}) {
  const region = document.getElementById(ANNOUNCER_ID);
  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = text;
    }, 100);
  }
  // The pressed button may be gone, which drops focus to the top of the page.
  // Main takes focus in its place, so the next Tab stays in the content.
  if (focusMain) document.getElementById("main")?.focus({ preventScroll: true });
}
