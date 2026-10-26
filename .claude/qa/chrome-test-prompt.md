You are testing **Passionate Taskers**, a UK website for booking checked local tradespeople, running locally at **http://localhost:3000**. Test every flow as a **customer** and as a **tradesperson**, then give me a report. Accessibility for blind, low-vision and elderly users is a core requirement, so check that too.

## Rules
- Only use http://localhost:3000. Do not open the Supabase dashboard or any other site.
- **Do not type passwords or create accounts.** When a step needs me to sign up, log in or open an email link, stop and ask me to do it, then carry on.
- Use test data only: name "Test Customer", postcodes like SW2 1AA, SE15 4QF, N1 7AA, and phone numbers 07700 900001 to 07700 900099 (UK test range). Use a **different phone number for each booking**: the site allows only 5 requests an hour per number.
- Send at most 6 bookings in total. Do not press anything that deletes data. "Cancel request" on a test booking is fine.
- Tradespeople named "Demo …" are test profiles. That is expected.
- Do not try to use the microphone. For Book by voice, only check the panel and buttons.

## 1. Signed out: public pages
1. Home page: the hero shows short videos of tradespeople one after another, and a "Pause background video" button stops them. Press it, reload, and check it stays paused. Press Play again.
2. Under the hero, the "Popular jobs" links (Dripping tap, Mount a TV, Boiler service, Paint a room, Fuse box tripping) each open /book with that job already chosen.
3. Header: Services, How it works, Pricing and Help each open their **own page** (/services, /how-it-works, /pricing, /help), not a section of the home page. The account button says "Log in".
4. /services lists 7 trades. Open /services/painting and /services/gas. Gas must show the gas emergency warning (0800 111 999). Clicking a job such as "Hang wallpaper" opens /book with Painting and that job chosen, and the page heading says "Book a painter and decorator".
5. /pricing: a price table for each trade; each job link opens booking with that job chosen. /help: topic links jump to sections, and the questions open and close. Also check /about, /trust, /accessibility, /privacy and /terms (the last two say "Draft for review").
6. Footer links all work. Visit /no-such-page and check you get a helpful 404 page.
7. "Display" in the header: turn on Larger text, then High contrast. Check that text grows, contrast changes, nothing overlaps, and the choice is kept after a reload. Turn both off again.

## 2. Booking as a guest (signed out)
1. /book: press Continue with nothing filled in. An error summary should appear, take focus, and link to each problem.
2. Choose Plumbing, then "Dripping tap", postcode SW2 1AA, and Continue.
3. Step 2 "When and who": choose a day and a time. Under "Who would you like to come?", "Let us choose for me" is selected by default, and below it are checked tradespeople, **nearest first** (for SW2 that should be Demo F. before Demo A.). No phone numbers or addresses are shown. Leave "Let us choose for me" and continue.
4. Step 3: name "Test Customer", phone 07700 900011. Try a short phone such as "123" first and check the error.
5. Step 4 "Check and send": every answer is listed with a "Change" link, including "Who comes". Press one Change link and come back. Send. You should see "Request sent" and a reference starting with PT.
6. Book a second job, Painting / "Paint a room" / N1 7AA, and this time **choose a named tradesperson** (Demo C. should be first). Check the review shows that name, then send.
7. Choose Gas: the gas emergency warning appears straight away.
8. Book by voice panel: check that "Start voice booking" is there and that the help text mentions "stop" to pause and "carry on" to resume. Do not start it.
9. Reload in the middle of a booking: your answers should still be there.

## 3. Customer account (ask me to sign up and log in as a customer)
1. /signup: press "Create account" empty and check the 4 errors. Then ask me to create the account and confirm the email. Do not type a password yourself.
2. Once I am logged in: the header button says "My bookings" and opens /account.
3. /account has a sidebar (My bookings, Book a job, Profile, Help, Log out), 3 number cards, and the bookings list. Make one booking while logged in and check it appears here with a status in plain words.
4. "Cancel request" asks "Cancel this request?" before doing anything. Confirm, and check the booking moves to "Past bookings".
5. /account/profile shows name, email and phone.
6. While logged in as a customer, open /provider and /admin: you should be sent back to /account.
7. Log out from the sidebar. The header shows "Log in" again, and /account now sends you to /login.

## 4. Tradesperson (ask me to sign up and log in as a tradesperson)
1. /join explains how joining works and links to /signup/provider. On /signup/provider, press the button empty and check the 4 errors. Then ask me to create the account and confirm the email.
2. The email link should land on /provider/onboarding with 3 steps:
   - Step 1: tick Gas and Plumbing, postcode SE15, and Save and continue.
   - Step 2: a Gas Safe number field appears (it only appears for gas or heating). Enter "123" and check the error, then enter 1234567.
   - Step 3: lists the checks (ID, DBS, insurance, Gas Safe). Press Finish without ticking the box and check the error, then tick it and finish.
3. The dashboard at /provider: the header button says "Dashboard". The sidebar has Overview, Jobs, Checks, Profile, Help and Log out. You see a status badge ("Checks in progress"), trade badges, 4 number cards, "Your next job", and "Waiting for your answer".
4. /provider/jobs has three lists: Waiting, Booked and Past, each with a count. /provider/checks shows a progress bar and each check. Press "I have sent this to the team" on one and check its status changes to "Sent, we are checking". /provider/profile shows trades, area and the Gas Safe number, and has "Edit trades and area".
5. **Accept and decline**: this needs a job offered to this tradesperson, which only happens once they are approved. Ask me whether they are approved. If they are, make a guest booking for Plumbing at SE15, **choose this tradesperson by name**, then log back in as them:
   - The job shows under "Waiting for your answer", with "Booked by", the service, when, and the postcode **area only**, plus "The customer chose you for this job".
   - Press Accept: the phone number and full postcode appear, and the job moves to Booked.
   - Press "Mark as done": it moves to Past.
   - Repeat with another booking and press Decline: it leaves your waiting list.
6. While logged in as a tradesperson, /account and /admin send you back to /provider.

## 5. Across everything
- **Keyboard only:** go through the home page, /book (one whole booking), /login and /provider using Tab, Shift+Tab, Enter and Space. Every control must be reachable, show a visible focus ring, and work.
- **Phone width:** resize to 390px wide. Check the home page, /book, /pricing, /help and the dashboards for sideways scrolling, overlapping text or cut-off buttons. In the header, the account button may show as an icon only. That is intended.
- **Page structure:** each page has exactly one main heading (h1), and headings follow in order.
- Note anything slow, confusing, misspelt, or that claims something the site does not do.
- Watch the browser console and report any red errors, with the page they happened on.

## Report
Finish with a table: **#, area (Public / Booking / Customer / Tradesperson / Accessibility), what you did, expected, what happened, PASS / FAIL, severity (Blocker / Major / Minor / Cosmetic)**. For each FAIL, give the URL, exact steps to reproduce, and a screenshot. End with the top 5 problems to fix first.
