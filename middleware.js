// Vercel Edge Middleware — serves route-specific meta tags to social crawlers.
// Real users pass through to the normal Vite SPA.

export const config = {
  matcher: ["/", "/leaderboard", "/glossary", "/good-reads", "/shop", "/upgrade", "/our-team", "/contact", "/privacy", "/terms"],
};

const ROUTE_META = {
  "/": {
    title: "Econ-Go — Learn Economics One Lesson at a Time",
    description: "Learn economics free — bite-sized lessons, daily streaks, and quizzes covering supply & demand, micro, macro, and more. Start in seconds.",
  },
  "/leaderboard": {
    title: "Leaderboard — Top Economists | Econ-Go",
    description: "See who's leading the global economics leaderboard. Compete with learners worldwide and climb the XP rankings on Econ-Go.",
  },
  "/glossary": {
    title: "Economics Glossary | Econ-Go",
    description: "Master economics terms simply. Supply & demand, GDP, inflation, opportunity cost, and more — all explained in plain English.",
  },
  "/good-reads": {
    title: "Economics Good Reads | Econ-Go",
    description: "Books and resources recommended by top economists and investors. A curated reading list for anyone serious about economics.",
  },
  "/shop": {
    title: "Shop — Avatars & Cosmetics | Econ-Go",
    description: "Customize your Econ-Go profile with unique avatars and cosmetics. Earn capital by completing economics lessons.",
  },
  "/upgrade": {
    title: "Go Pro — Econ-Go",
    description: "Unlock the full Econ-Go experience. All 7 economics units, AI-graded answers, leaderboard, glossary, and more for $4.99/month.",
  },
  "/our-team": {
    title: "Our Team | Econ-Go",
    description: "Meet the team behind Econ-Go — the free economics learning app with bite-sized lessons and daily streaks.",
  },
  "/contact": {
    title: "Contact Us | Econ-Go",
    description: "Get in touch with the Econ-Go team. We'd love to hear your feedback, questions, or ideas.",
  },
  "/privacy": {
    title: "Privacy Policy | Econ-Go",
    description: "Read the Econ-Go privacy policy to understand how we collect, use, and protect your data.",
  },
  "/terms": {
    title: "Terms of Service | Econ-Go",
    description: "Read the Econ-Go terms of service before using the app.",
  },
};

const BOT_PATTERN =
  /facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|Googlebot|bingbot|DuckDuckBot|Applebot/i;

export default function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_PATTERN.test(ua)) return; // real user — serve normal SPA

  const path = new URL(request.url).pathname;
  const meta = ROUTE_META[path] || ROUTE_META["/"];
  const canonical = `https://econ-go.com${path}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Econ-Go" />
  <meta property="og:image" content="https://econ-go.com/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="https://econ-go.com/og-image.png" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
