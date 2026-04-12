import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function QuizTrueFalse({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const isCorrect = option === question.correct_answer;
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  const options = ["True", "False"];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground leading-snug">
        {question.question_text}
      </h2>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {options.map((option) => {
          const isCorrect = option === question.correct_answer;
          const isSelected = selected === option;
          let style = "bg-card border-2 border-border hover:border-primary/50";

          if (answered && isSelected && isCorrect) {
            style = "bg-success/10 border-2 border-success";
          } else if (answered && isSelected && !isCorrect) {
            style = "bg-destructive/10 border-2 border-destructive";
          } else if (answered && isCorrect) {
            style = "bg-success/10 border-2 border-success/50";
          }

          return (
            <motion.button
              key={option}
              onClick={() => handleSelect(option)}
              className={`p-6 rounded-xl flex flex-col items-center gap-2 transition-all ${style} ${
                answered && isSelected && !isCorrect ? "animate-shake" : ""
              }`}
              whileTap={!answered ? { scale: 0.95 } : {}}
            >
              {option === "True" ? (
                <Check className={`w-8 h-8 ${answered && isCorrect ? "text-success" : "text-primary"}`} />
              ) : (
                <X className={`w-8 h-8 ${answered && isSelected && !isCorrect ? "text-destructive" : "text-destructive/60"}`} />
              )}
              <span className="font-bold text-sm">{option}</span>
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
