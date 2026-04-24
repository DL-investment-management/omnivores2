import { motion, AnimatePresence } from "framer-motion";
import { getLevelInfo, getNewlyUnlockedCosmetics } from "@/lib/progression";

const PARTICLES = [
  { id: 0,  angle: 0,   dist: 130, emoji: "⭐" },
  { id: 1,  angle: 30,  dist: 110, emoji: "🎉" },
  { id: 2,  angle: 60,  dist: 140, emoji: "✨" },
  { id: 3,  angle: 90,  dist: 120, emoji: "💫" },
  { id: 4,  angle: 120, dist: 135, emoji: "🌟" },
  { id: 5,  angle: 150, dist: 115, emoji: "⭐" },
  { id: 6,  angle: 180, dist: 130, emoji: "🎊" },
  { id: 7,  angle: 210, dist: 120, emoji: "✨" },
  { id: 8,  angle: 240, dist: 140, emoji: "💫" },
  { id: 9,  angle: 270, dist: 110, emoji: "⭐" },
  { id: 10, angle: 300, dist: 135, emoji: "🌟" },
  { id: 11, angle: 330, dist: 125, emoji: "🎉" },
];

export default function LevelUpCelebration({ show, xp, prevXp = 0, onDismiss }) {
  const levelInfo = getLevelInfo(xp);
  const newCosmetics = getNewlyUnlockedCosmetics(prevXp, xp);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="levelup-backdrop"
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          {/* Blurred dark backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-8 py-10 bg-card border border-border rounded-3xl shadow-2xl mx-4 w-full max-w-sm"
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Burst particles */}
            {PARTICLES.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const tx = Math.cos(rad) * p.dist;
              const ty = Math.sin(rad) * p.dist;
              return (
                <motion.span
                  key={p.id}
                  className="absolute text-xl pointer-events-none select-none"
                  style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
                  initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0 }}
                  animate={{ x: `calc(-50% + ${tx}px)`, y: `calc(-50% + ${ty}px)`, opacity: [0, 1, 0], scale: [0, 1.3, 0.8] }}
                  transition={{ duration: 0.9, delay: 0.1 + p.id * 0.03, ease: "easeOut" }}
                >
                  {p.emoji}
                </motion.span>
              );
            })}

            {/* Level badge */}
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center shadow-lg mb-5"
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
            >
              <span className="text-primary-foreground font-heading font-black text-3xl leading-none">
                {levelInfo.level}
              </span>
              <span className="text-primary-foreground/70 text-[9px] font-bold uppercase tracking-wider">
                Level
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                Level Up!
              </p>
              <h2 className="text-2xl font-heading font-black text-foreground mb-1">
                {levelInfo.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                You've reached Level {levelInfo.level}. Keep going!
              </p>

              {/* Newly unlocked cosmetics */}
              {newCosmetics.length > 0 && (
                <div className="bg-muted rounded-2xl px-4 py-3 mb-5 w-full">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    🎁 Unlocked
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {newCosmetics.map((c) => (
                      <div key={c.id} className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl">{c.icon}</span>
                        <span className="text-[10px] font-semibold text-foreground leading-none">
                          {c.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onDismiss}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-3 font-heading font-bold text-base hover:bg-primary/90 active:scale-95 transition-all"
              >
                Let's Go! 🚀
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
