# 07: Marketplace loop

**Status:** Not started
**Phase:** after the MVP launch
**Depends on:** 05, 06
**Why it matters:** this replaces the team's phone calls with the product.

## Checklist

- [ ] Matching: trade, distance from the postcode, availability, rating
- [ ] Customer sees a shortlist of three, with photo, checks and reviews, never a long list (the voice guide reads the three aloud)
- [ ] Tradesperson job inbox: accept or decline, with a short voice reply option
- [ ] One message thread per job, readable by screen readers, with email notifications
- [ ] Job status both sides can see: requested, accepted, on the way, done
- [ ] Better understanding of spoken requests: a language model behind the functions in `src/features/booking/understand.ts`, keeping the keyword matching as the fallback and the read-back step

## Done when

A customer can book, a verified tradesperson accepts, they message, and the job
is marked done, without the team doing it by hand.
