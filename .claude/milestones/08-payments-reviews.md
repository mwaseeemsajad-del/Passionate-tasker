# 08: Payments and reviews

**Status:** Not started
**Phase:** after the MVP launch
**Depends on:** 07
**Why it matters:** "pay only when you are happy" has to be true before it is promised online.

## Checklist

- [ ] Take legal and accounting advice on how customer money is held before it reaches the tradesperson
- [ ] Stripe Connect: card held at booking, captured when the customer confirms the job is done, paid out to the tradesperson
- [ ] Signed, idempotent Stripe webhooks handled on the server
- [ ] Extra work: the tradesperson sends a new price, nothing is charged without the customer's yes
- [ ] Receipts and invoices by email
- [ ] Disputes: freeze the payment, collect evidence, admin decision, logged
- [ ] Reviews only from customers whose job is done; shown with the job type and month

## Done when

A real job is paid by card through the site, the tradesperson is paid out, and
the customer leaves a review tied to that job.
