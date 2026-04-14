import { useEffect, useState } from "react";
import LessonNode from "../components/LessonNode";
import MascotAvatar from "../components/MascotAvatar";
import StreakBadge from "../components/StreakBadge";
import StreakCelebration from "../components/StreakCelebration";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { checkInStreak, getCurrentUser, getLessons, getUnlockedAuthorIds, getUserProgress, subscribeToUnlockedAuthors, unlockAuthorReward, isProUser, isUnitFree, needsOnboarding, markOnboardingDone } from "@/lib/appData";
import { triggerLoginQuest, triggerStreakQuest } from "@/lib/quests";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { AnimatePresence } from "framer-motion";
import { getLevelInfo } from "@/lib/progression";
import { getAuthorRewardForUnit } from "@/lib/authorRewards";
import UnitAuthorNode from "@/components/UnitAuthorNode";
import { Crown } from "lucide-react";

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
  const [isPro, setIsPro] = useState(isProUser());

  useEffect(() => {
    const handler = (e) => setIsPro(e.detail);
    window.addEventListener("econogo:pro-updated", handler);
    return () => window.removeEventListener("econogo:pro-updated", handler);
  }, []);
  const [showStreakPreview, setShowStreakPreview] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingStreakGrew, setPendingStreakGrew] = useState(false);

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

        {/* Learning Path */}
        {Object.entries(filteredUnits).map(([unitName, unitLessons]) => {
        const unitLocked = !isUnitFree(unitName) && !isPro;
        return (
        <div key={unitName} className="mb-10">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-base font-heading font-bold text-foreground inline-flex items-center gap-2">
              {unitName}
              {unitLocked && (
                <span className="inline-flex items-center gap-1 bg-yellow-500/15 text-yellow-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              )}
            </h2>
          </motion.div>

          {unitLocked ? (
            <div className="flex w-full max-w-[320px] flex-col mx-auto items-center">
              <button
                onClick={() => navigate("/upgrade")}
                className="w-full bg-card/60 border border-border rounded-2xl p-8 flex flex-col items-center gap-3 opacity-70 hover:opacity-100 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-yellow-500" />
                </div>
                <p className="text-sm font-heading font-bold text-foreground">Unlock with Pro</p>
                <p className="text-xs text-muted-foreground">{unitLessons.length} lesson{unitLessons.length > 1 ? 's' : ''} · Tap to upgrade</p>
              </button>
            </div>
          ) : (

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
          )}
        </div>
      )})}

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
