import type { AssistantTopic, Service } from "@/types/content";
import { services } from "./services";
import { site } from "./site";

/*
 * What the help assistant in the corner of every public page says. Scripted,
 * not AI: every answer is written here and says only what the site does today
 * (the concierge MVP). Kept short, because it is read aloud.
 */

// "020 3000 0000" read digit by digit, with a pause between the groups.
const spokenPhone = site.phone.display
  .split(" ")
  .map((group) => group.split("").join(" "))
  .join(", ");

const tap = services.find((s) => s.slug === "plumbing")?.jobs.find((j) => j.slug === "dripping-tap");

export const assistant = {
  title: "Need a hand?",
  // Shown while the helper is small, after opening by itself.
  intro: "Tell me what you need after the beep, or choose a question.",
  greeting:
    "Hello, I am here to help you use this website. I can book a checked tradesperson for you, tell you about prices and checks, make the text bigger, or give you our phone number. After the beep, tell me what you would like to do.",
  // Shown with the full list of questions.
  greetingText: "Tell me what you need after the beep, or choose a question below. Press Stop at any time.",

  // The spoken conversation. The assistant listens after each of these.
  options: "You can say: book a plumber, prices, who will come, bigger text, or talk to a person.",
  followUp: "Anything else?",
  notHeard: "Sorry, I did not hear anything.",
  notUnderstood: "Sorry, I did not understand that.",
  givingUp: "I will stop listening now. Press Help at the bottom of the page to talk to me again.",
  noMic: "I cannot hear you in this browser, so please use the buttons. Press Tab to reach them.",
  goodbye: "Goodbye. Press Help at the bottom of the page if you need me again.",
  textOn: "I have made the text bigger. Say smaller to change it back.",
  textOff: "The text is back to its normal size.",
  contrastOn: "I have turned on high contrast. Say normal colours to change it back.",
  contrastOff: "High contrast is off.",
  bookHandoff: "I will open the booking form now and ask you about the job, one question at a time.",
  goTo: (page: string) => `Here is the ${page}.`,
  tradePrice: (s: Service) =>
    `${s.name} starts from £${s.fromPrice} ${s.priceUnit === "hour" ? "an hour" : "a job"}. The full price is agreed with you on the phone before anything is booked. To book, say book ${s.person}.`,
  topics: [
    {
      id: "what",
      question: "What is this website?",
      answer: `${site.name} finds you a checked local tradesperson in ${site.area}: plumbers, electricians, gas and heating engineers, painters, carpenters and handypeople. You agree the price before anyone is booked.`,
      link: { label: "See all services", href: "/services" },
    },
    {
      id: "book",
      question: "How do I book?",
      answer:
        "Tell us the job, your postcode and a day that suits you. It takes about two minutes. A real person then calls you to confirm the time and the price. A checked tradesperson comes, and you pay when the job is done.",
      link: { label: "Book a job", href: "/book" },
    },
    {
      id: "voice",
      question: "Can I book by speaking?",
      answer:
        "Yes. Press Book by voice. I ask one question at a time and you answer out loud. If your browser cannot listen, the same form works with the keyboard or a screen reader.",
      link: { label: "Book by voice", href: "/book?voice=1" },
    },
    {
      id: "price",
      question: "How much does it cost?",
      answer: `The prices on the site are starting prices${tap?.fromPrice ? `, for example a dripping tap from £${tap.fromPrice}` : ""}. The full price is agreed with you on the phone before anything is booked, and you pay when the job is done.`,
      link: { label: "See prices", href: "/pricing" },
    },
    {
      id: "who",
      question: "Who will come to my home?",
      answer:
        "Only someone who has passed our checks: photo ID, a basic DBS certificate and insurance, plus the Gas Safe Register for gas work. We tell you their name before they come.",
      link: { label: "What we check", href: "/trust" },
    },
    {
      id: "display",
      question: "Make the screen easier to see",
      answer: "Turn on larger text or high contrast below. Your choice is remembered on this device. The same switches are under Display at the top of every page.",
      display: true,
    },
    {
      id: "person",
      question: "Talk to a person",
      answer: `Call us on ${site.phone.display}, ${site.supportHours}.`,
      spoken: `Call us on ${spokenPhone}. We answer ${site.supportHours}.`,
      link: { label: `Call ${site.phone.display}`, href: site.phone.href },
    },
  ] satisfies AssistantTopic[],
};
