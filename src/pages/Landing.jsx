import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
  BookOpen, Flame, Trophy, Zap, Target,
  CheckCircle, ChevronRight, Star, Users, BookMarked,
  TrendingUp, Brain, Globe, BarChart3, Coins, Download, Smartphone, Share,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const handleGoogleSignIn = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
};

// ── Data ────────────────────────────────────────────────────────────────────
const UNITS = [
  { icon: TrendingUp, name: "Supply & Demand",         desc: "The foundation of all economics — how prices and quantities are determined by buyers and sellers.", lessons: 4 },
  { icon: Brain,      name: "Intro to Microeconomics", desc: "How individuals and firms make decisions, from consumer behavior to market structures.",             lessons: 3 },
  { icon: BarChart3,  name: "Inflation",               desc: "Why prices rise over time, what causes inflation, and how central banks respond.",                  lessons: 3 },
  { icon: Globe,      name: "Game Theory",             desc: "Strategic thinking, the prisoner's dilemma, Nash equilibrium, and real-world applications.",         lessons: 2 },
  { icon: BookOpen,   name: "History of Economics",    desc: "From Adam Smith to Keynes — the ideas that shaped modern economic thought.",                        lessons: 2 },
  { icon: Coins,      name: "Macro 101",               desc: "GDP, unemployment, fiscal policy, and how governments manage national economies.",                  lessons: 3 },
  { icon: Users,      name: "Behavioral Economics",    desc: "Why people don't always act rationally — cognitive biases, nudges, and real decision-making.",       lessons: 2 },
];

