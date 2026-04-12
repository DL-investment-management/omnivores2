import { motion, AnimatePresence } from "framer-motion";

export default function StreakCelebration({ streak, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 text-center px-8"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12 }}
          >
            {/* Teddy Bear Mascot */}
            <motion.div
              className="w-28 h-28 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center shadow-xl"
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-6xl">🐻</span>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-4xl font-heading font-black text-secondary mb-1">
                🔥 {streak} Day Streak!
              </p>
              <p className="text-muted-foreground font-semibold">
                Keep it up! You're on fire! 🎉
              </p>
            </motion.div>

            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 6) * Math.PI * 2) * 120,
                  y: Math.sin((i / 6) * Math.PI * 2) * 120,
                }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}