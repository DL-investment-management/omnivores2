import { motion } from "framer-motion";
import { Sparkles, Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COMING_FEATURES = [
  { emoji: "🧠", title: "AI-Graded Answers", desc: "Type your response and get instant intelligent feedback" },
  { emoji: "🌍", title: "Global Leaderboard", desc: "Compete with economics students around the world" },
  { emoji: "📚", title: "Full Glossary", desc: "Searchable dictionary of every economics term" },
  { emoji: "📖", title: "Good Reads", desc: "Curated articles and books recommended by top economists" },
  { emoji: "🎨", title: "Exclusive Cosmetics", desc: "Rare avatar items, hats, watches, and outfits" },
  { emoji: "🛒", title: "Shop", desc: "Spend your Capital on premium items and power-ups" },
];

export default function ProUpgrade() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <span className="inline-block bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          Coming Soon
        </span>
        <h1 className="text-3xl font-heading font-black mb-3">Pro is on its way</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          We're building something great. For now, <strong className="text-foreground">everything is completely free</strong> — all 7 units, all lessons, no limits.
        </p>
      </motion.div>

      {/* Feature preview cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-8 text-left"
      >
        {COMING_FEATURES.map(({ emoji, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <span className="text-2xl mb-2 block">{emoji}</span>
            <p className="font-heading font-bold text-sm mb-1">{title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Notify me CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mb-6"
      >
        <Bell className="w-6 h-6 text-primary mx-auto mb-2" />
        <p className="font-heading font-bold mb-1">Stay in the loop</p>
        <p className="text-xs text-muted-foreground mb-3">
          We'll announce Pro when it launches. Keep learning and your progress will carry over automatically.
        </p>
      </motion.div>

      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="rounded-xl font-heading font-bold w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learning
      </Button>
    </div>
  );
}
