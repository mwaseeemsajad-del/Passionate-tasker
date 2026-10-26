# 04: MVP launch

**Status:** Not started
**Phase:** MVP, target Thursday 22 October 2026
**Depends on:** 01, 02 (MVP items), 03, and inputs N3 to N8 in the README
**Why it matters:** the first real customers.

## Checklist

### Content: nothing on the site may be untrue
- [ ] Sample figures (12,400+ jobs, 1,500+ tradespeople, 98%, 4.9 from 2,180 reviews) replaced with real ones or removed
- [ ] Sample reviews and "recent jobs" replaced with real ones or removed
- [ ] Pricing plans: launch only what the team can deliver, or hide the section
- [ ] Prices marked "indicative" until confirmed
- [ ] The trust promises (ID, DBS, insurance, registers) are true for every tradesperson the team will send
- [ ] Real phone number and support hours in `src/data/site.ts`

### Legal pages
- [ ] Privacy policy (what is collected in a booking, why, how long it is kept, who sees it)
- [ ] Terms of use
- [ ] Cookie notice, only if non-essential cookies or analytics are added

### Production
- [ ] Vercel project in the client's account, connected to the new GitHub repo
- [ ] Environment variables set in Vercel
- [ ] Domain connected, HTTPS on, `site.url` updated
- [ ] `robots.txt`, `sitemap.xml`, page titles and share images
- [ ] Error monitoring (Vercel's logs at minimum)
- [ ] Lighthouse on phone: performance, accessibility and SEO all 90 or more

### Final checks
- [ ] Lint, build and `npm run booking` pass against the production build
- [ ] One real booking by form and one by voice on the live site, received by the team
- [ ] Tested on an iPhone, an Android phone and a Windows laptop

## Done when

The site is live on the client's domain, a real request reaches the team, and
nothing on it claims more than is true.
