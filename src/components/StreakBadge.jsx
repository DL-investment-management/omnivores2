import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakBadge({ streak }) {
  if (!streak || streak < 1) return null;

  const getBadgeLevel = (s) => {
    if (s >= 30) return { label: "Legendary", color: "from-yellow-400 to-orange-500" };
    if (s >= 14) return { label: "On Fire", color: "from-orange-400 to-red-500" };
    if (s >= 7) return { label: "Hot Streak", color: "from-primary to-accent" };
    return { label: "Building Up", color: "from-primary/70 to-primary" };
  };

  const { label, color } = getBadgeLevel(streak);

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white font-bold text-sm shadow-lg`}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Flame className="w-4 h-4" />
      <span>{streak} Day Streak</span>
      <span className="text-xs opacity-80">· {label}</span>
    </motion.div>
  );
}
