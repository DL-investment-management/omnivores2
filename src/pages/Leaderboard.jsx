import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/appData";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
        // In local mode the current user is the only entry
        if (u && (u.xp || 0) > 0) {
          setUsers([u]);
        }
      } catch (e) {
        console.error("Leaderboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const getRowBg = (index) => {
    if (index === 0) return "bg-yellow-50 border-yellow-200";
    if (index === 1) return "bg-gray-50 border-gray-200";
    if (index === 2) return "bg-amber-50 border-amber-200";
    return "bg-card border-border";
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-3">
          <Trophy className="w-4 h-4" />
          <span className="font-heading font-bold text-sm">Leaderboard</span>
        </div>
        <h1 className="text-2xl font-heading font-black">Top Economists</h1>
        <p className="text-sm text-muted-foreground">Weekly XP Rankings</p>
      </motion.div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {users.map((user, i) => {
          const isCurrentUser = currentUser?.email === user.email;
          return (
            <motion.div
              key={user.id}
              className={`flex items-center gap-3 p-4 rounded-xl border ${getRowBg(i)} ${
                isCurrentUser ? "ring-2 ring-primary" : ""
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {getMedalIcon(i)}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary">
                {(user.full_name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user.full_name || "Anonymous"}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-primary font-bold">(You)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{user.rank || "Novice"}</p>
              </div>
              <div className="text-right">
                <p className="font-heading font-black text-primary">{user.xp || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">XP</p>
              </div>
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-heading font-bold mb-2">No rankings yet</h2>
            <p className="text-muted-foreground text-sm">
              Complete lessons to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
