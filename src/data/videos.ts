/*
 * Background videos for the hero, played one after another.
 * PLACEHOLDER footage from Pexels (free under the Pexels licence, credit not
 * required), streamed from Pexels' own servers. Replace with the client's
 * own footage of real Passionate Taskers tradespeople before launch.
 */

export type HeroVideo = { src: string; description: string; source: string };

export const heroVideos: HeroVideo[] = [
  {
    src: "https://videos.pexels.com/video-files/7584762/7584762-hd_1280_720_25fps.mp4",
    description: "plumber fitting pipework under a sink",
    source: "https://www.pexels.com/video/a-person-doing-plumbing-7584762/",
  },
  {
    src: "https://videos.pexels.com/video-files/6079417/6079417-hd_1280_720_24fps.mp4",
    description: "electrician stripping a cable",
    source: "https://www.pexels.com/video/person-fixing-wires-6079417/",
  },
  {
    src: "https://videos.pexels.com/video-files/9823147/9823147-hd_1280_720_25fps.mp4",
    description: "decorator painting a wall with a roller",
    source: "https://www.pexels.com/video/rear-view-on-woman-painting-wall-with-white-paint-9823147/",
  },
];
