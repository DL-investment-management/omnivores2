import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Trophy, BookMarked, Library, ShoppingBag,
  ChevronRight, ChevronLeft, X, Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateCurrentUser } from "@/lib/appData";

const TOTAL_STEPS = 7;

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
        Free users start with <span className="text-white font-bold">Supply &amp; Demand</span>
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
          Unlock the <strong className="text-white">Shop</strong> with Pro and spend Capital on custom avatars,
          cosmetic upgrades, and exclusive items — all earned by actually learning.
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 4 — PRO FEATURES
───────────────────────────────────────────────────────── */
const LOCKED_TABS = [
  { icon: Trophy, label: "Rank", color: "text-yellow-300", bg: "bg-yellow-400/20", desc: "Compete on the global leaderboard in real time." },
  { icon: BookMarked, label: "Glossary", color: "text-blue-300", bg: "bg-blue-400/20", desc: "Full economics dictionary — every term defined." },
  { icon: Library, label: "Good Reads", color: "text-green-300", bg: "bg-green-400/20", desc: "Curated books and author profiles by economists." },
  { icon: ShoppingBag, label: "Shop", color: "text-pink-300", bg: "bg-pink-400/20", desc: "Spend Capital on avatars and exclusive cosmetics." },
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
        <h2 className="text-2xl font-heading font-black text-white">Unlock with Pro</h2>
        <p className="text-white/58 text-xs mt-1 max-w-[260px] mx-auto">
          4 tabs are locked for free users — here's exactly what each one gives you:
        </p>
      </motion.div>

      {/* Bear pointing at the grid */}
      <motion.div
        initial={{ scale: 0, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, delay: 0.15 }}
        className="relative"
      >
        <BearMascot pose="point-grid" size={80} />
        <motion.div
          className="absolute -top-3 -right-1"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Crown className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Locked tab cards */}
      <motion.div
        className="grid grid-cols-2 gap-2 w-full max-w-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {LOCKED_TABS.map(({ icon: Icon, label, color, bg, desc }, i) => (
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

      {/* Also includes */}
      <motion.div
        className="bg-white/12 border border-white/18 rounded-2xl p-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <p className="text-white/85 text-[10px] font-black uppercase tracking-widest mb-1.5">Also included:</p>
        <div className="flex flex-col gap-1">
          <p className="text-white/62 text-[10px] leading-snug">
            🤖 <strong className="text-white">AI-graded questions</strong> — real feedback on typed answers
          </p>
          <p className="text-white/62 text-[10px] leading-snug">
            📚 <strong className="text-white">All 7 units</strong> — 16 full lessons across economics
          </p>
          <p className="text-white/62 text-[10px] leading-snug">
            🎨 <strong className="text-white">Exclusive cosmetics</strong> — stand out on the leaderboard
          </p>
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        className="flex items-stretch gap-2 w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex-1 bg-white/15 rounded-xl p-2.5 text-center">
          <p className="text-white font-black text-xl leading-none">$3.99</p>
          <p className="text-white/50 text-[10px] mt-0.5">per month</p>
        </div>
        <div className="flex items-center text-white/35 text-xs font-bold px-1">or</div>
        <div className="flex-1 bg-yellow-400/22 border border-yellow-300/35 rounded-xl p-2.5 text-center relative overflow-hidden">
          <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-green-400 text-white text-[8px] font-black px-2 py-0.5 rounded-b-full">
            SAVE 58%
          </div>
          <p className="text-white font-black text-xl leading-none mt-2">$19.99</p>
          <p className="text-white/50 text-[10px] mt-0.5">per year</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP 5 — PICK YOUR NAME
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
   STEP 6 — READY!
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
const NAME_STEP = 5;

export default function OnboardingTutorial({ userName, onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customName, setCustomName] = useState(userName?.split(" ")[0] || "");
  const navigate = useNavigate();
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

  const handleUpgrade = () => {
    onComplete();
    navigate("/upgrade");
  };

  const steps = [
    <StepWelcome firstName={firstName} />,
    <StepLearn />,
    <StepStreak />,
    <StepCapital />,
    <StepPro />,
    <StepName value={customName} onChange={setCustomName} />,
    <StepReady confetti={confetti} name={customName.trim() || firstName} />,
  ];

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
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
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors text-xs font-bold py-1 px-2 rounded-lg hover:bg-white/10"
        >
          Skip <X className="w-3.5 h-3.5" />
        </button>
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

        {/* Buttons */}
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

        {/* Pro shortcut on step 4 */}
        <AnimatePresence>
          {step === 4 && (
            <motion.button
              key="pro-cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={handleUpgrade}
              className="text-yellow-200 text-xs font-bold underline underline-offset-2 hover:text-white transition-colors"
            >
              Go Pro now →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
