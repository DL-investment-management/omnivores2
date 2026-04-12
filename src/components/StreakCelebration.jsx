import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

/* ── Confetti particle generator ── */
function useConfetti(count = 40) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: ["🎉", "🔥", "⭐", "✨", "💛", "🟡", "🟠", "❤️", "💪", "🐂"][i % 10],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.2,
      size: 12 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 60,
    })),
  [count]);
}

/* ── 5 bull pose variants (Duolingo-style expressive poses) ── */
const BULL_POSES = [
  {
    id: "proud",
    title: "INCREDIBLE!",
    message: "You're becoming unstoppable!",
    color: "text-orange-500",
    glow: "shadow-orange-400/40",
    bullScale: { animate: { scale: [0, 1.2, 0.95, 1.05, 1], rotate: [0, -5, 5, 0] } },
    bullBounce: { animate: { y: [0, -8, 0] }, transition: { delay: 1.2, duration: 0.6, repeat: Infinity, repeatType: "mirror" } },
  },
  {
    id: "dancing",
    title: "AMAZING!",
    message: "The bull is doing a happy dance!",
    color: "text-yellow-500",
    glow: "shadow-yellow-400/40",
    bullScale: { animate: { scale: [0, 1.15, 1], rotate: [0, -12, 12, -6, 6, 0] } },
    bullBounce: { animate: { y: [0, -12, 0, -6, 0], rotate: [-3, 3, -3, 3, 0] }, transition: { delay: 1.2, duration: 1, repeat: Infinity } },
  },
  {
    id: "flexing",
    title: "UNSTOPPABLE!",
    message: "Flexing that economics muscle!",
    color: "text-red-500",
    glow: "shadow-red-400/40",
    bullScale: { animate: { scale: [0, 1.3, 0.9, 1.1, 1] } },
    bullBounce: { animate: { scale: [1, 1.08, 1], y: [0, -4, 0] }, transition: { delay: 1.2, duration: 0.8, repeat: Infinity, repeatType: "mirror" } },
  },
  {
    id: "jumping",
    title: "ON FIRE!",
    message: "Nothing can slow you down!",
    color: "text-emerald-500",
    glow: "shadow-emerald-400/40",
    bullScale: { animate: { scale: [0, 1.1, 1], y: [60, -20, 0] } },
    bullBounce: { animate: { y: [0, -16, 0] }, transition: { delay: 1.2, duration: 0.5, repeat: Infinity, repeatType: "mirror" } },
  },
  {
    id: "spinning",
    title: "LEGENDARY!",
    message: "You're writing history!",
    color: "text-violet-500",
    glow: "shadow-violet-400/40",
    bullScale: { animate: { scale: [0, 1.2, 1], rotate: [0, 360] } },
    bullBounce: { animate: { y: [0, -6, 0], rotate: [0, 5, -5, 0] }, transition: { delay: 1.4, duration: 1.2, repeat: Infinity } },
  },
];

function pickPose() {
  return BULL_POSES[Math.floor(Math.random() * BULL_POSES.length)];
}

export default function StreakCelebration({ streak, show, onDismiss }) {
  const [pose, setPose] = useState(BULL_POSES[0]);
  const confetti = useConfetti(35);

  useEffect(() => {
    if (show) setPose(pickPose());
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          onClick={onDismiss}
        >
          {/* Background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-orange-500/90 via-amber-500/85 to-yellow-400/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Confetti rain */}
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              className="absolute pointer-events-none"
              style={{ left: `${c.left}%`, fontSize: c.size, top: -30 }}
              initial={{ y: -40, opacity: 0, rotate: 0 }}
              animate={{
                y: ["0vh", "105vh"],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360 * (c.id % 2 === 0 ? 1 : -1)],
                x: [0, c.drift],
              }}
              transition={{
                delay: c.delay,
                duration: c.duration,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {c.emoji}
            </motion.div>
          ))}

          {/* Main content card */}
          <div className="relative z-10 flex flex-col items-center gap-2 px-6">
            {/* Bull mascot — big, centered, expressive */}
            <motion.div
              className={`w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-2xl ${pose.glow}`}
              initial={{ scale: 0, y: 40 }}
              animate={pose.bullScale.animate}
              transition={{ duration: 0.8, type: "spring", damping: 10 }}
            >
              <motion.span
                className="text-7xl select-none"
                animate={pose.bullBounce.animate}
                transition={pose.bullBounce.transition}
              >
                🐂
              </motion.span>
            </motion.div>

            {/* Streak flame ring */}
            <motion.div
              className="flex items-center justify-center mt-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", damping: 12 }}
            >
              <div className="relative">
                <motion.span
                  className="text-7xl font-heading font-black text-white drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  {streak}
                </motion.span>
              </div>
            </motion.div>

            {/* "day streak" label */}
            <motion.p
              className="text-xl font-heading font-bold text-white/90 uppercase tracking-widest"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              day streak 🔥
            </motion.p>

            {/* Expressive title */}
            <motion.p
              className={`text-2xl font-heading font-black mt-3 ${pose.color} drop-shadow-sm`}
              style={{ WebkitTextStroke: "0.5px rgba(0,0,0,0.1)" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1.3, 1], opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4, type: "spring" }}
            >
              {pose.title}
            </motion.p>

            <motion.p
              className="text-white/80 text-sm font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              {pose.message}
            </motion.p>

            {/* Tap to continue */}
            <motion.p
              className="text-white/50 text-xs mt-8 uppercase tracking-widest font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.4] }}
              transition={{ delay: 2, duration: 2, repeat: Infinity }}
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
