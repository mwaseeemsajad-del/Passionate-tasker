# 09: Full launch gate

**Status:** Not started
**Phase:** before the site moves beyond the concierge MVP
**Depends on:** 05 to 08
**Why it matters:** accounts, documents and payments raise the stakes for security and accessibility.

## Checklist

### Security
- [ ] Every server action and API route checks who is calling and what they may see
- [ ] Row level security reviewed on every table
- [ ] Secrets only on the server; nothing sensitive in client bundles
- [ ] Rate limits on sign-in, booking and messaging
- [ ] Two-factor sign-in for admins and tradespeople
- [ ] Dependency audit (`npm audit`) with no high or critical issues left open

### Accessibility
- [ ] Every screen of 05 to 08 passes axe, keyboard-only and NVDA checks
- [ ] VoiceOver on iPhone and Mac
- [ ] Real testers (elderly, blind, low vision) complete the whole loop without help

### Legal
- [ ] Privacy policy and terms reviewed by a solicitor
- [ ] Wording of the DBS and insurance checks reviewed

## Done when

Everything above is ticked and the client has signed off.
