import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function QuizMultipleChoice({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const isCorrect = option === question.correct_answer;
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground leading-snug">
        {question.question_text}
      </h2>
      <div className="space-y-3 mt-6">
        {question.options?.map((option, i) => {
          const isCorrect = option === question.correct_answer;
          const isSelected = selected === option;
          let style = "bg-card border-2 border-border hover:border-primary/50 hover:bg-primary/5";

          if (answered && isSelected && isCorrect) {
            style = "bg-success/10 border-2 border-success";
          } else if (answered && isSelected && !isCorrect) {
            style = "bg-destructive/10 border-2 border-destructive";
          } else if (answered && isCorrect) {
            style = "bg-success/10 border-2 border-success/50";
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(option)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between ${style} ${
                answered && isSelected && !isCorrect ? "animate-shake" : ""
              }`}
              whileTap={!answered ? { scale: 0.98 } : {}}
            >
              <span className="font-semibold text-sm">{option}</span>
              {answered && isSelected && isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-success" />
                </motion.div>
              )}
              {answered && isSelected && !isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <X className="w-5 h-5 text-destructive" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      {answered && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/30 rounded-xl p-4 mt-4"
        >
          <p className="text-sm text-foreground">
            <span className="font-bold">💡 </span>
            {question.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
}
