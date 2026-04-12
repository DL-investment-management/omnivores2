export const LEVELS = [
  {
    level: 1,
    minXp: 0,
    title: "Fresh Face",
  },
  {
    level: 2,
    minXp: 40,
    title: "Market Scout",
  },
  {
    level: 3,
    minXp: 90,
    title: "Pattern Reader",
  },
  {
    level: 4,
    minXp: 160,
    title: "Signal Hunter",
  },
  {
    level: 5,
    minXp: 250,
    title: "Macro Master",
  },
];

export const LEVEL_COSMETICS = [
  // ── Level 1 — Fresh Face ──
  {
    id: "bull",
    name: "Bronze Bull",
    icon: "🐂",
    requiredLevel: 1,
    flavor: "Your starter mascot for entering the market.",
  },
  {
    id: "hamster",
    name: "Market Hamster",
    icon: "🐹",
    requiredLevel: 1,
    flavor: "Hoards gains just like acorns. Every bit compounds.",
  },
  {
    id: "penguin",
    name: "Cool Penguin",
    icon: "🐧",
    requiredLevel: 1,
    flavor: "Ice-cold under pressure, warm on returns.",
  },
  {
    id: "tortoise",
    name: "Patient Tortoise",
    icon: "🐢",
    requiredLevel: 1,
    flavor: "Slow money always beats fast money.",
  },
  {
    id: "bee",
    name: "Worker Bee",
    icon: "🐝",
    requiredLevel: 1,
    flavor: "Compounds one drop at a time.",
  },

  // ── Level 2 — Market Scout ──
  {
    id: "fox",
    name: "Clever Fox",
    icon: "🦊",
    requiredLevel: 2,
    flavor: "Spots tradeoffs and opportunities others walk past.",
  },
  {
    id: "raccoon",
    name: "Value Raccoon",
    icon: "🦝",
    requiredLevel: 2,
    flavor: "Finds diamonds in overlooked places.",
  },
  {
    id: "seal",
    name: "Seal of Approval",
    icon: "🦭",
    requiredLevel: 2,
    flavor: "Only signs off on solid fundamentals.",
  },
  {
    id: "koala",
    name: "Patient Koala",
    icon: "🐨",
    requiredLevel: 2,
    flavor: "Selective, calm, and rarely wrong.",
  },
  {
    id: "oracle",
    name: "The Oracle",
    icon: "👴",
    requiredLevel: 2,
    flavor: "Inspired by Warren Buffett — buy great businesses at fair prices and hold forever.",
  },

  // ── Level 3 — Pattern Reader ──
  {
    id: "owl",
    name: "Night Owl",
    icon: "🦉",
    requiredLevel: 3,
    flavor: "Sees the patterns everyone else misses.",
  },
  {
    id: "wolf",
    name: "Alpha Wolf",
    icon: "🐺",
    requiredLevel: 3,
    flavor: "Leads when others follow the herd.",
  },
  {
    id: "panda",
    name: "Calm Panda",
    icon: "🐼",
    requiredLevel: 3,
    flavor: "Rare, zen, and routinely underestimated.",
  },
  {
    id: "otter",
    name: "River Otter",
    icon: "🦦",
    requiredLevel: 3,
    flavor: "Works smarter and dives deeper than the rest.",
  },
  {
    id: "philosopher",
    name: "The Philosopher",
    icon: "🧔",
    requiredLevel: 3,
    flavor: "Inspired by Karl Marx — the thinker who questioned everything about capital.",
  },

  // ── Level 4 — Signal Hunter ──
  {
    id: "lion",
    name: "Market Lion",
    icon: "🦁",
    requiredLevel: 4,
    flavor: "Confidence built under real pressure.",
  },
  {
    id: "tiger",
    name: "Quant Tiger",
    icon: "🐯",
    requiredLevel: 4,
    flavor: "Strikes with precision, never with guesswork.",
  },
  {
    id: "shark",
    name: "Bull Shark",
    icon: "🦈",
    requiredLevel: 4,
    flavor: "Always moving. Never sleeping. Never afraid.",
  },
  {
    id: "leopard",
    name: "Spot Leopard",
    icon: "🐆",
    requiredLevel: 4,
    flavor: "Speed and accuracy are the only edges that matter.",
  },
  {
    id: "invisible-hand",
    name: "Invisible Hand",
    icon: "🎩",
    requiredLevel: 4,
    flavor: "Inspired by Adam Smith — who proved markets coordinate themselves without anyone in charge.",
  },

  // ── Level 5 — Macro Master ──
  {
    id: "eagle",
    name: "Sky Eagle",
    icon: "🦅",
    requiredLevel: 5,
    flavor: "The full field of play, seen from above.",
  },
  {
    id: "dragon",
    name: "Gold Dragon",
    icon: "🐉",
    requiredLevel: 5,
    flavor: "Mythical gains. Mythical discipline.",
  },
  {
    id: "butterfly",
    name: "Butterfly Effect",
    icon: "🦋",
    requiredLevel: 5,
    flavor: "Tiny inputs. Market-moving outputs.",
  },
  {
    id: "strategist",
    name: "The Strategist",
    icon: "♟️",
    requiredLevel: 5,
    flavor: "Inspired by John Nash — who solved equilibrium and changed game theory forever.",
  },
  {
    id: "macro-mind",
    name: "The Macro Mind",
    icon: "📊",
    requiredLevel: 5,
    flavor: "Inspired by Keynes — who taught governments how to fight recessions.",
  },
];

export function getLevelInfo(xp = 0) {
  const safeXp = Math.max(0, xp || 0);
  const current =
    [...LEVELS].reverse().find((entry) => safeXp >= entry.minXp) || LEVELS[0];
  const next = LEVELS.find((entry) => entry.level === current.level + 1) || null;
  const currentMinXp = current.minXp;
  const nextMinXp = next?.minXp ?? currentMinXp;
  const xpIntoLevel = safeXp - currentMinXp;
  const xpForNextLevel = next ? nextMinXp - currentMinXp : 0;
  const progressPercent = next
    ? Math.min((xpIntoLevel / xpForNextLevel) * 100, 100)
    : 100;

  return {
    level: current.level,
    title: current.title,
    current,
    next,
    currentMinXp,
    nextMinXp,
    progressPercent,
    xpToNextLevel: next ? Math.max(next.minXp - safeXp, 0) : 0,
  };
}

export function getUnlockedCosmetics(xp = 0) {
  const { level } = getLevelInfo(xp);
  return LEVEL_COSMETICS.filter((cosmetic) => cosmetic.requiredLevel <= level);
}

export function isCosmeticUnlocked(xp = 0, requiredLevel = 1) {
  return getLevelInfo(xp).level >= requiredLevel;
}

export function getNewlyUnlockedCosmetics(previousXp = 0, nextXp = 0) {
  const previousLevel = getLevelInfo(previousXp).level;
  const nextLevel = getLevelInfo(nextXp).level;

  if (nextLevel <= previousLevel) return [];

  return LEVEL_COSMETICS.filter(
    (cosmetic) =>
      cosmetic.requiredLevel > previousLevel && cosmetic.requiredLevel <= nextLevel
  );
}