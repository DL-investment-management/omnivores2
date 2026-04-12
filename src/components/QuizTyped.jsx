import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

export default function QuizTyped({ question, onAnswer }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");

  const checkAnswer = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question_text,
          answer: value,
          explanation: question.explanation,
        }),
      });
      const data = await res.json();
      setIsCorrect(Boolean(data.correct));
      setFeedback(data.feedback || question.explanation);
    } catch {
      // offline fallback — keyword match
      const keywords = (question.correct_answer || "")
        .split("|")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      const userNorm = value.trim().toLowerCase();
      const matched = keywords.length === 0 || keywords.some((kw) => userNorm.includes(kw));
      setIsCorrect(matched);
      setFeedback(question.explanation);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleContinue = () => onAnswer(isCorrect);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="font-heading font-bold text-sm text-primary uppercase tracking-widest">
            Short Answer — AI Graded
          </p>
        </div>
        <p className="font-heading font-bold text-lg leading-snug mb-4">
          {question.question_text}
        </p>

        <textarea
          className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          rows={3}
          placeholder="Type your answer here…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={submitted || loading}
        />

        {!submitted && (
          <Button
            onClick={checkAnswer}
            disabled={!value.trim() || loading}
            className="w-full mt-3 rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Grading…
              </span>
            ) : "Submit Answer"}
          </Button>
        )}

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-xl p-4 border ${
              isCorrect
                ? "bg-green-500/10 border-green-500/30"
                : "bg-destructive/10 border-destructive/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <span className={`font-bold text-sm ${isCorrect ? "text-green-600" : "text-destructive"}`}>
                {isCorrect ? "Great answer!" : "Not quite — here's the key idea:"}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{feedback}</p>
            <Button onClick={handleContinue} className="w-full mt-4 rounded-xl">
              Continue
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
