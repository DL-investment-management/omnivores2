import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookMarked, Search } from "lucide-react";
import { getLessons } from "@/lib/appData";

export default function Glossary() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Economics Glossary — Econ-Go";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Free economics glossary with definitions for supply & demand, microeconomics, macroeconomics, behavioral economics, personal finance, and more — from Econ-Go.");
    return () => {
      document.title = "Econ-Go — Learn Economics Free, One Lesson at a Time";
      if (desc) desc.setAttribute("content", "Learn economics completely free — bite-sized lessons, daily streaks, and quizzes covering supply & demand, micro, macro, behavioral economics, personal finance, and more.");
    };
  }, []);

  useEffect(() => {
    getLessons()
      .then((l) => {
        setLessons(l);
      })
      .catch((e) => {
        console.error("Glossary load error:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Flatten all vocab terms across lessons
  const allTerms = lessons.flatMap((lesson) =>
    (lesson.vocabulary || []).map((v) => ({
      ...v,
      unit: lesson.unit,
      lessonTitle: lesson.title,
    }))
  );

  const filtered = allTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase())
  );

  // Group by unit
  const grouped = filtered.reduce((acc, term) => {
    if (!acc[term.unit]) acc[term.unit] = [];
    acc[term.unit].push(term);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
          <BookMarked className="w-7 h-7 text-accent" />
        </div>
        <h1 className="text-2xl font-heading font-black">Glossary</h1>
        <p className="text-sm text-muted-foreground">All key economics terms</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Terms */}
      {Object.entries(grouped).map(([unit, terms]) => (
        <div key={unit} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{unit}</h2>
          <div className="space-y-3">
            {terms.map((term, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <p className="font-heading font-bold text-primary text-sm mb-1">{term.term}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{term.definition}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wide">{term.lessonTitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookMarked className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-heading font-bold mb-2">No terms found</h2>
          <p className="text-muted-foreground text-sm">
            {search ? "Try a different search term." : "Complete lessons to unlock vocabulary!"}
          </p>
        </div>
      )}
    </div>
  );
}
