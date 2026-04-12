
import { motion } from "framer-motion";
import { Lock, Check, Star, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LessonNode({ lesson, status, index }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const vocab = lesson.vocabulary || [];
  // status: "completed" | "active" | "locked"
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";

  const isLeft = index % 2 === 0;

  return (
    <motion.div
      className={`flex w-full max-w-[320px] flex-col ${isLeft ? "items-start" : "items-end"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {isActive || isCompleted ? (
        <button onClick={() => setShowPopup(true)} className="group">
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isCompleted
                ? "bg-primary shadow-lg shadow-primary/20"
                : "bg-secondary shadow-lg shadow-secondary/30 group-hover:scale-110"
            }`}
          >
            {isCompleted ? (
              <Check className="w-7 h-7 text-primary-foreground stroke-[3]" />
            ) : (
              <Star className="w-7 h-7 text-secondary-foreground" />
            )}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-[10px]">⭐</span>
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center opacity-50">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <span
        className={`mt-2 text-xs font-semibold text-center max-w-[100px] ${
          isLocked ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {lesson.title}
      </span>

      {/* Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{lesson.unit}</p>
                <h3 className="text-lg font-heading font-black">{lesson.title}</h3>
              </div>
              <button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {lesson.description && (
              <p className="text-sm text-muted-foreground mb-4">{lesson.description}</p>
            )}

            {vocab.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Concepts</p>
                <div className="space-y-2">
                  {vocab.map((v, i) => (
                    <div key={i} className="bg-muted rounded-xl p-3">
                      <p className="font-bold text-primary text-sm">{v.term}</p>
                      <p className="text-xs text-foreground/80 mt-0.5">{v.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-5 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">+{lesson.xp_reward || 10} XP</span>
              {lesson.capital_reward > 0 && <span className="font-semibold text-secondary">+{lesson.capital_reward} Capital</span>}
            </div>

            <Button
              onClick={() => { setShowPopup(false); navigate(`/lesson/${lesson.id}`); }}
              className="w-full rounded-xl h-11 font-heading font-bold"
            >
              Start Lesson <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
