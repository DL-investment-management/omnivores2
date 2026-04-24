import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Zap } from "lucide-react";
import { getCurrentUser, updateCurrentUser } from "@/lib/appData";

const QUESTIONS_PER_QUIZ = 3;
const XP_PER_CORRECT = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(vocab) {
  if (!vocab || vocab.length < 4) return [];
  const pool = shuffle(vocab);
  const picked = pool.slice(0, Math.min(QUESTIONS_PER_QUIZ, pool.length));

  return picked.map((term) => {
    const wrongs = shuffle(pool.filter((t) => t.term !== term.term)).slice(0, 3);
    const options = shuffle([
      { text: term.definition, correct: true },
      ...wrongs.map((w) => ({ text: w.definition, correct: false })),
    ]);
    return { term: term.term, lessonTitle: term.lessonTitle, options };
  });
}

export default function MiniQuizModal({ vocab, emoji, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null); // index of chosen option
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  useEffect(() => {
    setQuestions(generateQuestions(vocab));
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setXpAwarded(false);
  }, [vocab]);

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (selected !== null) return; // already answered
      const correct = questions[qIndex].options[optionIndex].correct;
      setSelected(optionIndex);

      if (correct) {
        setScore((s) => s + 1);
      } else {
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 500);
      }

      // Advance after brief pause
      setTimeout(() => {
        if (qIndex + 1 >= questions.length) {
          setDone(true);
        } else {
          setQIndex((q) => q + 1);
          setSelected(null);
        }
      }, 900);
    },
    [selected, qIndex, questions]
  );

  // Award XP once when done screen appears
  useEffect(() => {
    if (!done || xpAwarded || score === 0) return;
    setXpAwarded(true);
    const earned = score * XP_PER_CORRECT;
    getCurrentUser().then((u) => {
      updateCurrentUser({ ...u, xp: (u.xp || 0) + earned });
    });
  }, [done, xpAwarded, score]);

  if (questions.length === 0) return null;

  const currentQ = questions[qIndex];
  const earned = score * XP_PER_CORRECT;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal card */}
        <motion.div
          key="card"
          className="relative z-10 bg-card border border-border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">Mini Quiz</p>
                {!done && (
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {qIndex + 1} / {questions.length}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              {!done ? (
                /* Question view */
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-5">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: `${(qIndex / questions.length) * 100}%` }}
                      animate={{ width: `${((qIndex + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {currentQ.lessonTitle}
                  </p>
                  <p className="font-heading font-black text-lg text-foreground mb-5">
                    What does <span className="text-primary">{currentQ.term}</span> mean?
                  </p>

                  <div className="space-y-3">
                    {currentQ.options.map((opt, i) => {
                      const isChosen = selected === i;
                      const isCorrect = opt.correct;
                      let bgClass = "bg-muted/60 border-border hover:bg-muted";
                      if (selected !== null) {
                        if (isCorrect) bgClass = "bg-green-500/15 border-green-500";
                        else if (isChosen) bgClass = "bg-red-500/15 border-red-500";
                        else bgClass = "bg-muted/30 border-border opacity-50";
                      }

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={selected !== null}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-3 ${bgClass}`}
                          animate={isChosen && !opt.correct && shakeWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                          {selected !== null && isCorrect && (
                            <CheckCircle className="ml-auto w-4 h-4 text-green-500 shrink-0" />
                          )}
                          {selected !== null && isChosen && !isCorrect && (
                            <XCircle className="ml-auto w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* Completion view */
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="text-center py-4"
                >
                  <motion.div
                    className="text-6xl mb-3"
                    animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {score === questions.length ? "🏆" : score >= Math.ceil(questions.length / 2) ? "⭐" : "💪"}
                  </motion.div>
                  <h3 className="font-heading font-black text-2xl text-foreground mb-1">
                    {score === questions.length
                      ? "Perfect!"
                      : score >= Math.ceil(questions.length / 2)
                      ? "Nice work!"
                      : "Keep going!"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {score} / {questions.length} correct
                  </p>

                  {earned > 0 && (
                    <motion.div
                      className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
                    >
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-black text-primary text-sm">+{earned} XP earned!</span>
                    </motion.div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Continue Learning
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
