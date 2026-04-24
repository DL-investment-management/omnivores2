import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MascotAvatar from "../components/MascotAvatar";
import { getLessonById } from "@/lib/appData";

export default function PreLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const loaded = await getLessonById(id);
        setLesson(loaded);
      } catch (e) {
        console.error("PreLesson load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-xl font-heading font-bold mb-4">Lesson not found</p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const vocab = lesson.vocabulary || [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-bold font-heading">Pre-Lesson Briefing</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <MascotAvatar size="lg" mood="thinking" className="mx-auto mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{lesson.unit}</p>
        <h1 className="text-2xl font-heading font-black mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        )}
      </motion.div>

      {/* Vocabulary Section */}
      {vocab.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Key Vocabulary
          </h2>
          <div className="space-y-3">
            {vocab.map((item, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <p className="font-heading font-bold text-primary text-sm mb-1">{item.term}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.definition}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {vocab.length === 0 && (
        <div className="text-center py-8 mb-8">
          <p className="text-muted-foreground text-sm">No vocabulary terms for this lesson.</p>
        </div>
      )}

      {/* Rewards Preview */}
      <motion.div
        className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-center justify-around"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <p className="text-lg font-heading font-black text-primary">+{lesson.xp_reward || 10}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">XP</p>
        </div>
        {lesson.capital_reward > 0 && (
          <div className="text-center">
            <p className="text-lg font-heading font-black text-secondary">+{lesson.capital_reward}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Capital</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-heading font-black text-foreground">60%</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Pass Score</p>
        </div>
      </motion.div>

      {/* Start Button */}
      <Button
        onClick={() => navigate(`/lesson/${id}`)}
        className="w-full rounded-xl h-12 text-base font-heading font-bold bg-primary hover:bg-primary/90"
      >
        Start Lesson
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
