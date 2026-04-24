import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, BookMarked, Library, ShoppingBag,
  ChevronRight, ChevronLeft, X, Pencil,
} from "lucide-react";
import { updateCurrentUser } from "@/lib/appData";

const TOTAL_STEPS = 9;

/* ─────────────────────────────────────────────────────────
   BEAR MASCOT with animated arms
   Arms rotate from their shoulder attachment point.
   pose prop drives the animation.
───────────────────────────────────────────────────────── */
const ARM_POSES = {
  wave: {
    body: {
      animate: { y: [0, -8, 0] },
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: [-25, -75, -25] },
      transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
    },
    right: {
      animate: { rotate: [25, 80, 25] },
      transition: { duration: 0.65, repeat: Infinity, ease: "easeInOut", delay: 0.08 },
    },
  },
  "point-down": {
    body: {
      animate: { y: [0, -5, 0] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: -15 },
      transition: { duration: 0.6, type: "spring" },
    },
    right: {
      animate: { rotate: [52, 65, 52] },
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
  },
  cheer: {
    body: {
      animate: { y: [0, -10, 0], scale: [1, 1.04, 1] },
      transition: { duration: 0.75, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: [-85, -105, -85] },
      transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
    },
    right: {
      animate: { rotate: [85, 105, 85] },
      transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.05 },
    },
  },
  "point-both-down": {
    body: {
      animate: { y: [0, -4, 0] },
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: [42, 52, 42] },
      transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
    },
    right: {
      animate: { rotate: [-42, -52, -42] },
      transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.12 },
    },
  },
  "point-grid": {
    body: {
      animate: { y: [0, -5, 0] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: 20 },
      transition: { duration: 0.5, type: "spring" },
    },
    right: {
      animate: { rotate: [55, 68, 55] },
      transition: { duration: 1.3, repeat: Infinity, ease: "easeInOut" },
    },
  },
  victory: {
    body: {
      animate: { y: [0, -14, 0], rotate: [-3, 3, 0] },
      transition: { duration: 0.6, repeat: Infinity },
    },
    left: {
      animate: { rotate: [-115, -130, -115] },
      transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut" },
    },
    right: {
      animate: { rotate: [115, 130, 115] },
      transition: { duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: 0.04 },
    },
  },
  // Open arms — inviting the user to type their name
  open: {
    body: {
      animate: { y: [0, -6, 0] },
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
    left: {
      animate: { rotate: [-50, -62, -50] },
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
    right: {
      animate: { rotate: [50, 62, 50] },
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.18 },
    },
  },
};

