import type { Metadata } from "next";
import { DisplayToggles } from "@/components/layout/display-settings";
import { Button } from "@/components/ui";
import { site } from "@/data/site";
import { InfoPage, InfoSection, PointList, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `How ${site.name} works for blind, low-vision and older people, what we have tested, and what does not work yet.`,
};

// Change this date whenever the page changes.
const UPDATED = "17 October 2026";

/*
 * Every line in "What works" must be true of the site as it stands. "What does
 * not work yet" is the point of the page: add to it the moment a gap is found,
 * and remove a line only when the gap is fixed and checked.
 */
const works = [
  {
    title: "Book by voice",
    body: "Press Book by voice and talk. We ask one question at a time, read every answer back, spell out postcodes, phone numbers and email addresses, and only move on when you say yes. Say stop, go back or repeat at any time.",
  },
  {
    title: "Book by phone",
    body: (
      <p>
        Prefer to talk to a person? Call <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}, and we will book it for you.
      </p>
    ),
  },
  {
    title: "Keyboard only",
    body: "Every page and every booking step works without a mouse. Whatever you are on has a clear outline, and Skip to main content is the first stop on every page.",
  },
  {
    title: "Screen readers",
    body: "Pages use proper headings, labels and landmarks. When a booking step has a problem, the list of problems is read out first and each one links to its field.",
  },
  {
    title: "Larger text and high contrast",
    body: "Use the Display button at the top of every page, or the switches below. Your choice is remembered on this device and applied before the page appears. High contrast also turns on by itself if your device asks for more contrast.",
  },
  {
    title: "Less movement",
    body: "If your device asks for reduced motion, nothing slides or zooms. The moving strip of registers on the home page stops.",
  },
  {
    title: "No time limits, no lost answers",
    body: "Booking never times out, and your answers are kept if you refresh the page.",
  },
];

const limitations = [
  { title: "No independent audit yet", body: "An outside accessibility specialist has not audited the site, so we do not claim it meets any standard." },
  {
    title: "Not yet tested by the people it is built for",
    body: "Blind, low-vision and older testers have not been through the whole site yet. That testing is planned, and what they find will be listed here.",
  },
  {
    title: "Screen reader testing is not finished",
    body: "Pages pass automated checks, but hands-on testing with NVDA, JAWS, VoiceOver and TalkBack is still to be done. You may meet things that are read out badly.",
  },
  {
    title: "Voice booking depends on your browser",
    body: "Book by voice works in Chrome and Edge on a computer or an Android phone. Firefox does not support it, and Safari on iPhone and Mac may not. Where it does not work, the page says so and offers the form and our phone number.",
  },
  { title: "Windows contrast themes are untested", body: "Our own high contrast setting has been checked. Windows contrast themes and other forced-colour modes have not." },
  { title: "Very high zoom is only partly checked", body: "Pages are checked for sideways scrolling from phone width up. Zooming to 400% has not been checked on every page." },
  { title: "No help assistant yet", body: "There is no assistant to ask questions or change settings for you yet. It is planned." },
  { title: "English only", body: "The site is in English. Other languages are planned." },
];

export default function AccessibilityPage() {
  return (
    <InfoPage
      eyebrow="Accessibility"
      title="Our mission and accessibility"
      updated={UPDATED}
      lede={`${site.name} is built first for the people other sites leave out: people who are blind or have low vision, older people, and anyone who finds small screens and long forms hard. A site that works without seeing the screen works better for everyone.`}
    >
      <InfoSection id="settings" title="Change how the site looks">
        <div className="rounded-xl border border-line p-6">
          <DisplayToggles idPrefix="page" />
        </div>
      </InfoSection>

      <InfoSection id="works" title="What works today">
        <PointList items={works} />
        <div>
          <Button href="/book?voice=1">Try Book by voice</Button>
        </div>
      </InfoSection>

      <InfoSection id="standard" title="The standard we are working to">
        <Prose>
          <p>
            We are building to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. We do not claim to meet it yet, and we will
            not say the site conforms until it has been tested by people who depend on it.
          </p>
        </Prose>
      </InfoSection>

      <InfoSection id="testing" title="How we test">
        <Prose>
          <p>
            Every page is checked with an automated accessibility checker. An automated test goes through the whole booking with the form,
            checking where the keyboard focus lands at each step, and another does the whole booking by voice with a recorded voice.
          </p>
          <p>Automated checks only catch some kinds of problem, which is why the list below exists.</p>
        </Prose>
      </InfoSection>

      <InfoSection id="limitations" title="What does not work yet">
        <PointList items={limitations} />
      </InfoSection>

      <InfoSection id="contact" title="Tell us what is not working">
        <Prose>
          <p>
            If something on this site does not work for you, that is a fault in the site, not in how you use it. Call us on{" "}
            <a href={site.phone.href}>{site.phone.display}</a>, {site.supportHours}. Tell us the page and what happened, and we will fix
            it or find another way to help you book.
          </p>
        </Prose>
      </InfoSection>
    </InfoPage>
  );
}
