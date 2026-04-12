import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export default function QuizMatching({ question, onAnswer }) {
  const pairs = question.matching_pairs || [];
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongPair, setWrongPair] = useState(null);

  const shuffledDefs = useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5).map((p) => p.definition),
    [pairs]
  );

  const allMatched = Object.keys(matches).length === pairs.length;

  const handleTermClick = (term) => {
    if (matches[term]) return;
    setSelectedTerm(term);
    setWrongPair(null);
  };

  const handleDefClick = (def) => {
    if (!selectedTerm) return;
    if (Object.values(matches).includes(def)) return;

    const correctPair = pairs.find((p) => p.term === selectedTerm);
    if (correctPair && correctPair.definition === def) {
      const newMatches = { ...matches, [selectedTerm]: def };
      setMatches(newMatches);
      setSelectedTerm(null);
      if (Object.keys(newMatches).length === pairs.length) {
        setTimeout(() => onAnswer(true), 800);
      }
    } else {
      setWrongPair({ term: selectedTerm, def });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground leading-snug">
        Match the terms with their definitions
      </h2>
      <div className="grid grid-cols-2 gap-3 mt-6">
        {/* Terms Column */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Terms</p>
          {pairs.map((pair) => {
            const isMatched = !!matches[pair.term];
            const isSelected = selectedTerm === pair.term;
            const isWrong = wrongPair?.term === pair.term;
            return (
              <motion.button
                key={pair.term}
                onClick={() => handleTermClick(pair.term)}
                className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-all ${
                  isMatched
                    ? "bg-success/10 border-2 border-success text-success"
                    : isWrong
                    ? "bg-destructive/10 border-2 border-destructive animate-shake"
                    : isSelected
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border-2 border-border"
                }`}
                disabled={isMatched}
              >
                {isMatched && <Check className="w-3 h-3 inline mr-1" />}
                {pair.term}
              </motion.button>
            );
          })}
        </div>
        {/* Definitions Column */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Definitions</p>
          {shuffledDefs.map((def) => {
            const isMatched = Object.values(matches).includes(def);
            const isWrong = wrongPair?.def === def;
            return (
              <motion.button
                key={def}
                onClick={() => handleDefClick(def)}
                className={`w-full text-left p-3 rounded-lg text-xs transition-all ${
                  isMatched
                    ? "bg-success/10 border-2 border-success text-success"
                    : isWrong
                    ? "bg-destructive/10 border-2 border-destructive animate-shake"
                    : "bg-card border-2 border-border hover:border-accent/50"
                }`}
                disabled={isMatched}
              >
                {isMatched && <Check className="w-3 h-3 inline mr-1" />}
                {def}
              </motion.button>
            );
          })}
        </div>
      </div>
      {allMatched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success/10 border border-success/30 rounded-xl p-4 text-center"
        >
          <p className="font-bold text-success">🎉 All matched correctly!</p>
        </motion.div>
      )}
    </div>
  );
}
