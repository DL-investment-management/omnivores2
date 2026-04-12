import { lessonSeeds, questionSeeds, shopItemSeeds, userProgressSeeds } from "@/lib/seedData";

const LOCAL_USER_KEY = "econogo_local_user";
const LOCAL_PROGRESS_KEY = "econogo_local_progress";
const LOCAL_PURCHASES_KEY = "econogo_local_purchases";
const LOCAL_UNLOCKED_AUTHORS_KEY = "econogo_unlocked_authors";
const LOCAL_PRO_KEY = "econogo_pro";
const USER_UPDATED_EVENT = "econogo:user-updated";
const AUTHORS_UPDATED_EVENT = "econogo:authors-updated";

// ── Freemium: units available for free ──
export const FREE_UNITS = ["Supply & Demand"];

export function isProUser() {
  if (!canUseLocalStorage()) return false;
  return localStorage.getItem(LOCAL_PRO_KEY) === "true";
}

export function setPro(val) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(LOCAL_PRO_KEY, val ? "true" : "false");
  window.dispatchEvent(new CustomEvent("econogo:pro-updated", { detail: !!val }));
}

// Fetch authoritative Pro status from the server and sync to localStorage.
// Call this once on app load with the user's email.
export async function syncProStatus(email) {
  if (!email) return;
  try {
    const res = await fetch("/api/check-pro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return;
    const { is_pro } = await res.json();
    setPro(is_pro);
  } catch {
    // Network error — keep whatever is stored locally
  }
}

// Called once after Google sign-in to ensure localStorage has the right user.
export function initUserSession(email, fullName) {
  if (!canUseLocalStorage() || !email) return;
  const stored = readStoredJson(LOCAL_USER_KEY, null);
  // If we already have data for this exact email, keep it (preserve XP, streak, etc.)
  if (stored?.email === email) return;
  // New user or different Google account — start fresh
  writeStoredJson(LOCAL_USER_KEY, {
    email,
    full_name: fullName || email.split("@")[0],
    xp: 0,
    capital: 25,
    streak: 0,
    rank: getRank(0),
    avatar: "🐂",
    last_active_date: getYesterday(),
  });
}

export function isUnitFree(unitName) {
  return FREE_UNITS.includes(unitName);
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function getRank(xp) {
  if (xp >= 1000) return "Economist";
  if (xp >= 500) return "Analyst";
  if (xp >= 200) return "Student";
  if (xp >= 50) return "Beginner";
  return "Novice";
}

function sortLessons(lessons) {
  return [...lessons].sort((left, right) => {
    const unitOrder = (left.unit_order || 0) - (right.unit_order || 0);
    if (unitOrder !== 0) return unitOrder;
    return (left.lesson_order || 0) - (right.lesson_order || 0);
  });
}

function sortProgress(progress) {
  return [...progress].sort((left, right) => {
    const leftDate = new Date(left.completed_date || left.created_date || 0).getTime();
    const rightDate = new Date(right.completed_date || right.created_date || 0).getTime();
    return rightDate - leftDate;
  });
}

function readStoredJson(key, fallbackValue) {
  if (!canUseLocalStorage()) return fallbackValue;
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredJson(key, value) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifyUserUpdated(user) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(USER_UPDATED_EVENT, { detail: clone(user) }));
}

function notifyAuthorsUpdated(authorIds) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTHORS_UPDATED_EVENT, { detail: clone(authorIds) }));
}

function getSeedProgressForUser(userEmail) {
  return userProgressSeeds.filter((progress) => progress.user_email === userEmail);
}

function getYesterday() {
  return new Date(Date.now() - 86400000).toISOString().split("T")[0];
}

function getFallbackUser() {
  const storedUser = readStoredJson(LOCAL_USER_KEY, null);
  if (storedUser) return storedUser;

  const seedXp = userProgressSeeds.reduce((total, progress) => total + (progress.xp_earned || 0), 0);
  return {
    email: "donaldliang45@gmail.com",
    full_name: "Economist",
    xp: seedXp,
    capital: 25,
    streak: 0,
    rank: getRank(seedXp),
    avatar: "🐂",
    last_active_date: getYesterday(),
  };
}

