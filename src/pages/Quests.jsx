import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Check, Lock } from "lucide-react";
import { getCurrentUser, getUnlockedAuthorIds, getPurchases } from "@/lib/appData";
import {
  getDailyQuests,
  getSpecialQuests,
  claimDailyQuest,
  claimSpecialQuest,
} from "@/lib/quests";
import { toast } from "sonner";

function QuestCard({ quest, onClaim, isSpecial, streak }) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    const ok = await onClaim(quest.id);
    if (ok) toast.success(`+${quest.xp} XP — ${quest.label} complete!`);
    setClaiming(false);
  };

  const statusColor = quest.claimed
    ? "border-green-500/30 bg-green-500/5"
    : quest.completed
    ? "border-primary/40 bg-primary/5"
    : "border-border bg-card";

  return (
    <motion.div
      className={`rounded-2xl border p-3 flex flex-col gap-2 ${statusColor}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-xs leading-tight">{quest.label}</p>
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{quest.description}</p>
        </div>
      </div>

      {/* Progress bar for special quests */}
      {isSpecial && !quest.claimed && (
        <div>
          <div className="flex justify-between text-[9px] text-muted-foreground font-semibold mb-1">
            <span>{quest.progress}/{quest.requirement} days</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min((quest.progress / quest.requirement) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* XP + action */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] font-black text-primary">+{quest.xp} XP</span>
        {quest.claimed ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
            <Check className="w-3 h-3" /> Done
          </span>
        ) : quest.completed ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="bg-primary text-primary-foreground rounded-lg px-2.5 py-1 text-[10px] font-black hover:bg-primary/90 active:scale-95 transition-all"
          >
            {claiming ? "..." : "Claim"}
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-semibold">
            <Lock className="w-3 h-3" /> Locked
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Quests() {
  const [user, setUser] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [specialQuests, setSpecialQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
    const ctx = {
      streak: u?.streak || 0,
      unlockedAuthors: getUnlockedAuthorIds(),
      purchases: getPurchases(),
    };
    setDailyQuests(getDailyQuests());
    setSpecialQuests(getSpecialQuests(ctx));
    setLoading(false);
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("econogo:quests-updated", handler);
    return () => window.removeEventListener("econogo:quests-updated", handler);
  }, []);

  const handleClaimDaily = async (id) => {
    const ok = await claimDailyQuest(id);
    if (ok) load();
    return ok;
  };

  const handleClaimSpecial = async (id) => {
    const ctx = {
      streak: user?.streak || 0,
      unlockedAuthors: getUnlockedAuthorIds(),
      purchases: getPurchases(),
    };
    const ok = await claimSpecialQuest(id, ctx);
    if (ok) load();
    return ok;
  };

  const dailyDone = dailyQuests.filter((q) => q.claimed).length;
  const specialDone = specialQuests.filter((q) => q.claimed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-3">
          <Target className="w-4 h-4" />
          <span className="font-heading font-bold text-sm">Quests</span>
        </div>
        <h1 className="text-2xl font-heading font-black">Daily &amp; Special</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Daily resets at midnight · Special quests are permanent milestones
        </p>
      </motion.div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* LEFT — Special */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Special</p>
            <span className="text-[10px] font-bold text-primary">{specialDone}/{specialQuests.length}</span>
          </div>
          <div className="space-y-2">
            {specialQuests.map((q) => (
              <QuestCard key={q.id} quest={q} onClaim={handleClaimSpecial} isSpecial streak={user?.streak || 0} />
            ))}
          </div>
        </div>

        {/* RIGHT — Daily */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Daily</p>
            <span className="text-[10px] font-bold text-primary">{dailyDone}/{dailyQuests.length}</span>
          </div>
          <div className="space-y-2">
            {dailyQuests.map((q) => (
              <QuestCard key={q.id} quest={q} onClaim={handleClaimDaily} isSpecial={false} streak={user?.streak || 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
