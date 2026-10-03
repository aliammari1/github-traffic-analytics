// SPDX-License-Identifier: MIT

const MOCK_STAR_HISTORY = (() => {
  let stars = 124340;
  const releaseTime = Date.UTC(2026, 8, 15);
  return Array.from({ length: 40 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 7, 25 + index));
    if (index > 0) {
      stars += date.getTime() <= releaseTime ? 10 : 25;
    }
    return { date: date.toISOString().slice(0, 10), stars };
  });
})();

export const MOCK_PUBLIC_ANALYSIS = {
  repository: {
    id: 70107786,
    name: "next.js",
    fullName: "vercel/next.js",
    owner: {
      login: "vercel",
      avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
    },
    description: "The React Framework – created and maintained by @vercel",
    language: "JavaScript",
    starsCount: 125000,
    forksCount: 26000,
    openIssuesCount: 2400,
    createdAt: "2016-10-25T18:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
    htmlUrl: "https://github.com/vercel/next.js",
    homepage: "https://nextjs.org",
    topics: ["react", "framework", "nextjs"],
    license: "MIT",
  },
  starHistory: MOCK_STAR_HISTORY,
  starVelocity: {
    currentStars: 125000,
    growth7d: 120,
    growth30d: 500,
    weeklyVelocity: 120,
    dailyVelocity: 17.1,
  },
  releases: [
    {
      id: 999,
      name: "Next.js 16.0.0",
      tagName: "v16.0.0",
      publishedAt: "2026-09-15T12:00:00Z",
      htmlUrl: "https://github.com/vercel/next.js/releases/tag/v16.0.0",
      isPrerelease: false,
    },
  ],
  highlights: [
    "Added 500 stars over the last 30 days (~120 stars/week), reaching 125,000 total stars.",
    "Recent release v16.0.0 published on 2026-09-15.",
    "Historical persistence is not enabled yet for this repository; GitHub will delete traffic data older than 14 days.",
  ],
  isRateLimited: false,
};
