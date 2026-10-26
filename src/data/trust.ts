/*
 * What we check about a tradesperson, in the exact words the site uses.
 * One source for every page that mentions a check. The rule: a badge says
 * what was checked. "Trusted" or "Verified" on its own tells a customer
 * nothing, so neither is used.
 */

export type Check = { id: string; title: string; appliesTo: string; body: string[] };

export const checks: Check[] = [
  {
    id: "identity",
    title: "Identity checked",
    appliesTo: "Every tradesperson",
    body: [
      "We see government photo ID, such as a passport or driving licence, and check it belongs to the person we are sending.",
      "Nobody is sent to a job until this check is done.",
    ],
  },
  {
    id: "dbs",
    title: "Basic DBS check seen",
    appliesTo: "Every tradesperson",
    body: [
      "A basic DBS certificate shows any unspent criminal convictions. It is the level of check anyone can be asked for. In Scotland it comes from Disclosure Scotland, and in Northern Ireland from AccessNI.",
      "A certificate is a record of one day, so we ask for a new one every year.",
    ],
  },
  {
    id: "insurance",
    title: "Public liability insurance checked",
    appliesTo: "Every tradesperson",
    body: [
      "This insurance pays if a tradesperson damages your home or injures someone while working. We look at the certificate itself: the insurer, the amount of cover and the date it runs out.",
      "When the cover runs out, that tradesperson is not sent to jobs until we have seen the renewal.",
    ],
  },
  {
    id: "gas-safe",
    title: "Gas Safe Register checked",
    appliesTo: "Everyone doing gas, boiler or heating work",
    body: [
      "By law, anyone working on gas appliances or pipework must be on the Gas Safe Register. We look each engineer up on the register ourselves, and check the type of work their card covers.",
      "Ask to see their Gas Safe ID card when they arrive. You can check the number yourself on the Gas Safe Register website or by calling 0800 408 5500.",
    ],
  },
  {
    id: "electrical",
    title: "Electrical scheme membership checked",
    appliesTo: "Electricians doing work that has to be certified",
    body: [
      "Some electrical work, such as a new circuit or a new fuse box, must be certified under the Building Regulations. For that work we only send electricians registered with a government-approved scheme such as NICEIC or NAPIT, and we check the scheme's own public register.",
    ],
  },
];

export const recheckNote =
  "Every check is done before a tradesperson's first job, again every year, and whenever a document runs out.";

export const gasEmergency =
  "If you can smell gas, leave the building, do not use light switches or flames, and call the National Gas Emergency Service on 0800 111 999. It is free, and open day and night.";