const FEATURES = [
  { icon: BookOpen,  title: "Bite-sized Lessons",   desc: "Each lesson takes under 5 minutes. Learn at your pace, on any device, no textbook required." },
  { icon: Flame,     title: "Daily Streaks",         desc: "Build a learning habit. Come back every day to keep your streak alive and earn bonus XP." },
  { icon: Trophy,    title: "Leaderboard",           desc: "See how you stack up against other learners globally. Compete for the top rank." },
  { icon: Target,    title: "Quests & Missions",     desc: "Daily and special quests keep learning fresh. Complete milestones to earn XP rewards." },
  { icon: BookMarked, title: "Economics Glossary",  desc: "Every term, defined clearly. Your personal economics dictionary, always a tap away." },
  { icon: Zap,       title: "XP & Ranks",            desc: "Earn XP every lesson. Level up from Novice to Economist and show off your knowledge." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up for free",      desc: "Create your account in seconds with Google. No credit card required." },
  { step: "02", title: "Pick a lesson",          desc: "Start with Supply & Demand — free for everyone. Work through bite-sized lessons at your own pace." },
  { step: "03", title: "Earn XP & climb ranks",  desc: "Answer quizzes, build streaks, complete quests and watch your rank rise on the leaderboard." },
];

const FAQS = [
  { q: "Is Econ-Go really free?",             a: "Yes — completely free. All 7 units, every lesson, the glossary, leaderboard, quests — everything. No credit card required, ever." },
  { q: "Do I need any economics background?", a: "None at all. Lessons start from the absolute basics and build up gradually, so anyone can follow along." },
  { q: "How long does each lesson take?",      a: "Most lessons take 3–5 minutes. They're designed to fit into your day — a commute, a break, or before bed." },
  { q: "What's included?",                    a: "All 7 units (16+ lessons), the full economics glossary, Good Reads curated book library, global leaderboard, quests, and avatar customization." },
  { q: "How does the leaderboard work?",      a: "Your rank is based on total XP. Complete lessons, maintain streaks, and claim quests to climb the global leaderboard." },
  { q: "Can I install it on my phone?",       a: "Yes! Tap the Install App button on this page. On iPhone use Safari's Share menu and select Add to Home Screen. It works offline too." },
];

// ── Milestone helpers ────────────────────────────────────────────────────────
const MILESTONES = [
  { count: 1,   reward: "2× XP Week" },
  { count: 25,  reward: "2× XP Week" },
  { count: 100, reward: "2× XP Week" },
  { count: 400, reward: "2× XP Week" },
];

function getMilestonePercent(count) {
  const pts = [1, 25, 100, 400];
  if (count >= 400) return 100;
  for (let i = 0; i < pts.length - 1; i++) {
    if (count <= pts[i + 1]) {
      const segBase = (i / 3) * 100;
      const segFrac = (count - pts[i]) / (pts[i + 1] - pts[i]);
      return segBase + segFrac * (100 / 3);
    }
  }
  return 0;
}

function MilestoneBar({ installCount }) {
  const fillPct = getMilestonePercent(installCount);
  const next = MILESTONES.find(m => installCount < m.count);

  return (
    <motion.div
      className="w-full max-w-sm mx-auto mt-10 px-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          🏆 Install Milestones
        </p>
        <p className="text-[11px] font-bold text-muted-foreground">
          {installCount} {installCount === 1 ? "install" : "installs"}
        </p>
      </div>

      {/* Track */}
      <div className="relative h-3 bg-muted rounded-full">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        />
        {/* Milestone dots */}
        {MILESTONES.map((m, i) => {
          const pos = (i / 3) * 100;
          const reached = installCount >= m.count;
          return (
            <motion.div
              key={m.count}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 300 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${
                reached
                  ? "bg-violet-500 border-violet-300 shadow-violet-400/50"
                  : "bg-background border-border"
              }`}>
                {reached && <span className="text-white text-[8px] font-black">✓</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2.5">
        {MILESTONES.map((m, i) => {
          const reached = installCount >= m.count;
          return (
            <div key={m.count} className={`flex flex-col items-center gap-0.5 ${i === 0 ? "items-start" : i === 3 ? "items-end" : "items-center"}`}>
              <span className={`text-[11px] font-black ${reached ? "text-violet-600" : "text-muted-foreground/50"}`}>
                {m.count}
              </span>
              <span className={`text-[9px] font-bold leading-tight text-center ${reached ? "text-violet-500" : "text-muted-foreground/40"}`}>
                {m.reward}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status line */}
      <motion.p
        className="text-center text-[11px] text-muted-foreground mt-2 font-semibold"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {next
          ? `${next.count - installCount} more install${next.count - installCount === 1 ? "" : "s"} to unlock ${next.reward} for everyone 🎁`
          : "All milestones reached — 2× XP is active! 🎉"}
      </motion.p>
    </motion.div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────
function Navbar({ onInstall, iosInstall }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/logo.png" alt="Econ-Go" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <Link to="/privacy" className="hidden sm:block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hidden sm:block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          {onInstall && (
            <motion.button
              onClick={onInstall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-1.5 relative overflow-hidden bg-gradient-to-b from-violet-500 to-purple-700 text-white text-xs font-black px-3 py-2 rounded-xl shadow-[0_3px_0_rgb(88,28,135)] active:shadow-none active:translate-y-0.5 transition-all"
            >
              <motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="text-sm leading-none">📲</motion.span>
              Install App
            </motion.button>
          )}
          <button
            onClick={handleGoogleSignIn}
            className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}

const FLOATING_LEFT = [
  { emoji: "🔥", label: "7-day streak",      sub: "Keep it going!",    delay: 0,    y: "top-28"  },
  { emoji: "📈", label: "Supply & Demand",   sub: "+15 XP earned",     delay: 0.6,  y: "top-52"  },
  { emoji: "💡", label: "Sunk Cost Fallacy", sub: "New concept!",      delay: 1.1,  y: "top-80"  },
  { emoji: "📖", label: "Word of the Day",   sub: "Opportunity Cost",  delay: 1.6,  y: "top-[27rem]" },
];
const FLOATING_RIGHT = [
  { emoji: "🏆", label: "Rank: Analyst",    sub: "Top 12% globally",  delay: 0.3,  y: "top-32"  },
  { emoji: "💰", label: "+10 Capital",       sub: "Lesson complete!",  delay: 0.9,  y: "top-56"  },
  { emoji: "⭐", label: "Quest Complete!",   sub: "Scholar badge",     delay: 1.4,  y: "top-[22rem]" },
  { emoji: "🎯", label: "Daily Quest",       sub: "3 / 5 done",       delay: 1.8,  y: "top-[31rem]" },
];

function FloatingCard({ emoji, label, sub, delay, side }) {
  return (
    <motion.div
      className={`hidden lg:flex items-center gap-2.5 bg-card border border-border rounded-2xl px-3 py-2.5 shadow-lg pointer-events-none select-none w-44 ${side === "right" ? "flex-row-reverse text-right" : ""}`}
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
      transition={{
        opacity: { delay, duration: 0.5 },
        x: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, repeat: Infinity, duration: 2.8 + delay * 0.3, ease: "easeInOut" },
      }}
    >
      <span className="text-xl shrink-0">{emoji}</span>
      <div>
        <p className="text-xs font-bold text-foreground leading-none">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

// ── Term Matching Quiz ───────────────────────────────────────────────────────
const MATCH_PAIRS = [
  { id: 1, term: "Supply",           def: "Amount sellers offer at a given price"       },
  { id: 2, term: "Demand",           def: "Buyers' desire for a good at various prices" },
  { id: 3, term: "Inflation",        def: "A general rise in price levels over time"    },
  { id: 4, term: "Opportunity Cost", def: "Value of the next-best alternative foregone" },
  { id: 5, term: "Scarcity",         def: "Limited resources relative to unlimited wants" },
  { id: 6, term: "GDP",              def: "Total value of goods produced in a country"  },
];

function TermMatch() {
  const [selected, setSelected] = useState(null);   // term id currently chosen
  const [matched, setMatched] = useState([]);        // correctly matched ids
  const [wrong, setWrong] = useState(null);          // def id that flashed red
  const [complete, setComplete] = useState(false);
  const [shuffled] = useState(() => [...MATCH_PAIRS].sort(() => Math.random() - 0.5));

  const handleTerm = (id) => {
    if (matched.includes(id)) return;
    setSelected(id === selected ? null : id);
  };

  const handleDef = (id) => {
    if (matched.includes(id)) return;
    if (selected === null) return;
    if (selected === id) {
      const next = [...matched, id];
      setMatched(next);
      setSelected(null);
      if (next.length === MATCH_PAIRS.length) setTimeout(() => setComplete(true), 400);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const reset = () => { setSelected(null); setMatched([]); setWrong(null); setComplete(false); };

  return (
    <section className="px-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            🎮 Try it yourself
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground mb-2">
            Match the terms
          </h2>
          <p className="text-muted-foreground text-sm">Tap a term, then tap its definition.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div
              key="complete"
              className="text-center py-12 px-6 bg-card border border-border rounded-3xl shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.7 }}
              >🎉</motion.div>
              <h3 className="text-2xl font-heading font-black text-foreground mb-2">Perfect match!</h3>
              <p className="text-muted-foreground text-sm mb-6">You got all {MATCH_PAIRS.length} right. There are 16+ full lessons waiting for you.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25"
                >
                  <GoogleIcon />
                  Start Learning Free
                </button>
                <button
                  onClick={reset}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-3 px-4"
                >
                  Play again ↺
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="quiz" className="grid grid-cols-2 gap-3">
              {/* Terms column */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 px-1">Terms</p>
                {MATCH_PAIRS.map((p) => {
                  const isMatched = matched.includes(p.id);
                  const isSelected = selected === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      onClick={() => handleTerm(p.id)}
                      disabled={isMatched}
                      whileTap={!isMatched ? { scale: 0.95 } : {}}
                      className={`text-left px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-150 ${
                        isMatched
                          ? "border-primary/30 bg-primary/10 text-primary opacity-60 cursor-default"
                          : isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
                          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      {isMatched && <span className="mr-1.5">✓</span>}
                      {p.term}
                    </motion.button>
                  );
                })}
              </div>

              {/* Definitions column */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 px-1">Definitions</p>
                {shuffled.map((p) => {
                  const isMatched = matched.includes(p.id);
                  const isWrong = wrong === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      onClick={() => handleDef(p.id)}
                      disabled={isMatched}
                      whileTap={!isMatched ? { scale: 0.95 } : {}}
                      animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
                      transition={isWrong ? { duration: 0.3 } : {}}
                      className={`text-left px-3 py-3 rounded-xl border-2 text-xs font-medium transition-all duration-150 ${
                        isMatched
                          ? "border-primary/30 bg-primary/10 text-primary opacity-60 cursor-default"
                          : isWrong
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : selected !== null
                          ? "border-border bg-card text-foreground hover:border-accent hover:bg-accent/10 cursor-pointer"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {isMatched && <span className="mr-1">✓ </span>}
                      {p.def}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {!complete && (
          <div className="flex justify-center gap-2 mt-6">
            {MATCH_PAIRS.map((p) => (
              <motion.div
                key={p.id}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${matched.includes(p.id) ? "bg-primary" : "bg-muted"}`}
                animate={matched.includes(p.id) ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Hero({ onInstall, showIosHint, onShowIos, installCount }) {
  return (
    <section className="pt-28 pb-16 px-4 text-center relative">
      {/* Floating icons — desktop only */}
      <div className="absolute left-4 xl:left-12 top-0 bottom-0 pointer-events-none">
        {FLOATING_LEFT.map((f) => (
          <div key={f.label} className={`absolute ${f.y}`}>
            <FloatingCard {...f} side="left" />
          </div>
        ))}
      </div>
      <div className="absolute right-4 xl:right-12 top-0 bottom-0 pointer-events-none">
        {FLOATING_RIGHT.map((f) => (
          <div key={f.label} className={`absolute ${f.y}`}>
            <FloatingCard {...f} side="right" />
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Star className="w-3 h-3 fill-primary" /> Free — no credit card needed
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-foreground leading-tight mb-5">
            Learn Economics<br />
            <span className="text-primary">the fun way</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Bite-sized lessons, daily streaks, and a leaderboard — everything you need to actually understand how the economy works. No textbook required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap"
        >
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2.5 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-2xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 text-base"
          >
            <GoogleIcon />
            Start Learning Free
            <ChevronRight className="w-4 h-4" />
          </button>
          {(onInstall || (showIosHint && !onInstall)) && (
            <div className="flex flex-col items-center gap-2">
              {/* Gamified install button */}
              <motion.button
                onClick={onInstall || onShowIos}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96, y: 2 }}
                className="relative flex items-center gap-2.5 bg-gradient-to-b from-violet-500 to-purple-700 text-white font-black px-6 py-3.5 rounded-2xl text-base overflow-hidden shadow-[0_6px_0_rgb(88,28,135)] active:shadow-[0_2px_0_rgb(88,28,135)] active:translate-y-1 transition-[transform,box-shadow] duration-100"
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 1.5, ease: "easeInOut" }}
                />
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="text-xl leading-none"
                >📲</motion.span>
                <span>{onInstall ? "Install Free App" : "Add to Home Screen"}</span>
                <motion.span
                  className="absolute -top-2 -right-1 bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                >NEW</motion.span>
              </motion.button>
              <span className="text-[10px] text-muted-foreground font-semibold">📶 Works offline · No account needed</span>
            </div>
          )}
        </motion.div>

        <motion.p
          className="text-xs text-muted-foreground mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Free forever · Works offline · No card required
        </motion.p>

        {/* Floating stats */}
        <motion.div
          className="flex justify-center gap-6 mt-12 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[["7", "Units"], ["16+", "Lessons"], ["Free", "To Start"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-heading font-black text-primary">{val}</p>
              <p className="text-xs text-muted-foreground font-semibold">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Milestone bar — only after first install */}
        {installCount >= 1 && <MilestoneBar installCount={installCount} />}
      </div>
    </section>
  );
}

function AppPreview() {
  return (
    <section className="px-4 pb-16">
      <div className="max-w-sm mx-auto">
        <motion.div
          className="bg-card border border-border rounded-3xl p-4 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Mock top bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center">
              <img src="/logo.png" alt="Econ-Go" className="h-7 w-auto" />
            </div>
            <div className="flex gap-1.5">
              <div className="bg-muted rounded-full px-2.5 py-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold">7</span>
              </div>
              <div className="bg-muted rounded-full px-2.5 py-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold">80</span>
              </div>
            </div>
          </div>

          {/* Mock lesson nodes */}
          <div className="space-y-2 px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Supply &amp; Demand</p>
            {[
              { label: "What is Supply?",    status: "done",   xp: 10 },
              { label: "What is Demand?",    status: "done",   xp: 10 },
              { label: "Equilibrium Price",  status: "active", xp: 15 },
              { label: "Elasticity",         status: "locked", xp: 15 },
            ].map(({ label, status, xp }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  status === "done"   ? "bg-primary/10 border border-primary/20" :
                  status === "active" ? "bg-card border-2 border-primary shadow-md" :
                                        "bg-muted/50 opacity-50"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  status === "done"   ? "bg-primary text-primary-foreground" :
                  status === "active" ? "bg-primary text-primary-foreground" :
                                        "bg-muted text-muted-foreground"
                }`}>
                  {status === "done" ? "✓" : status === "active" ? "▶" : "🔒"}
                </div>
                <span className="flex-1 text-sm font-semibold">{label}</span>
                <span className="text-[10px] font-bold text-primary">+{xp} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-foreground mb-3">Everything you need to learn economics</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Built for people who want to actually understand economics — not just memorize it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="bg-card border border-border rounded-2xl p-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Curriculum() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-foreground mb-3">What you'll learn</h2>
          <p className="text-muted-foreground">7 units covering the full spectrum of economics — from first principles to behavioral theory.</p>
        </div>
        <div className="space-y-3">
          {UNITS.map(({ icon: Icon, name, desc, lessons }, i) => (
            <motion.div
              key={name}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm text-foreground mb-1">{name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-muted-foreground">{lessons} lessons</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-foreground mb-3">Get started in minutes</h2>
          <p className="text-muted-foreground">No setup, no textbook, no experience needed.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-heading font-black text-lg mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div
          className="bg-primary text-primary-foreground rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-black uppercase tracking-widest text-primary-foreground/70 mb-3">Pricing</p>
          <p className="text-6xl font-heading font-black mb-2">$0</p>
          <p className="text-primary-foreground/80 text-sm mb-6">Free. Forever. No catch.</p>
          <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
            {[
              "All 7 units & 16+ lessons",
              "Daily quests & streak tracking",
              "XP, ranks & leaderboard",
              "Full economics glossary",
              "Good Reads book library",
              "Avatar customization",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-primary-foreground/90">
                <CheckCircle className="w-4 h-4 text-primary-foreground shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-primary font-black py-3 rounded-2xl text-sm hover:bg-white/90 transition-colors"
          >
            Start Learning — It's Free
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-foreground mb-3">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={q}
              className="bg-card border border-border rounded-2xl p-5"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <h3 className="font-heading font-bold text-sm text-foreground mb-2">{q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <motion.div
        className="max-w-xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-5xl mb-5">🐻</div>
        <h2 className="text-3xl font-heading font-black text-foreground mb-3">
          The bear is ready when you are.
        </h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Join thousands of learners building an economics habit — one lesson at a time. Completely free, no experience needed.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-2.5 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-2xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 text-base mx-auto"
        >
          <GoogleIcon />
          Start Learning — It's Free
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-muted-foreground mt-4">Free forever · No credit card · Works offline</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="Econ-Go" className="h-6 w-auto" />
        </div>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Econ-Go. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installCount, setInstallCount] = useState(0);

  useEffect(() => {
    // Fetch download count
    fetch("/api/installs").then(r => r.json()).then(d => setInstallCount(d.count || 0)).catch(() => {});

    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS detection — show "Add to Home Screen" hint when not already installed
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isIos && !isStandalone) setShowIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const trackInstall = async (platform) => {
    try {
      const r = await fetch("/api/installs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const d = await r.json();
      setInstallCount(d.count || 0);
    } catch {}
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      trackInstall("android");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onInstall={installPrompt ? handleInstall : null} iosInstall={showIosHint} />
      <Hero
        onInstall={installPrompt ? handleInstall : null}
        showIosHint={showIosHint}
        onShowIos={() => { setShowIosModal(true); trackInstall("ios"); }}
        installCount={installCount}
      />
      <TermMatch />
      <AppPreview />
      <Features />
      <Curriculum />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />

      {/* iOS "Add to Home Screen" instructions modal */}
      <AnimatePresence>
        {showIosModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIosModal(false)}
          >
            <motion.div
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm mb-4"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-black text-lg text-foreground mb-1">Install Econ-Go</h3>
                <p className="text-xs text-muted-foreground">Add the app to your home screen for the best experience</p>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { step: "1", text: "Tap the Share button at the bottom", icon: <Share className="w-4 h-4 text-primary" /> },
                  { step: "2", text: 'Scroll down and tap "Add to Home Screen"', icon: <Smartphone className="w-4 h-4 text-primary" /> },
                  { step: "3", text: 'Tap "Add" — done! Open it like any app', icon: <CheckCircle className="w-4 h-4 text-primary" /> },
                ].map(({ step, text, icon }) => (
                  <div key={step} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0">
                      {step}
                    </div>
                    <p className="text-sm text-foreground flex-1">{text}</p>
                    {icon}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-2xl hover:bg-primary/90 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