function Arm({ side, animate, transition }) {
  const isLeft = side === "left";
  return (
    <motion.div
      style={{
        transformOrigin: "top center",
        position: "absolute",
        top: 54,
        ...(isLeft ? { left: 12 } : { right: 12 }),
        width: 18,
        zIndex: 0,
      }}
      animate={animate}
      transition={transition}
    >
      {/* Upper arm */}
      <div
        className="rounded-full mx-auto"
        style={{ width: 14, height: 38, background: "#7C4A2A", borderRadius: 99 }}
      />
      {/* Paw */}
      <div
        style={{
          width: 20,
          height: 20,
          background: "#7C4A2A",
          borderRadius: "50%",
          marginTop: -4,
          marginLeft: isLeft ? -3 : -3,
        }}
      />
      {/* Paw pads */}
      <div
        style={{
          position: "absolute",
          bottom: 2,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 2,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ width: 4, height: 4, borderRadius: "50%", background: "#5C3318" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function BearMascot({ pose = "wave", size = 128 }) {
  const config = ARM_POSES[pose] || ARM_POSES.wave;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size + 72, height: size + 20 }}
    >
      <Arm side="left" animate={config.left.animate} transition={config.left.transition} />

      <motion.div
        className="rounded-full bg-white shadow-2xl flex items-center justify-center"
        style={{ width: size, height: size, zIndex: 10, position: "relative" }}
        animate={config.body.animate}
        transition={config.body.transition}
      >
        <span style={{ fontSize: size * 0.5 }} className="select-none">
          🐻
        </span>
      </motion.div>

      <Arm side="right" animate={config.right.animate} transition={config.right.transition} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CONFETTI (final step)
───────────────────────────────────────────────────────── */
function useConfetti(count = 26) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: ["🎉", "⭐", "✨", "💛", "🟠", "🔥", "🌟"][i % 7],
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.0 + Math.random() * 1.2,
        size: 14 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 55,
      })),
    [count]
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 0 — WELCOME
───────────────────────────────────────────────────────── */
function StepWelcome({ firstName }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 px-6">
      <motion.div
        initial={{ scale: 0, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.1 }}
      >
        <BearMascot pose="wave" size={120} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h1 className="text-4xl font-heading font-black text-white leading-tight">
          Hey {firstName}! 👋
        </h1>
        <p className="text-white font-bold text-lg">Welcome to Econ-Go</p>
        <p className="text-white/65 text-sm max-w-[260px] mx-auto leading-relaxed">
          The fun way to learn economics — bite-sized lessons, daily streaks, and a bear
          who's just as invested as you are.
        </p>
      </motion.div>

      <motion.div
        className="flex gap-3 mt-1"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.75, type: "spring" }}
      >
        {["📚 Lessons", "🔥 Streaks", "💰 Capital"].map((tag, i) => (
          <motion.span
            key={tag}
            className="bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 1 — LEARNING PATH
───────────────────────────────────────────────────────── */
const MOCK_LESSONS = [
  { label: "What is Supply?", xp: 10, cap: 5, status: "completed" },
  { label: "What is Demand?", xp: 10, cap: 5, status: "active" },
  { label: "Equilibrium", xp: 15, cap: 8, status: "locked" },
];

function StepLearn() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-center"
      >
        <h2 className="text-2xl font-heading font-black text-white">Your Learning Path</h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Work through lessons in order. Complete one to unlock the next.
        </p>
      </motion.div>

      {/* Bear pointing down at the list */}
      <motion.div
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
        className="relative"
      >
        <BearMascot pose="point-down" size={96} />
        {/* Pointing arrow */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-lg"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          ↓
        </motion.div>
      </motion.div>

      {/* Lesson nodes mockup */}
      <motion.div className="w-full max-w-[260px] flex flex-col gap-2">
        {MOCK_LESSONS.map((lesson, i) => (
          <motion.div
            key={i}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              lesson.status === "completed"
                ? "bg-white/22"
                : lesson.status === "active"
                ? "bg-white/35 border-2 border-white/80 shadow-lg"
                : "bg-white/10 opacity-50"
            }`}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: lesson.status === "locked" ? 0.5 : 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.12, type: "spring", stiffness: 200 }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                lesson.status === "completed"
                  ? "bg-green-400 text-white"
                  : lesson.status === "active"
                  ? "bg-white text-orange-500"
                  : "bg-white/20 text-white/40"
              }`}
            >
              {lesson.status === "completed" ? "✓" : lesson.status === "active" ? "▶" : "🔒"}
            </div>
            <span className="text-white text-sm font-bold flex-1 text-left">{lesson.label}</span>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="text-yellow-200 text-[10px] font-bold">+{lesson.xp} XP</span>
              <span className="text-white/55 text-[9px] font-bold">+{lesson.cap} 💰</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="text-white/50 text-[11px] font-semibold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Everything is <span className="text-white font-bold">100% free</span> — all 7 units included
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 2 — STREAK
───────────────────────────────────────────────────────── */
function StepStreak() {
  return (
    <div className="flex flex-col items-center text-center gap-4 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-2xl font-heading font-black text-white">Build Your Streak</h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Come back every day. Your streak grows — miss one day and it resets to zero.
        </p>
      </motion.div>

      {/* Bear cheering with fire */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 14, delay: 0.15 }}
        >
          <BearMascot pose="cheer" size={96} />
        </motion.div>
        {/* Floating fire */}
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl"
          animate={{ y: [-4, -12, -4], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
        >
          🔥
        </motion.div>
      </div>

      {/* Day tracker */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.45 + i * 0.06, type: "spring", stiffness: 250 }}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                i < 5 ? "bg-orange-400 shadow-md shadow-orange-600/40" : "bg-white/18 text-white/35"
              }`}
            >
              {i < 5 ? "🔥" : "·"}
            </div>
            <span className="text-[9px] text-white/50 font-bold">{day}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white/15 border border-white/25 rounded-2xl p-4 max-w-xs w-full text-left"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, type: "spring" }}
      >
        <p className="text-white text-xs font-black mb-1">⚠️ Watch out!</p>
        <p className="text-white/68 text-xs leading-relaxed">
          Miss a single day and your streak resets to zero. Set a daily reminder so you never break the chain.
        </p>
      </motion.div>

      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        {[["🏅", "7-day badge"], ["📈", "Rank climb"], ["⚡", "XP bonuses"]].map(([icon, label]) => (
          <div key={label} className="bg-white/18 rounded-xl px-3 py-2 text-center">
            <p className="text-lg">{icon}</p>
            <p className="text-white/65 text-[9px] font-bold mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 3 — CAPITAL & XP
───────────────────────────────────────────────────────── */
const RANKS = [
  { rank: "Novice", xp: "0", emoji: "🐣" },
  { rank: "Beginner", xp: "50", emoji: "🐦" },
  { rank: "Student", xp: "200", emoji: "📖" },
  { rank: "Analyst", xp: "500", emoji: "📊" },
  { rank: "Economist", xp: "1000", emoji: "🎓" },
];

function StepCapital() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-center"
      >
        <h2 className="text-2xl font-heading font-black text-white">XP &amp; Capital</h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Every lesson rewards you with both. XP unlocks ranks — Capital buys cosmetics.
        </p>
      </motion.div>

      {/* Bear pointing at content */}
      <motion.div
        className="relative"
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
      >
        <BearMascot pose="point-both-down" size={88} />
        {/* XP and coin floating */}
        <motion.span
          className="absolute -left-2 top-2 text-xl"
          animate={{ y: [0, -6, 0], rotate: [-5, 5, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
        >
          ⚡
        </motion.span>
        <motion.span
          className="absolute -right-2 top-2 text-xl"
          animate={{ y: [0, -7, 0], rotate: [5, -5, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          💰
        </motion.span>
      </motion.div>

      {/* XP rank ladder */}
      <motion.div
        className="w-full max-w-xs"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-white/55 text-[9px] font-black uppercase tracking-widest mb-2 text-center">
          XP Rank Ladder
        </p>
        <div className="flex justify-between gap-1">
          {RANKS.map(({ rank, xp, emoji }, i) => (
            <motion.div
              key={rank}
              className="flex-1 bg-white/15 rounded-xl p-2 flex flex-col items-center gap-0.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, type: "spring", stiffness: 220 }}
            >
              <span className="text-base">{emoji}</span>
              <span className="text-white text-[8px] font-black leading-tight text-center">{rank}</span>
              <span className="text-white/45 text-[7px]">{xp} XP</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-white/15 border border-white/22 rounded-2xl p-3.5 max-w-xs w-full text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, type: "spring" }}
      >
        <p className="text-white text-xs font-black mb-1">🛍️ What can Capital buy?</p>
        <p className="text-white/65 text-xs leading-relaxed">
          Head to the <strong className="text-white">Shop</strong> and spend Capital on custom avatars,
          cosmetic upgrades, and exclusive items — all earned by actually learning.
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 4 — EXPLORE THE APP
───────────────────────────────────────────────────────── */
const APP_FEATURES = [
  { icon: Trophy,      label: "Leaderboard", color: "text-yellow-300", bg: "bg-yellow-400/20", desc: "Compete with learners globally — see how you rank." },
  { icon: BookMarked,  label: "Glossary",    color: "text-blue-300",   bg: "bg-blue-400/20",   desc: "Every economics term, defined clearly." },
  { icon: Library,     label: "Good Reads",  color: "text-green-300",  bg: "bg-green-400/20",  desc: "Curated books and articles by top economists." },
  { icon: ShoppingBag, label: "Shop",        color: "text-pink-300",   bg: "bg-pink-400/20",   desc: "Spend Capital on avatars & cosmetic upgrades." },
];

function StepPro() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-center"
      >
        <span className="inline-block bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          All Free
        </span>
        <h2 className="text-2xl font-heading font-black text-white">Explore the app</h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Beyond lessons, there's a whole app to discover — <strong className="text-white">all 100% free</strong>:
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
      >
        <BearMascot pose="point-grid" size={80} />
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-2 gap-2 w-full max-w-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {APP_FEATURES.map(({ icon: Icon, label, color, bg, desc }, i) => (
          <motion.div
            key={label}
            className={`${bg} border border-white/18 rounded-2xl p-3 text-left flex flex-col gap-1.5`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.08, type: "spring", stiffness: 220 }}
          >
            <div className="flex items-center gap-1.5">
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
              <span className="text-white text-xs font-black">{label}</span>
            </div>
            <p className="text-white/55 text-[10px] leading-snug">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white/12 border border-white/18 rounded-2xl p-3 w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <p className="text-white text-sm font-black mb-1">🎉 No paywalls, ever</p>
        <p className="text-white/55 text-[10px] leading-snug">
          All 7 units, all lessons, glossary, leaderboard, shop, quests — zero limits. Enjoy!
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 5 — QUESTS
───────────────────────────────────────────────────────── */
const MOCK_DAILY = [
  { icon: "📅", label: "Show Up",   xp: 5,  done: true  },
  { icon: "📚", label: "Scholar",   xp: 15, done: false },
  { icon: "🔥", label: "On Fire",   xp: 5,  done: false },
];
const MOCK_SPECIAL = [
  { icon: "🌱", label: "First Step",    xp: 10,  progress: 1, max: 1,  done: true  },
  { icon: "📖", label: "Bookworm",      xp: 75,  progress: 0, max: 1,  done: false },
  { icon: "🎩", label: "Hat Collector", xp: 30,  progress: 0, max: 1,  done: false },
];

function StepQuests() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-center"
      >
        <h2 className="text-2xl font-heading font-black text-white">Quests &amp; Rewards</h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Complete daily tasks and hit special milestones to earn bonus XP.
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
      >
        <BearMascot pose="cheer" size={72} />
      </motion.div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {/* Daily column */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/45 mb-1.5 text-center">Daily</p>
          <div className="flex flex-col gap-1.5">
            {MOCK_DAILY.map(({ icon, label, xp, done }, i) => (
              <motion.div
                key={label}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${done ? "bg-green-400/25 border border-green-300/30" : "bg-white/12 border border-white/15"}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 220 }}
              >
                <span className="text-base leading-none">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[10px] font-black leading-tight truncate">{label}</p>
                  <p className="text-white/45 text-[9px] font-bold">+{xp} XP</p>
                </div>
                {done && <span className="text-green-300 text-xs font-black">✓</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Special column */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/45 mb-1.5 text-center">Special</p>
          <div className="flex flex-col gap-1.5">
            {MOCK_SPECIAL.map(({ icon, label, xp, progress, max, done }, i) => (
              <motion.div
                key={label}
                className={`flex flex-col gap-1 rounded-xl px-2.5 py-2 ${done ? "bg-green-400/25 border border-green-300/30" : "bg-white/12 border border-white/15"}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 220 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[10px] font-black leading-tight truncate">{label}</p>
                    <p className="text-white/45 text-[9px] font-bold">+{xp} XP</p>
                  </div>
                  {done && <span className="text-green-300 text-xs font-black">✓</span>}
                </div>
                {!done && (
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70 rounded-full" style={{ width: `${(progress / max) * 100}%` }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="bg-white/12 border border-white/18 rounded-2xl p-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <p className="text-white/85 text-[10px] font-black uppercase tracking-widest mb-1.5">How it works</p>
        <div className="flex flex-col gap-1">
          <p className="text-white/62 text-[10px] leading-snug">📅 <strong className="text-white">Daily quests</strong> reset every midnight — log in, complete lessons, check the leaderboard</p>
          <p className="text-white/62 text-[10px] leading-snug">🏆 <strong className="text-white">Special quests</strong> are permanent milestones — unlock authors, build streaks, deck out your wardrobe</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 6 — PICK YOUR NAME
───────────────────────────────────────────────────────── */
function StepName({ value, onChange }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-2xl font-heading font-black text-white">
          What should we call you?
        </h2>
        <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
          Pick a name or nickname — this is how you'll appear on the leaderboard.
        </p>
      </motion.div>

      {/* Bear with open arms */}
      <motion.div
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
      >
        <BearMascot pose="open" size={108} />
      </motion.div>

      {/* Name input */}
      <motion.div
        className="w-full max-w-xs flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, type: "spring", stiffness: 200 }}
      >
        <div className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, 28))}
            placeholder="Your name or nickname…"
            maxLength={28}
            autoFocus
            className="w-full bg-white/25 border-2 border-white/45 focus:border-white/90 rounded-2xl px-4 py-4 text-white placeholder-white/38 font-bold text-lg text-center focus:outline-none transition-all duration-200 tracking-wide"
            style={{ caretColor: "white" }}
          />
          <Pencil className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
        </div>

        <p className="text-white/40 text-[11px] font-semibold">
          {value.length}/28 characters
        </p>
      </motion.div>

      {/* Preview badge */}
      <AnimatePresence>
        {value.trim().length > 0 && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-2xl px-4 py-2.5"
          >
            <span className="text-xl">🐻</span>
            <div className="text-left">
              <p className="text-white font-black text-sm leading-none">{value.trim()}</p>
              <p className="text-white/50 text-[10px] mt-0.5">Novice · 0 XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        className="text-white/38 text-[11px] font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        You can always change this later in your Profile ✏️
      </motion.p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 7 — DIAGNOSTIC (placement quiz)
───────────────────────────────────────────────────────── */
const DIAGNOSTIC_QUESTIONS = [
  {
    unit: "Supply & Demand", emoji: "📈",
    question: "If demand for a product increases while supply stays the same, what happens to the price?",
    options: ["The price falls", "The price rises", "Nothing changes", "Supply automatically increases"],
    correct: 1,
  },
  {
    unit: "Intro to Micro", emoji: "🧠",
    question: "What is 'opportunity cost'?",
    options: ["The cost of raw materials", "A government tax on production", "The value of the best alternative you give up", "The price of borrowing money"],
    correct: 2,
  },
  {
    unit: "Inflation", emoji: "💸",
    question: "What best describes inflation?",
    options: ["A rise in unemployment", "A general increase in the price level over time", "A decrease in government spending", "When the stock market crashes"],
    correct: 1,
  },
  {
    unit: "Game Theory", emoji: "♟️",
    question: "In the Prisoner's Dilemma, both suspects tend to confess rather than cooperate because...",
    options: ["They trust each other completely", "The police force them", "Each acts in self-interest regardless of the other", "Silence is not an option"],
    correct: 2,
  },
  {
    unit: "History of Economics", emoji: "📜",
    question: "Who wrote 'The Wealth of Nations' (1776)?",
    options: ["John Maynard Keynes", "Karl Marx", "Milton Friedman", "Adam Smith"],
    correct: 3,
  },
  {
    unit: "Macro 101", emoji: "🌐",
    question: "What does GDP measure?",
    options: ["A country's total debt", "The value of all goods & services produced in a country", "Average household income", "Government tax revenue"],
    correct: 1,
  },
  {
    unit: "Behavioral Economics", emoji: "🔮",
    question: "What is a 'nudge' in behavioral economics?",
    options: ["A fine for making bad choices", "A mandatory government policy", "A subtle design that steers people toward better decisions", "A type of market tax"],
    correct: 2,
  },
];

function StepDiagnostic({ onComplete }) {
  const [phase, setPhase] = useState("intro"); // "intro" | "quiz" | "results"
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);

  const totalQ = DIAGNOSTIC_QUESTIONS.length;
  const q = DIAGNOSTIC_QUESTIONS[currentQ];

  const getRecommendation = (res) => {
    const firstFail = res.findIndex((r) => !r);
    return firstFail === -1
      ? DIAGNOSTIC_QUESTIONS[totalQ - 1].unit
      : DIAGNOSTIC_QUESTIONS[firstFail].unit;
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelectedIdx(idx);
    setRevealed(true);
    const correct = idx === q.correct;
    const newResults = [...results, correct];
    setResults(newResults);

    setTimeout(() => {
      if (currentQ < totalQ - 1) {
        setCurrentQ((c) => c + 1);
        setSelectedIdx(null);
        setRevealed(false);
      } else {
        const rec = getRecommendation(newResults);
        try {
          localStorage.setItem("econogo_placement", JSON.stringify({
            unit: rec,
            score: newResults.filter(Boolean).length,
            total: totalQ,
            firstVisit: true,
            date: new Date().toISOString(),
          }));
        } catch {}
        setPhase("results");
      }
    }, 1300);
  };

  /* ── Intro ── */
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-4 px-5 w-full text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-2xl font-heading font-black text-white">Placement Quiz</h2>
          <p className="text-white/60 text-xs mt-1 max-w-[260px] mx-auto">
            7 quick questions — one per unit. We'll find the best place for you to start.
          </p>
        </motion.div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14, delay: 0.15 }}>
          <BearMascot pose="point-both-down" size={80} />
        </motion.div>
        <div className="flex flex-col gap-1.5 w-full max-w-xs">
          {DIAGNOSTIC_QUESTIONS.map(({ unit, emoji }, i) => (
            <motion.div
              key={unit}
              className="flex items-center gap-2 bg-white/12 rounded-xl px-3 py-2"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-white text-xs font-semibold">{unit}</span>
            </motion.div>
          ))}
        </div>
        <motion.button
          onClick={() => setPhase("quiz")}
          className="bg-white text-orange-500 font-black px-8 py-3 rounded-2xl text-sm hover:bg-white/92 active:scale-95 transition-all shadow-lg mt-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          whileTap={{ scale: 0.97 }}
        >
          Start Quiz →
        </motion.button>
      </div>
    );
  }

  /* ── Quiz ── */
  if (phase === "quiz") {
    return (
      <div className="flex flex-col items-center gap-4 px-5 w-full">
        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-[9px] font-bold text-white/50 mb-1.5">
            <span>{q.unit}</span>
            <span>{currentQ + 1} / {totalQ}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${(currentQ / totalQ) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            className="w-full max-w-sm"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
          >
            <div className="text-center mb-3">
              <span className="text-4xl">{q.emoji}</span>
              <p className="text-white font-black text-sm mt-2 leading-snug">{q.question}</p>
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((option, idx) => {
                let cls = "bg-white/15 border-white/20 text-white hover:bg-white/25";
                if (revealed) {
                  if (idx === q.correct) cls = "bg-green-400/35 border-green-300/60 text-white";
                  else if (idx === selectedIdx) cls = "bg-red-400/30 border-red-300/50 text-white/70";
                  else cls = "bg-white/8 border-white/10 text-white/35";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={revealed}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${cls}`}
                  >
                    <span className="font-black mr-2 opacity-60">{["A","B","C","D"][idx]}.</span>
                    {option}
                    {revealed && idx === q.correct && <span className="ml-1.5 text-green-300">✓</span>}
                    {revealed && idx === selectedIdx && idx !== q.correct && <span className="ml-1.5 text-red-300">✗</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  /* ── Results ── */
  const recommendation = getRecommendation(results);
  const correctCount = results.filter(Boolean).length;
  const allCorrect = correctCount === totalQ;

  return (
    <div className="flex flex-col items-center gap-3 px-5 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-2xl font-heading font-black text-white">
          {allCorrect ? "You're an expert! 🎓" : correctCount >= 5 ? "Strong knowledge! 📊" : correctCount >= 3 ? "Good foundation! 🌱" : "Let's start fresh! 👋"}
        </h2>
        <p className="text-white/55 text-xs mt-1">{correctCount}/{totalQ} correct</p>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 14, delay: 0.1 }}>
        <BearMascot pose={allCorrect ? "victory" : correctCount >= 4 ? "cheer" : "wave"} size={72} />
      </motion.div>

      {/* Per-unit results */}
      <div className="w-full max-w-sm flex flex-col gap-1.5">
        {DIAGNOSTIC_QUESTIONS.map(({ unit, emoji }, i) => (
          <motion.div
            key={unit}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border ${results[i] ? "bg-green-400/18 border-green-300/30" : "bg-red-400/12 border-red-300/20"}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: "spring" }}
          >
            <span className="text-sm">{emoji}</span>
            <span className="flex-1 text-white text-xs font-semibold">{unit}</span>
            <span className={`text-sm font-black ${results[i] ? "text-green-300" : "text-red-300"}`}>
              {results[i] ? "✓" : "✗"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Recommendation box */}
      <motion.div
        className="bg-white/15 border border-white/25 rounded-2xl p-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      >
        <p className="text-white/65 text-[9px] font-black uppercase tracking-widest mb-1">Recommended Starting Point</p>
        <p className="text-white font-black text-sm">📍 {recommendation}</p>
        <p className="text-white/50 text-[10px] mt-0.5 leading-snug">
          {allCorrect
            ? "You aced it — we'll still walk you through everything to reinforce the concepts."
            : "We'll navigate you straight there when you enter the app."}
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-2 w-full max-w-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
      >
        <motion.button
          onClick={() => onComplete(recommendation)}
          className="w-full bg-white text-orange-500 font-black px-6 py-3 rounded-2xl text-sm hover:bg-white/92 active:scale-95 transition-all shadow-lg"
          whileTap={{ scale: 0.97 }}
        >
          📍 Start at {recommendation}
        </motion.button>
        <motion.button
          onClick={() => onComplete(null)}
          className="w-full bg-white/15 border border-white/25 text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-white/25 active:scale-95 transition-all"
          whileTap={{ scale: 0.97 }}
        >
          Start from the beginning
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 8 — READY!
───────────────────────────────────────────────────────── */
function StepReady({ confetti, name }) {
  return (
    <div className="relative flex flex-col items-center text-center gap-5 px-6">
      {/* Confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute pointer-events-none"
          style={{ left: `${c.left}%`, fontSize: c.size, top: -80 }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: ["0vh", "120vh"], opacity: [0, 1, 1, 0], x: [0, c.drift] }}
          transition={{ delay: c.delay, duration: c.duration, ease: "linear", repeat: Infinity }}
        >
          {c.emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.1 }}
      >
        <BearMascot pose="victory" size={120} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-3xl font-heading font-black text-white">
          Let's go, {name}! 🎉
        </h2>
        <p className="text-white/65 text-sm max-w-[260px] mx-auto leading-relaxed">
          Your first lesson is waiting. Start building your streak and see how far you can go.
        </p>
        <motion.p
          className="text-white/45 text-xs font-semibold mt-1"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          The bear is rooting for you. 🐻
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SLIDE VARIANTS
───────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 340 : -340, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -340 : 340, opacity: 0 }),
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const NAME_STEP = 6;

export default function OnboardingTutorial({ userName, onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customName, setCustomName] = useState(userName?.split(" ")[0] || "");
  const confetti = useConfetti(26);

  const firstName = userName?.split(" ")[0] || "there";
  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;

  const saveName = async () => {
    const trimmed = customName.trim();
    if (trimmed.length > 0) {
      await updateCurrentUser({ full_name: trimmed });
    }
  };

  const DIAGNOSTIC_STEP = NAME_STEP + 1; // step 7

  const handleDiagComplete = (recommendation) => {
    // null means user chose "start from beginning" — clear placement
    if (!recommendation) {
      try { localStorage.removeItem("econogo_placement"); } catch {}
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goNext = async () => {
    if (step === NAME_STEP) await saveName();
    if (!isLast) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      await saveName();
      onComplete();
    }
  };

  const goBack = () => {
    if (!isFirst) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };


  const steps = [
    <StepWelcome firstName={firstName} />,
    <StepLearn />,
    <StepStreak />,
    <StepCapital />,
    <StepPro />,
    <StepQuests />,
    <StepName value={customName} onChange={setCustomName} />,
    <StepDiagnostic onComplete={handleDiagComplete} />,
    <StepReady confetti={confetti} name={customName.trim() || firstName} />,
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #f97316 0%, #f59e0b 55%, #eab308 100%)",
        }}
        animate={{
          background: [
            "linear-gradient(160deg, #f97316 0%, #f59e0b 55%, #eab308 100%)",
            "linear-gradient(160deg, #ea580c 0%, #f97316 55%, #f59e0b 100%)",
            "linear-gradient(160deg, #f97316 0%, #f59e0b 55%, #eab308 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Skip */}
      <div className="relative z-10 flex justify-between items-center px-5 pt-5 pb-0">
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
          {step + 1} of {TOTAL_STEPS}
        </div>
        {step !== DIAGNOSTIC_STEP && (
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors text-xs font-bold py-1 px-2 rounded-lg hover:bg-white/10"
          >
            Skip <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden py-2">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="w-full flex flex-col items-center"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-10 flex flex-col items-center gap-3.5">
        {/* Progress dots */}
        <div className="flex gap-2 items-center h-3">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white"
              animate={{
                width: i === step ? 24 : 8,
                height: 8,
                opacity: i === step ? 1 : i < step ? 0.55 : 0.25,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </div>

        {/* Buttons — hidden during diagnostic (it has its own navigation) */}
        {step !== DIAGNOSTIC_STEP && (
          <div className="flex gap-2.5 w-full max-w-sm">
            <AnimatePresence>
              {!isFirst && (
                <motion.button
                  key="back"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  onClick={goBack}
                  className="flex items-center gap-1 px-4 py-3.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-orange-500 font-black rounded-2xl hover:bg-white/92 active:bg-white/80 transition-colors text-sm shadow-lg shadow-orange-900/25"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              {isLast ? "Start Learning 🚀" : step === NAME_STEP ? "Looks good →" : "Next"}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </motion.button>
          </div>
        )}

      </div>
    </motion.div>
  );
}
