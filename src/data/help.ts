import type { Faq } from "@/types/content";
import { site } from "./site";

/*
 * The help centre's questions, grouped by topic. Every answer describes what
 * the site does today (the concierge MVP), not what is planned.
 */

export type HelpTopic = { id: string; title: string; items: Faq[] };

export const helpTopics: HelpTopic[] = [
  {
    id: "booking",
    title: "Booking a job",
    items: [
      { question: "How do I book?", answer: "Choose a job on a service page, fill in the short booking form, or press Book by voice and answer one question at a time. It takes about two minutes. You can also call us and we will book it for you." },
      { question: "Do I need an account to book?", answer: "No. You can book without one. With a free account you can see every booking you have made and where it is up to, and cancel a request online." },
      { question: "What happens after I send a request?", answer: "A real person from our team calls you on the number you gave. We go through the job, agree the price and the time with you, and then arrange a checked tradesperson. We tell you their name before they arrive." },
      { question: "Can I choose who comes?", answer: "Yes. When you book, you see the checked tradespeople for your job, nearest first, and can choose one. Or leave it to us: we send the nearest checked tradesperson who is free. If the person you chose cannot come, we offer the job to the next nearest and tell you." },
      { question: "How soon can someone come?", answer: "You choose a day in the next four weeks and a time of day: morning, afternoon or evening. We confirm the exact time when we call." },
      { question: "How do I change or cancel a booking?", answer: `If you have an account, you can cancel a request from your account page. To change one, or if you booked without an account, call us on ${site.phone.display}.` },
    ],
  },
  {
    id: "prices",
    title: "Prices and paying",
    items: [
      { question: "Are the prices on the site final?", answer: "No. They are indicative starting prices. The full price is agreed with you on the phone before anything is booked." },
      { question: "What if the job turns out bigger?", answer: "Nothing extra is done, and nothing extra is charged, until you say yes to the new price." },
      { question: "When and how do I pay?", answer: "Nothing is paid online and nothing is taken when you book. You pay when the job is done. We tell you how to pay when we call to confirm." },
    ],
  },
  {
    id: "safety",
    title: "Tradespeople and safety",
    items: [
      { question: "What do you check?", answer: "Government photo ID, a basic DBS certificate, public liability insurance, and for gas and certified electrical work, the right register: Gas Safe, or a scheme such as NICEIC or NAPIT. We check again every year." },
      { question: "How do I know the right person has come?", answer: "We tell you the name of the person coming before they arrive. Ask to see their photo ID, and for gas work, their Gas Safe ID card. If it is not the person we named, do not let them in, and call us." },
      { question: "I can smell gas. What should I do?", answer: "Do not book online. Leave the building, do not use light switches or flames, and call the National Gas Emergency Service on 0800 111 999. It is free, day and night." },
    ],
  },
  {
    id: "voice",
    title: "Book by voice and accessibility",
    items: [
      { question: "How does Book by voice work?", answer: "Press Start voice booking and talk. It asks one short question at a time, reads every answer back, and spells out postcodes, phone numbers and email addresses so you can check them. It fills in the form as you go." },
      { question: "How do I pause or stop it?", answer: "Say stop to pause. It keeps listening quietly, so you can say carry on to pick up where you left off, without finding a button. Say turn off, press Escape, or press Stop voice booking to turn it off." },
      { question: "Which browsers does voice booking work in?", answer: "Chrome and Edge, on a computer or an Android phone. Your browser asks to use the microphone the first time. In other browsers, use the form or call us." },
      { question: "Can I make the text bigger or change the contrast?", answer: "Yes. Press Display at the top of any page for larger text and high contrast. Your choice is remembered on your device." },
    ],
  },
  {
    id: "accounts",
    title: "Your account",
    items: [
      { question: "I did not get the email to confirm my account", answer: "Look in your junk or spam folder. The link only works once, and works best in the same browser you signed up in. If it has run out, log in and we will tell you what to do, or sign up again." },
      { question: "I have forgotten my password", answer: "Press Forgotten your password on the login page and enter your email address. We send you a link to choose a new one." },
    ],
  },
  {
    id: "tradespeople",
    title: "For tradespeople",
    items: [
      { question: "How do I join?", answer: "Create a tradesperson account, then tell us your trades, the area you work in and your registrations. We call you to arrange your checks. Nobody is offered a job until every check is done." },
      { question: "How do I get jobs?", answer: "Once you are approved, our team offers you jobs near you. Each one appears on your dashboard, where you accept or decline it. Before you accept, you see the job, the day and the postcode area; after, the customer's name, phone and address." },
    ],
  },
];
