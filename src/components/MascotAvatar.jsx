import { motion } from "framer-motion";

export default function MascotAvatar({ size = "md", mood = "happy", className = "" }) {
  const sizes = {
    sm: "w-10 h-10 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
    xl: "w-32 h-32 text-5xl",
  };

  const moods = {
    happy: "🐂",
    sad: "🐻",
    excited: "🎉",
    thinking: "🤔",
    celebrate: "🏆",
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center ${className}`}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {moods[mood]}
    </motion.div>
  );
}
