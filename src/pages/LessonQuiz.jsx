import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Heart, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QuizMultipleChoice from "../components/QuizMultipleChoice";
import QuizTrueFalse from "../components/QuizTrueFalse";
import QuizMatching from "../components/QuizMatching";
import QuizTyped from "../components/QuizTyped";
import XPAnimation from "../components/XPAnimation";
import StreakCelebration from "../components/StreakCelebration";
import {
  checkInStreak,
  getCurrentUser,
  getLessonById,
  getQuestionsByLessonId,
  saveUserProgress,
  updateCurrentUser,
  isProUser,
  isUnitFree,
  getEnergy,
  spendEnergy,
  msUntilEnergy,
  ENERGY_COST_PER_QUESTION,
  MAX_ENERGY,
} from "@/lib/appData";
import { getLevelInfo, getNewlyUnlockedCosmetics } from "@/lib/progression";
import { getAuthorRewardForUnit } from "@/lib/authorRewards";

export default function LessonQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [newStreak, setNewStreak] = useState(0);
  const [showOverview, setShowOverview] = useState(true);
  const [energy, setEnergy] = useState(() => getEnergy());
  const [outOfEnergy, setOutOfEnergy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [loadedLesson, qs] = await Promise.all([
          getLessonById(id),
          getQuestionsByLessonId(id),
        ]);
        // Freemium gate: redirect if Pro-only lesson
        if (loadedLesson && !isUnitFree(loadedLesson.unit) && !isProUser()) {
          navigate("/upgrade", { replace: true });
          return;
        }
        setLesson(loadedLesson);
        setQuestions(qs);
      } catch (e) {
        console.error("LessonQuiz load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAnswer = async (isCorrect) => {
    // Deduct energy for this answer
    spendEnergy(ENERGY_COST_PER_QUESTION);
    const remaining = getEnergy();
    setEnergy(remaining);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setLives((l) => l - 1);
    }

    const isLastQuestion = currentIndex + 1 >= questions.length;
    const outOfLives = !isCorrect && lives <= 1;

    if (isLastQuestion || outOfLives) {
      await completeLesson(isCorrect ? correctCount + 1 : correctCount);
    } else if (remaining < ENERGY_COST_PER_QUESTION) {
      // Out of energy — can't continue
      setOutOfEnergy(true);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  };

  const completeLesson = async (finalCorrect) => {
    const score = Math.round((finalCorrect / questions.length) * 100);
    const passed = score >= 60;
    const xpEarned = passed ? (lesson?.xp_reward || 10) : 0;
    const capitalEarned = passed ? (lesson?.capital_reward || 5) : 0;

    const user = await getCurrentUser();

    // Save progress
    await saveUserProgress({
      user_email: user.email,
      lesson_id: id,
      completed: passed,
      score,
      xp_earned: xpEarned,
      completed_date: new Date().toISOString(),
    });

    if (passed) {
      // Update user stats
      const previousXp = user.xp || 0;
      const nextXp = previousXp + xpEarned;
      const previousLevel = getLevelInfo(previousXp);
      const nextLevel = getLevelInfo(nextXp);
      const newlyUnlockedCosmetics = getNewlyUnlockedCosmetics(previousXp, nextXp);

      // Streak check-in (handles yesterday/today/stale logic centrally)
      const { user: checkedInUser, streakGrew } = await checkInStreak();

      await updateCurrentUser({
        xp: nextXp,
        capital: (user.capital || 0) + capitalEarned,
        rank: getRank(nextXp),
      });

      if (nextLevel.level > previousLevel.level) {
        const unlockedMessage = newlyUnlockedCosmetics.length > 0
          ? `Unlocked ${newlyUnlockedCosmetics.map((cosmetic) => `${cosmetic.icon} ${cosmetic.name}`).join(", ")}.`
          : "";
        toast.success(`Level up! You reached Level ${nextLevel.level}. ${unlockedMessage}`.trim());
      }

      if (streakGrew) {
        setNewStreak(checkedInUser.streak);
        setShowStreakCelebration(true);
      }

      setShowXP(true);
      setTimeout(() => {
        setShowXP(false);
        setFinished(true);
      }, 2000);
    } else {
      setFinished(true);
    }
  };

  const getRank = (xp) => {
    if (xp >= 1000) return "Economist";
    if (xp >= 500) return "Analyst";
    if (xp >= 200) return "Student";
    if (xp >= 50) return "Beginner";
    return "Novice";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson || questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-xl font-heading font-bold mb-4">No questions found</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const progressPercent = ((currentIndex + (finished ? 1 : 0)) / questions.length) * 100;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= 60;

  if (finished) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-6">
            <span className="text-5xl">{passed ? "🏆" : "😢"}</span>
          </div>
          <h1 className="text-3xl font-heading font-black mb-2">
            {passed ? "Lesson Complete!" : "Try Again"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? `You scored ${score}% and earned ${lesson.xp_reward || 10} XP!`
              : `You scored ${score}%. You need 60% to pass.`}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">
              Dashboard
            </Button>
            {!passed && (
              <Button
                onClick={() => {
                  setCurrentIndex(0);
                  setCorrectCount(0);
                  setLives(3);
                  setFinished(false);
                }}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                Retry
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const vocab = lesson?.vocabulary || [];
  const unitAuthor = getAuthorRewardForUnit(lesson?.unit);

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <XPAnimation xp={lesson?.xp_reward || 10} show={showXP} />
      <StreakCelebration streak={newStreak} show={showStreakCelebration} onDismiss={() => setShowStreakCelebration(false)} />

      {/* Pre-lesson overview popup */}
      <AnimatePresence>
        {showOverview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">
            <motion.div
              className="bg-card rounded-2xl border border-border w-full max-w-lg p-6 sm:p-8 relative my-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <button
                onClick={() => setShowOverview(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{lesson.icon || "📖"}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{lesson.unit}</p>
                  <h2 className="text-2xl font-heading font-black leading-tight">{lesson.title}</h2>
                </div>
              </div>

              {lesson.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{lesson.description}</p>
              )}

              {/* Key Definitions */}
              {vocab.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Definitions</p>
                  <div className="space-y-2">
                    {vocab.map((v, i) => (
                      <div key={i} className="bg-muted rounded-xl p-3">
                        <p className="font-bold text-primary text-sm">{v.term}</p>
                        <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">{v.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson-specific fun fact */}
              {lesson.did_you_know && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Did You Know?</p>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    "{lesson.did_you_know}"
                  </p>
                  {unitAuthor && (
                    <p className="text-xs text-muted-foreground mt-2 font-semibold">
                      Finish this unit to unlock {unitAuthor.avatar} {unitAuthor.author}
                    </p>
                  )}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5 flex-wrap">
                <span className="font-semibold text-primary">+{lesson.xp_reward || 10} XP</span>
                {(lesson.capital_reward || 0) > 0 && <span className="font-semibold text-secondary">+{lesson.capital_reward} Capital</span>}
                <span>{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> 3 lives</span>
                <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                  <Zap className="w-3.5 h-3.5 fill-yellow-500" /> {energy}/{MAX_ENERGY}
                </span>
              </div>

              <Button
                onClick={() => setShowOverview(false)}
                className="w-full rounded-xl h-12 font-heading font-bold text-base"
              >
                Start Quiz
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Out of energy overlay */}
      {outOfEnergy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 text-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-heading font-black mb-1">Out of Energy</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Your energy regens over 72 hours.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Come back in ~{(() => {
                const ms = msUntilEnergy(ENERGY_COST_PER_QUESTION);
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                return h > 0 ? `${h}h ${m}m` : `${m}m`;
              })()}
            </p>
            <Button onClick={() => navigate("/")} className="w-full rounded-xl font-heading font-bold">
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <Progress value={progressPercent} className="flex-1 h-3 rounded-full" />
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-500">
            <Zap className="w-3.5 h-3.5 fill-yellow-500" />{energy}
          </span>
          <span className="text-muted-foreground/30">|</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 ${i < lives ? "text-destructive fill-destructive" : "text-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Lesson Title */}
      <div className="mb-4">
        <p className="text-xs font-bold text-primary uppercase tracking-wide">{lesson.unit}</p>
        <p className="text-sm text-muted-foreground">{lesson.title}</p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {currentQ.question_type === "multiple_choice" && (
            <QuizMultipleChoice question={currentQ} onAnswer={handleAnswer} />
          )}
          {currentQ.question_type === "true_false" && (
            <QuizTrueFalse question={currentQ} onAnswer={handleAnswer} />
          )}
          {currentQ.question_type === "matching" && (
            <QuizMatching question={currentQ} onAnswer={handleAnswer} />
          )}
          {currentQ.question_type === "typed" && (
            <QuizTyped question={currentQ} onAnswer={handleAnswer} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Question Counter */}
      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground font-semibold">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>
    </div>
  );
}
