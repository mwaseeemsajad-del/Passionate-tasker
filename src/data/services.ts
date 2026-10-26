import type { Service, ServiceJob, Trade } from "@/types/content";
import { photos } from "./photos";

// SAMPLE DATA for the prototype. Prices are placeholders; confirm real
// starting prices before launch.

/** Offered under every trade, for jobs that are not on the list. */
export const OTHER_JOB: ServiceJob = { slug: "something-else", name: "Something else", fromPrice: null };

export const services: Service[] = [
  {
    slug: "plumbing",
    name: "Plumbing",
    person: "a plumber",
    summary: "Dripping taps, blocked sinks, running toilets, new showers and same-day burst pipes.",
    fromPrice: 65,
    highlight: "Same-day slots",
    photoAlt: "plumber fixing pipework under a sink",
    photo: photos.plumbing,
    jobs: [
      { slug: "dripping-tap", name: "Dripping tap", fromPrice: 65 },
      { slug: "blocked-sink", name: "Blocked sink or bath", fromPrice: 75 },
      { slug: "running-toilet", name: "Toilet that keeps running", fromPrice: 70 },
      { slug: "new-shower", name: "Fit a new shower", fromPrice: 180 },
      { slug: "burst-pipe", name: "Burst pipe or leak, urgent", fromPrice: 120 },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical",
    person: "an electrician",
    summary: "Sockets, lights, tripping fuse boxes, outdoor lighting and EICR safety certificates.",
    fromPrice: 70,
    registration: "NICEIC or NAPIT",
    highlight: "Certificate emailed",
    photoAlt: "electrician testing a fuse board with a multimeter",
    photo: photos.electrical,
    jobs: [
      { slug: "socket-switch", name: "Replace a socket or switch", fromPrice: 70 },
      { slug: "ceiling-light", name: "Fit a ceiling light", fromPrice: 85 },
      { slug: "fuse-tripping", name: "Fuse box keeps tripping", fromPrice: 95 },
      { slug: "outdoor-light", name: "Outdoor light with a sensor", fromPrice: 140 },
      { slug: "eicr", name: "EICR safety certificate", fromPrice: 160 },
    ],
  },
  {
    slug: "gas",
    name: "Gas",
    person: "a gas engineer",
    summary: "Gas hobs and cookers fitted or moved, gas fires serviced, gas safety checks and supplies capped off.",
    fromPrice: 79,
    registration: "Gas Safe registered",
    highlight: "Gas Safe ID shown on arrival",
    notice: "If you can smell gas, do not book online. Leave the building, do not use switches, and call the National Gas Emergency Service on 0800 111 999 now. It is free, day and night.",
    photoAlt: "gas hob burner with a blue flame",
    photo: photos.gas,
    jobs: [
      { slug: "gas-hob", name: "Fit or move a gas hob or cooker", fromPrice: 95 },
      { slug: "gas-fire", name: "Service a gas fire", fromPrice: 85 },
      { slug: "gas-safety-check", name: "Gas safety check", fromPrice: 79 },
      { slug: "cap-gas", name: "Cap off a gas supply", fromPrice: 90 },
    ],
  },
  {
    slug: "heating",
    name: "Heating and boilers",
    person: "a heating engineer",
    summary: "Annual boiler services, no heat or hot water, radiators and landlord gas certificates.",
    fromPrice: 79,
    registration: "Gas Safe registered",
    highlight: "Winter slots open",
    photoAlt: "radiator under a window",
    photo: photos.heating,
    jobs: [
      { slug: "boiler-service", name: "Annual boiler service", fromPrice: 89 },
      { slug: "no-heating", name: "No heating or hot water", fromPrice: 110 },
      { slug: "radiators", name: "Bleed and balance radiators", fromPrice: 75 },
      { slug: "gas-certificate", name: "Landlord gas safety certificate", fromPrice: 79 },
    ],
  },
  {
    slug: "painting",
    name: "Painting and decorating",
    person: "a painter and decorator",
    summary: "Rooms, ceilings, doors and skirting, wallpaper, and outside walls and fences.",
    fromPrice: 90,
    highlight: "Dust sheets and clean-up included",
    photoAlt: "decorator painting a wall with a roller",
    photo: photos.painting,
    jobs: [
      { slug: "paint-room", name: "Paint a room", fromPrice: 180 },
      { slug: "paint-ceiling", name: "Paint a ceiling", fromPrice: 120 },
      { slug: "doors-skirting", name: "Paint doors and skirting", fromPrice: 90 },
      { slug: "wallpaper", name: "Hang wallpaper", fromPrice: 150 },
      { slug: "fence-exterior", name: "Paint a fence or outside wall", fromPrice: 120 },
    ],
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    person: "a carpenter",
    summary: "Internal doors hung, skirting and architrave fitted, alcove shelves and cupboards built.",
    fromPrice: 60,
    highlight: "Made to measure",
    photoAlt: "carpenter marking a wooden board with a pencil",
    photo: photos.carpentry,
    jobs: [
      { slug: "hang-door", name: "Hang an internal door", fromPrice: 85 },
      { slug: "skirting", name: "Fit skirting boards", fromPrice: 120 },
      { slug: "alcove", name: "Build alcove shelves or a cupboard", fromPrice: 250 },
      { slug: "cabinet-doors", name: "Fix or refit kitchen cupboard doors", fromPrice: 60 },
    ],
  },
  {
    slug: "handyman",
    name: "Handyman and mounting",
    person: "a handyperson",
    summary: "Shelves, TVs, curtain poles, sticking doors, flat-pack furniture and an hour of odd jobs.",
    fromPrice: 45,
    priceUnit: "hour",
    highlight: "Bring your list",
    photoAlt: "handyperson using a cordless drill",
    photo: photos.handyman,
    jobs: [
      { slug: "odd-jobs", name: "An hour of odd jobs", fromPrice: 45 },
      { slug: "shelves", name: "Put up shelves", fromPrice: 50 },
      { slug: "tv-mounting", name: "Mount a TV on the wall", fromPrice: 55 },
      { slug: "sticking-door", name: "Fix a door that sticks", fromPrice: 55 },
      { slug: "flat-pack", name: "Build flat-pack furniture", fromPrice: 35 },
    ],
  },
];

export function getService(slug: string | null | undefined): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** The jobs to choose from for a trade, with "Something else" last. */
export function jobsFor(trade: Trade | ""): ServiceJob[] {
  const service = getService(trade);
  return service ? [...service.jobs, OTHER_JOB] : [];
}

export function formatFromPrice(job: ServiceJob): string {
  return job.fromPrice === null ? "Priced after a quick call" : `From £${job.fromPrice}`;
}
