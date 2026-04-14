import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/appData";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, RefreshCw } from "lucide-react";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [u, res] = await Promise.all([
        getCurrentUser(),
        fetch("/api/leaderboard"),
      ]);
      setCurrentUser(u);
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const { users: ranked } = await res.json();
      setUsers(ranked || []);
    } catch (e) {
      console.error("Leaderboard load error:", e);
      setError("Could not load rankings. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const getRowBg = (index, isCurrentUser) => {
    if (isCurrentUser) return "bg-primary/5 border-primary/40";
    if (index === 0) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30";
    if (index === 1) return "bg-gray-50 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/30";
    if (index === 2) return "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30";
    return "bg-card border-border";
  };

  // Find current user's rank in the list
  const currentUserRank = currentUser
    ? users.findIndex((u) => u.email === currentUser.email)
    : -1;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
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
        <p className="text-sm text-muted-foreground">All-time XP rankings</p>
      </motion.div>

      {/* Current user rank banner if not in top 50 */}
      {!loading && currentUser && currentUserRank === -1 && (currentUser.xp || 0) > 0 && (
        <motion.div
          className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            {(currentUser.avatar) || (currentUser.full_name || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{currentUser.full_name || "You"} <span className="text-primary">(You)</span></p>
            <p className="text-xs text-muted-foreground">Not yet ranked — complete more lessons!</p>
          </div>
          <p className="font-heading font-black text-primary">{currentUser.xp || 0} XP</p>
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-2 mx-auto text-primary text-sm font-semibold hover:opacity-75 transition"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {users.map((user, i) => {
            const isCurrentUser = currentUser?.email === user.email;
            return (
              <motion.div
                key={user.email}
                className={`flex items-center gap-3 p-4 rounded-xl border ${getRowBg(i, isCurrentUser)} ${
                  isCurrentUser ? "ring-2 ring-primary" : ""
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-5 flex items-center justify-center shrink-0">
                  {getMedalIcon(i)}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-lg shrink-0">
                  {user.avatar || (user.full_name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user.full_name || "Anonymous"}
                    {isCurrentUser && (
                      <span className="ml-1 text-xs text-primary font-bold">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.rank || "Novice"} · {user.streak || 0} day streak</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-black text-primary">{(user.xp || 0).toLocaleString()}</p>
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
                Complete lessons to be the first on the leaderboard!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