function mergeProgressRecords(progress) {
  const recordMap = new Map();

  progress.forEach((record) => {
    const key = `${record.user_email}:${record.lesson_id}`;
    recordMap.set(key, record);
  });

  return sortProgress(Array.from(recordMap.values()));
}

function getLocalProgress(userEmail) {
  const storedProgress = readStoredJson(LOCAL_PROGRESS_KEY, []);
  const combined = mergeProgressRecords([...getSeedProgressForUser(userEmail), ...storedProgress]);
  return combined.filter((record) => record.user_email === userEmail);
}

export function isUsingLocalDataMode() {
  return true;
}

export async function getCurrentUser() {
  const user = clone(getFallbackUser());
  // Migrate stale last_active_date so streak logic works on first use.
  const today = new Date().toISOString().split("T")[0];
  const yesterday = getYesterday();
  if (user.last_active_date !== today && user.last_active_date !== yesterday) {
    const migrated = { ...user, last_active_date: yesterday, streak: 0 };
    writeStoredJson(LOCAL_USER_KEY, migrated);
    return migrated;
  }
  return user;
}

/**
 * Check in for today: increment streak if last active was yesterday,
 * reset to 1 if it's been longer, or do nothing if already checked in today.
 * Returns { user, streakGrew } so callers can show celebrations.
 */
export async function checkInStreak() {
  const user = await getCurrentUser();
  const today = new Date().toISOString().split("T")[0];

  // Already checked in today — no change
  if (user.last_active_date === today) {
    return { user, streakGrew: false };
  }

  const yesterday = getYesterday();
  let newStreak;
  if (user.last_active_date === yesterday) {
    newStreak = (user.streak || 0) + 1;
  } else {
    // Missed a day or first ever — start fresh
    newStreak = 1;
  }

  const updated = await updateCurrentUser({
    streak: newStreak,
    last_active_date: today,
  });
  return { user: updated, streakGrew: true };
}

export async function updateCurrentUser(patch) {
  const nextUser = {
    ...getFallbackUser(),
    ...patch,
  };
  writeStoredJson(LOCAL_USER_KEY, nextUser);
  notifyUserUpdated(nextUser);
  return clone(nextUser);
}

export function subscribeToCurrentUser(callback) {
  if (typeof window === "undefined") return () => {};

  const handleUserUpdated = (event) => {
    if (event.detail) {
      callback(clone(event.detail));
      return;
    }
    getCurrentUser().then(callback).catch(() => {});
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_USER_KEY) {
      getCurrentUser().then(callback).catch(() => {});
    }
  };

  window.addEventListener(USER_UPDATED_EVENT, handleUserUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdated);
    window.removeEventListener("storage", handleStorage);
  };
}

export async function getLessons() {
  return clone(sortLessons(lessonSeeds));
}

export async function getLessonById(id) {
  return clone(lessonSeeds.find((lesson) => lesson.id === id) || null);
}

export async function getQuestionsByLessonId(lessonId) {
  return clone(
    questionSeeds
      .filter((question) => question.lesson_id === lessonId)
      .sort((left, right) => (left.question_order || 0) - (right.question_order || 0))
  );
}

export async function getUserProgress(userEmail) {
  return clone(getLocalProgress(userEmail));
}

export async function saveUserProgress(progressRecord) {
  const localProgress = readStoredJson(LOCAL_PROGRESS_KEY, []);
  const updatedProgress = mergeProgressRecords([...localProgress, progressRecord]);
  writeStoredJson(LOCAL_PROGRESS_KEY, updatedProgress);
  return clone(progressRecord);
}

export async function getShopItems() {
  return clone(shopItemSeeds);
}

