import { useEffect, useState } from "react";
import LessonNode from "../components/LessonNode";
import MascotAvatar from "../components/MascotAvatar";
import StreakBadge from "../components/StreakBadge";
import StreakCelebration from "../components/StreakCelebration";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { checkInStreak, getCurrentUser, getLessons, getUnlockedAuthorIds, getUserProgress, subscribeToUnlockedAuthors, unlockAuthorReward, needsOnboarding, markOnboardingDone } from "@/lib/appData";
import { triggerLoginQuest, triggerStreakQuest } from "@/lib/quests";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import LevelUpCelebration from "@/components/LevelUpCelebration";
import { AnimatePresence } from "framer-motion";
import { getLevelInfo } from "@/lib/progression";
import { getAuthorRewardForUnit } from "@/lib/authorRewards";
import UnitAuthorNode from "@/components/UnitAuthorNode";

const LAST_KNOWN_LEVEL_KEY = "econogo_last_known_level";
const LAST_KNOWN_XP_KEY = "econogo_last_known_xp";

const LEFT_TERMS = [
  "Supply","Demand","Price","Market","Trade","Labor","Capital","Rent",
  "Profit","Loss","Revenue","Cost","Value","Tax","Debt","Bond",
  "Stock","Asset","Risk","Credit","Money","Export","Import","Tariff",
  "Surplus","Shortage","Utility","Equity","Budget","Deficit",
];
const RIGHT_TERMS = [
  "GDP","GNP","CPI","Inflation","Deflation","Recession","Growth","Interest",
  "Currency","Exchange","Reserve","Fiscal","Monetary","Banking","Loan","Mortgage",
  "Insurance","Return","Index","Dividend","Option","Hedge","Portfolio","Yield",
  "Margin","Subsidy","Quota","Wage","Savings","Investment",
];
const BUBBLE_COLORS = [
  "bg-primary/10 text-primary border-primary/25",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getWordOfTheDay(lessons) {
  const allTerms = lessons.flatMap((l) =>
    (l.vocabulary || []).map((v) => ({ ...v, lessonTitle: l.title, unit: l.unit, lessonIcon: l.icon }))
  );
  if (allTerms.length === 0) return null;
  return allTerms[getDayOfYear() % allTerms.length];
}

function PathConnector({ fromLeft, toLeft }) {
  const startX = fromLeft ? 32 : 288;
  const endX = toLeft ? 32 : 288;
  const controlY = 28;
  const path = `M ${startX} 0 C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} 64`;

  return (
    <div className="pointer-events-none relative -my-2 h-16 w-full">
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 320 64" fill="none">
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-border"
        />
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unlockedAuthors, setUnlockedAuthors] = useState([]);
  const [showStreakPreview, setShowStreakPreview] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingStreakGrew, setPendingStreakGrew] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpXp, setLevelUpXp] = useState(0);
  const [prevXpSnapshot, setPrevXpSnapshot] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const { user: u, streakGrew } = await checkInStreak();
        triggerLoginQuest();
        if ((u.streak || 0) > 0) triggerStreakQuest();
        const l = await getLessons();
        const p = await getUserProgress(u.email);
        setUser(u);
        setLessons(l);
        setProgress(p);
        setUnlockedAuthors(getUnlockedAuthorIds());

        // Level-up detection
        const currentXp = u.xp || 0;
        const currentLevel = getLevelInfo(currentXp).level;
        const storedLevel = parseInt(localStorage.getItem(LAST_KNOWN_LEVEL_KEY) || "1", 10);
        const storedXp = parseInt(localStorage.getItem(LAST_KNOWN_XP_KEY) || "0", 10);
        if (currentLevel > storedLevel) {
          setPrevXpSnapshot(storedXp);
          setLevelUpXp(currentXp);
          // Delay so it doesn't fight the onboarding / streak modal
          setTimeout(() => setShowLevelUp(true), 1200);
        }
        localStorage.setItem(LAST_KNOWN_LEVEL_KEY, String(currentLevel));
        localStorage.setItem(LAST_KNOWN_XP_KEY, String(currentXp));

        if (needsOnboarding()) {
          // Show tutorial first — hold streak animation until after
          setShowOnboarding(true);
          setPendingStreakGrew(streakGrew);
        } else if (streakGrew) {
          setTimeout(() => setShowStreakPreview(true), 600);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
    return subscribeToUnlockedAuthors(setUnlockedAuthors);
  }, []);

  const handleOnboardingComplete = () => {
    markOnboardingDone();
    setShowOnboarding(false);
    // Apply placement recommendation on first entry
    try {
      const placement = JSON.parse(localStorage.getItem("econogo_placement") || "null");
      if (placement?.unit && placement.firstVisit) {
        setSelectedUnit(placement.unit);
        localStorage.setItem("econogo_placement", JSON.stringify({ ...placement, firstVisit: false }));
      }
    } catch {}
    if (pendingStreakGrew) {
      setTimeout(() => setShowStreakPreview(true), 600);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));

  const getLessonStatus = (lesson, index) => {
    if (completedIds.has(lesson.id)) return "completed";
    if (index === 0) return "active";
    const prevLesson = lessons[index - 1];
    if (prevLesson && completedIds.has(prevLesson.id)) return "active";
    return "locked";
  };

  // Group lessons by unit
  const units = {};
  lessons.forEach((l) => {
    if (!units[l.unit]) units[l.unit] = [];
    units[l.unit].push(l);
  });

  // Sorted unique units
  const allUnits = [...new Set(lessons.map((l) => l.unit))];

  const filteredUnits = selectedUnit
    ? { [selectedUnit]: units[selectedUnit] }
    : units;
  const levelInfo = getLevelInfo(user?.xp || 0);

  const isUnitComplete = (unitLessons) =>
    unitLessons.length > 0 && unitLessons.every((lesson) => completedIds.has(lesson.id));

  return (
    <div className="flex max-w-4xl mx-auto">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 pt-6 pl-4 pr-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Units</p>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedUnit(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedUnit === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            All Units
          </button>
          {allUnits.map((unit) => (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedUnit === unit
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 px-4 py-6 min-w-0">
      {/* Greeting Section */}
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MascotAvatar size="md" mood="happy" />
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {user?.full_name || "Economist"} 👋
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <div className="cursor-pointer" onClick={() => setShowStreakPreview(true)}>
              <StreakBadge streak={user?.streak || 0} />
            </div>
            {/* XP progress bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground w-24">
                <span>Lv.{levelInfo.level} {levelInfo.title}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden w-24">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {levelInfo.xpToNextLevel > 0 ? `${levelInfo.xpToNextLevel} XP to next level` : "Max level"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTutorial
            userName={user?.full_name}
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <StreakCelebration streak={user?.streak || 0} show={showStreakPreview} onDismiss={() => setShowStreakPreview(false)} />
      <LevelUpCelebration show={showLevelUp} xp={levelUpXp} prevXp={prevXpSnapshot} onDismiss={() => setShowLevelUp(false)} />

        {/* Mobile Unit Selector */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedUnit(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedUnit === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            All
          </button>
          {allUnits.map((unit) => (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedUnit === unit
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {unit}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-heading font-black text-primary">{user?.xp || 0}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Total XP</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-heading font-black text-secondary">{completedIds.size}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Lessons</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-heading font-black text-accent">
            {user?.rank || "Novice"}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Rank</p>
        </div>
      </motion.div>

        {/* Word of the Day */}
        {(() => {
          const wotd = getWordOfTheDay(lessons);
          if (!wotd) return null;
          return (
            <motion.div
              className="mb-8 rounded-2xl overflow-hidden border border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-base">📖</span>
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Word of the Day</span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{wotd.lessonIcon} {wotd.lessonTitle}</span>
              </div>
              <div className="bg-card px-4 py-4">
                <p className="font-heading font-black text-lg text-foreground mb-1">{wotd.term}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{wotd.definition}</p>
              </div>
            </motion.div>
          );
        })()}

        {/* Learning Path */}
        <div className="relative">
          {/* Left term bubbles — desktop only, sprinkled down the path */}
          {LEFT_TERMS.map((term, i) => (
            <motion.div
              key={`lt-${term}`}
              className={`absolute hidden md:flex items-center justify-center w-11 h-11 rounded-full border-2 text-[8px] font-black text-center leading-tight pointer-events-none select-none z-10 ${BUBBLE_COLORS[i % BUBBLE_COLORS.length]}`}
              style={{ top: `${i * 118 + 60}px`, left: "calc(50% - 215px)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 + i * 0.04 }}
            >
              <span className="px-1 break-words max-w-[38px] text-center">{term}</span>
            </motion.div>
          ))}

          {/* Right term bubbles — offset by half a step so they stagger with left ones */}
          {RIGHT_TERMS.map((term, i) => (
            <motion.div
              key={`rt-${term}`}
              className={`absolute hidden md:flex items-center justify-center w-11 h-11 rounded-full border-2 text-[8px] font-black text-center leading-tight pointer-events-none select-none z-10 ${BUBBLE_COLORS[(i + 3) % BUBBLE_COLORS.length]}`}
              style={{ top: `${i * 118 + 119}px`, right: "calc(50% - 215px)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 + i * 0.04 }}
            >
              <span className="px-1 break-words max-w-[38px] text-center">{term}</span>
            </motion.div>
          ))}

        {Object.entries(filteredUnits).map(([unitName, unitLessons]) => (
        <div key={unitName} className="mb-10">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-base font-heading font-bold text-foreground">{unitName}</h2>
          </motion.div>

          <div className="flex w-full max-w-[320px] flex-col mx-auto">
            {(() => {
              const reward = getAuthorRewardForUnit(unitName);
              const unitComplete = isUnitComplete(unitLessons);
              const pathItems = unitLessons.map((lesson, i) => ({
                key: lesson.id,
                index: i,
                isLeft: i % 2 === 0,
                render: () => {
                  const globalIndex = lessons.indexOf(lesson);
                  return (
                    <LessonNode
                      lesson={lesson}
                      status={getLessonStatus(lesson, globalIndex)}
                      index={i}
                    />
                  );
                },
              }));

              if (reward) {
                const rewardStatus = unlockedAuthors.includes(reward.id)
                  ? "unlocked"
                  : unitComplete
                  ? "ready"
                  : "locked";

                pathItems.push({
                  key: `${unitName}-author`,
                  index: unitLessons.length,
                  isLeft: unitLessons.length % 2 === 0,
                  render: () => (
                    <UnitAuthorNode
                      reward={reward}
                      status={rewardStatus}
                      index={unitLessons.length}
                      onUnlock={async (authorId) => {
                        const nextUnlocked = await unlockAuthorReward(authorId);
                        setUnlockedAuthors(nextUnlocked);
                      }}
                      onOpenReads={() => navigate("/good-reads")}
                    />
                  ),
                });
              }

              return pathItems.map((item, itemIndex) => {
                const previousItem = pathItems[itemIndex - 1];

                return (
                  <div key={item.key} className="relative">
                    {previousItem && (
                      <PathConnector fromLeft={previousItem.isLeft} toLeft={item.isLeft} />
                    )}
                    {item.render()}
                  </div>
                );
              });
            })()}
          </div>
        </div>
        ))}
        </div>{/* end relative path wrapper */}

        {lessons.length === 0 && (
        <div className="text-center py-20">
          <MascotAvatar size="lg" mood="thinking" className="mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold mb-2">No lessons yet!</h2>
          <p className="text-muted-foreground">Check back soon for economics lessons.</p>
        </div>
      )}
      </div>
    </div>
  );
}
