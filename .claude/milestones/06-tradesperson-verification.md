# 06: Tradesperson onboarding and verification

**Status:** Not started
**Phase:** after the MVP launch
**Depends on:** 05
**Why it matters:** every trust promise on the site depends on this being real.

## Checklist

- [ ] Sign-up: trades, area covered (postcode districts), availability, phone
- [ ] Document upload to private Supabase Storage, opened only through short-lived signed links: photo ID, public liability insurance, Gas Safe card (gas and heating), NICEIC or NAPIT membership (electrical)
- [ ] Basic DBS check: how it is requested and recorded (needs a provider and legal advice)
- [ ] Admin review screen: approve or reject each document, with expiry dates
- [ ] Badges that say exactly what was checked and when ("Gas Safe register checked, 21 Oct 2026")
- [ ] Reminder and automatic pause when a document expires
- [ ] Audit log: who reviewed what, and when
- [ ] Gas and heating jobs can only go to Gas Safe registered engineers

## Done when

A tradesperson can sign up and upload documents, an admin can verify them,
and the profile shows only checks that were actually done.