export async function createPurchase(purchaseRecord) {
  const purchases = readStoredJson(LOCAL_PURCHASES_KEY, []);
  purchases.push({
    ...purchaseRecord,
    created_date: new Date().toISOString(),
  });
  writeStoredJson(LOCAL_PURCHASES_KEY, purchases);
  return clone(purchaseRecord);
}

export function getUnlockedAuthorIds() {
  return readStoredJson(LOCAL_UNLOCKED_AUTHORS_KEY, []);
}

export async function unlockAuthorReward(authorId) {
  const unlocked = getUnlockedAuthorIds();
  if (unlocked.includes(authorId)) return clone(unlocked);

  const nextUnlocked = [...unlocked, authorId];
  writeStoredJson(LOCAL_UNLOCKED_AUTHORS_KEY, nextUnlocked);
  notifyAuthorsUpdated(nextUnlocked);
  return clone(nextUnlocked);
}

export function subscribeToUnlockedAuthors(callback) {
  if (typeof window === "undefined") return () => {};

  const handleAuthorsUpdated = (event) => {
    callback(clone(event.detail || getUnlockedAuthorIds()));
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_UNLOCKED_AUTHORS_KEY) {
      callback(getUnlockedAuthorIds());
    }
  };

  window.addEventListener(AUTHORS_UPDATED_EVENT, handleAuthorsUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTHORS_UPDATED_EVENT, handleAuthorsUpdated);
    window.removeEventListener("storage", handleStorage);
  };
}

// ── Dev console helpers (access via  econ  in browser DevTools) ──
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const _yesterday = () => new Date(Date.now() - 86400000).toISOString().split("T")[0];

  window.econ = {
    async status() {
      const u = await getCurrentUser();
      console.table({
        name: u.full_name,
        xp: u.xp,
        capital: u.capital,
        streak: u.streak,
        last_active: u.last_active_date,
        rank: u.rank,
        avatar: u.avatar,
      });
      return u;
    },

    async setStreak(n) {
      const u = await updateCurrentUser({ streak: n });
      console.log(`Streak set to ${n}`);
      return u;
    },

    async setXP(n) {
      const u = await updateCurrentUser({ xp: n, rank: getRank(n) });
      console.log(`XP set to ${n} (rank: ${u.rank})`);
      return u;
    },

    async addXP(n) {
      const u = await getCurrentUser();
      return window.econ.setXP((u.xp || 0) + n);
    },

    async setCapital(n) {
      const u = await updateCurrentUser({ capital: n });
      console.log(`Capital set to ${n}`);
      return u;
    },

    async addCapital(n) {
      const u = await getCurrentUser();
      return window.econ.setCapital((u.capital || 0) + n);
    },

    async simulateYesterday() {
      const u = await updateCurrentUser({ last_active_date: _yesterday() });
      console.log(`last_active_date set to yesterday (${_yesterday()}). Refresh to trigger streak increment.`);
      return u;
    },

    async resetProgress() {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_PROGRESS_KEY);
      localStorage.removeItem(LOCAL_PURCHASES_KEY);
      localStorage.removeItem(LOCAL_UNLOCKED_AUTHORS_KEY);
      console.log("All progress wiped. Refresh the page.");
    },

    help() {
      console.log(
        "Econ-Go Dev Console\n" +
        "-------------------\n" +
        "  econ.status()            Show current user stats\n" +
        "  econ.setStreak(5)        Set streak to 5\n" +
        "  econ.setXP(500)          Set XP to 500\n" +
        "  econ.addXP(100)          Add 100 XP\n" +
        "  econ.setCapital(999)     Set capital to 999\n" +
        "  econ.addCapital(50)      Add 50 capital\n" +
        "  econ.simulateYesterday() Pretend last visit was yesterday (refresh to trigger streak)\n" +
        "  econ.resetProgress()     Wipe all saved data (refresh after)\n" +
        "  econ.setPro(true/false)  Toggle Pro status\n" +
        "  econ.help()              Show this menu"
      );
    },

    setPro(val) {
      setPro(val);
      console.log(`Pro status set to ${val}. Refresh the page.`);
    },
  };
}