// Test questions for the plain-vs-Qloo comparison. `why` says what a plain
// LLM cannot know, which is where Qloo should add value.
export const QUESTIONS = [
  { id: "podcast-sponsors", q: "Which brands should sponsor the Huberman Lab podcast, and what is the age and gender mix of its audience?", why: "Audience data and brand affinity for a specific podcast" },
  { id: "audience-demographics", q: "Compare the age and gender skew of Taylor Swift fans and Radiohead fans.", why: "Measured audience demographics" },
  { id: "fan-differences", q: "What tastes distinguish Radiohead fans from Taylor Swift fans?", why: "Audience comparison on tags" },
  { id: "where-popular", q: "I want to open a record store in New York. Which parts of the city have the most Radiohead fans?", why: "Geographic affinity heatmap" },
  { id: "trend-dune", q: "Is interest in the movie Dune rising or falling over the last 9 months (2026-01-01 to 2026-09-30)?", why: "Live popularity time series" },
  { id: "cross-domain", q: "I loved Breaking Bad and Radiohead. Recommend one podcast and one video game I would like, and why.", why: "Cross-domain taste transfer" },
  { id: "rank-brands", q: "Rank Patagonia, Nike and Gucci for women aged 25-34 in Chicago.", why: "Demographic + location affinity ranking" },
  { id: "gaming-brands", q: "Which brands have the strongest overlap with Elden Ring players?", why: "Brand affinity of a niche audience" },
  { id: "lisbon", q: "I love Radiohead and The Grand Budapest Hotel. Where should I eat and hang out in Lisbon?", why: "Taste-to-place recommendation" },
];
