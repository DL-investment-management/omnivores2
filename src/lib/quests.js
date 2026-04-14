import { getCurrentUser, updateCurrentUser } from "./appData";

const DAILY_KEY = "econogo_daily_quests";
const SPECIAL_KEY = "econogo_special_quests";

// ── Quest definitions ──────────────────────────────────────────────────────
export const DAILY_QUEST_DEFS = [
  { id: "daily_login",       label: "Show Up",      description: "Log in today",                  xp: 5,  icon: "📅" },
  { id: "daily_lesson",      label: "Scholar",       description: "Complete a lesson",              xp: 15, icon: "📚" },
  { id: "daily_shop",        label: "Shopper",       description: "Buy something from the shop",    xp: 10, icon: "🛍️" },
  { id: "daily_streak",      label: "On Fire",       description: "Keep your streak alive",         xp: 5,  icon: "🔥" },
  { id: "daily_leaderboard", label: "Competitor",    description: "Check the leaderboard",          xp: 5,  icon: "🏆" },
];

export const SPECIAL_QUEST_DEFS = [
  { id: "streak_1",  label: "First Step",     description: "Achieve a 1-day streak",  xp: 10,  icon: "🌱", requirement: 1  },
  { id: "streak_2",  label: "On a Roll",      description: "Achieve a 2-day streak",  xp: 20,  icon: "🔥", requirement: 2  },
  { id: "streak_5",  label: "Hot Streak",     description: "Achieve a 5-day streak",  xp: 50,  icon: "⚡", requirement: 5  },
  { id: "streak_10", label: "Consistent",     description: "Achieve a 10-day streak", xp: 100, icon: "💪", requirement: 10 },
  { id: "streak_30", label: "Streak Legend",  description: "Achieve a 30-day streak", xp: 250, icon: "👑", requirement: 30 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function readJson(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function notify() {
  window.dispatchEvent(new CustomEvent("econogo:quests-updated"));
}

// ── Daily state ────────────────────────────────────────────────────────────
function getDailyState() {
  const state = readJson(DAILY_KEY, {});
  if (state.date !== getToday()) {
    return { date: getToday(), completed: [], claimed: [] };
  }
  return state;
}

function saveDailyState(state) { writeJson(DAILY_KEY, state); }

// ── Special state ──────────────────────────────────────────────────────────
function getSpecialState() { return readJson(SPECIAL_KEY, { claimed: [] }); }
function saveSpecialState(state) { writeJson(SPECIAL_KEY, state); }

// ── Public getters ─────────────────────────────────────────────────────────
export function getDailyQuests() {
  const state = getDailyState();
  return DAILY_QUEST_DEFS.map((def) => ({
    ...def,
    completed: state.completed.includes(def.id),
    claimed:   state.claimed.includes(def.id),
  }));
}

export function getSpecialQuests(currentStreak = 0) {
  const state = getSpecialState();
  return SPECIAL_QUEST_DEFS.map((def) => ({
    ...def,
    completed: currentStreak >= def.requirement,
    claimed:   state.claimed.includes(def.id),
    progress:  Math.min(currentStreak, def.requirement),
  }));
}

export function getUnclaimedCount(currentStreak = 0) {
  const ds = getDailyState();
  const ss = getSpecialState();
  const daily = DAILY_QUEST_DEFS.filter(
    (d) => ds.completed.includes(d.id) && !ds.claimed.includes(d.id)
  ).length;
  const special = SPECIAL_QUEST_DEFS.filter(
    (d) => currentStreak >= d.requirement && !ss.claimed.includes(d.id)
  ).length;
  return daily + special;
}

// ── Triggers (called from other pages) ────────────────────────────────────
export function triggerDailyQuest(questId) {
  const state = getDailyState();
  if (!state.completed.includes(questId)) {
    state.completed.push(questId);
    saveDailyState(state);
    notify();
  }
}

export const triggerLoginQuest       = () => triggerDailyQuest("daily_login");
export const triggerLessonQuest      = () => triggerDailyQuest("daily_lesson");
export const triggerShopQuest        = () => triggerDailyQuest("daily_shop");
export const triggerStreakQuest      = () => triggerDailyQuest("daily_streak");
export const triggerLeaderboardQuest = () => triggerDailyQuest("daily_leaderboard");

// ── Claim rewards ──────────────────────────────────────────────────────────
export async function claimDailyQuest(questId) {
  const state = getDailyState();
  if (state.claimed.includes(questId) || !state.completed.includes(questId)) return false;
  const def = DAILY_QUEST_DEFS.find((d) => d.id === questId);
  if (!def) return false;
  state.claimed.push(questId);
  saveDailyState(state);
  const user = await getCurrentUser();
  await updateCurrentUser({ xp: (user.xp || 0) + def.xp });
  notify();
  return true;
}

export async function claimSpecialQuest(questId, currentStreak) {
  const state = getSpecialState();
  if (state.claimed.includes(questId)) return false;
  const def = SPECIAL_QUEST_DEFS.find((d) => d.id === questId);
  if (!def || currentStreak < def.requirement) return false;
  state.claimed.push(questId);
  saveSpecialState(state);
  const user = await getCurrentUser();
  await updateCurrentUser({ xp: (user.xp || 0) + def.xp });
  notify();
  return true;
}
