import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { site } from "@/data/site";
import { InfoPage, InfoSection, Prose } from "@/features/info/info-page";

export const metadata: Metadata = {
  title: "How it works",
  description: "How booking a checked tradesperson works, step by step: by voice, with the form or on the phone.",
};

const steps = [
  {
    title: "Tell us the job",
    body: (
      <>
        <p>Choose the trade and the job, add your postcode, and pick a day and a time of day. It takes about two minutes.</p>
        <p>
          You can fill in the form, press Book by voice and answer one question at a time, or call us on{" "}
          <a href={site.phone.href}>{site.phone.display}</a>.
        </p>
      </>
    ),
  },
  {
    title: "We call you to confirm",
    body: (
      <p>
        A real person from our team calls you on the number you gave. We go through the job, check the time suits you, and confirm the
        price before anything is booked.
      </p>
    ),
  },
  {
    title: "A checked tradesperson comes",
    body: (
      <p>
        We only send someone who has passed our <a href="/trust">checks</a>. We tell you their name before they come, so you know who to
        expect at the door.
      </p>
    ),
  },
  {
    title: "You pay when the job is done",
    body: (
      <p>
        The prices on the site are starting prices. The full price is agreed with you before work starts, and any extra work needs your yes
        first. We tell you how to pay when we call.
      </p>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <InfoPage
      eyebrow="How it works"
      title="How booking works, step by step"
      lede="Four steps from “something’s broken” to fixed. You never pay before the work is done, and you always know who is coming."
    >
      <ol className="grid gap-10">
        {steps.map((step, i) => (
          <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-x-5 gap-y-3">
            <span aria-hidden="true" className="row-span-2 grid size-12 place-items-center rounded-full bg-ink text-h4 font-semibold text-white">
              {i + 1}
            </span>
            <h2 className="text-h3">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </h2>
            <Prose>{step.body}</Prose>
          </li>
        ))}
      </ol>

      <InfoSection id="start" title="Ready when you are">
        <div className="flex flex-wrap gap-3">
          <Button href="/book">Book with the form</Button>
          <Button href="/book?voice=1" variant="primary">
            Book by voice
          </Button>
        </div>
      </InfoSection>
    </InfoPage>
  );
}
