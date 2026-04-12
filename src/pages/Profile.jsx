import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Zap, Coins, BookOpen, LogOut, Pencil, Check, X, Lock, Crown, Shirt, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import StreakBadge from "../components/StreakBadge";
import { getCurrentUser, getUserProgress, updateCurrentUser, isProUser } from "@/lib/appData";
import { supabase } from "@/lib/supabase";
import { getLevelInfo } from "@/lib/progression";
import AvatarCharacter, { AVATAR_ITEMS } from "../components/AvatarCharacter";

const TABS = [
  { key: "hats", label: "Hats", icon: Crown },
  { key: "shirts", label: "Shirts", icon: Shirt },
  { key: "pants", label: "Pants", icon: () => <span className="text-sm font-bold">👖</span> },
  { key: "shoes", label: "Shoes", icon: Footprints },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState("hats");
  const [waveKey, setWaveKey] = useState(0);

  // Live preview state
  const [previewHat, setPreviewHat] = useState(0);
  const [previewShirt, setPreviewShirt] = useState(0);
  const [previewPants, setPreviewPants] = useState(0);
  const [previewShoes, setPreviewShoes] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        setEditName(u.full_name || "");
        setPreviewHat(u.avatar_hat ?? 0);
        setPreviewShirt(u.avatar_shirt ?? 0);
        setPreviewPants(u.avatar_pants ?? 0);
        setPreviewShoes(u.avatar_shoes ?? 0);
        const progress = await getUserProgress(u.email);
        setCompletedCount(progress.filter((record) => record.completed).length);
      } catch (e) {
        console.error("Profile load error:", e);
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

  const xp = user?.xp || 0;
  const rank = user?.rank || "Novice";
  const streak = user?.streak || 0;
  const capital = user?.capital || 0;
  const levelInfo = getLevelInfo(xp);

  const avatarHat = user?.avatar_hat ?? 0;
  const avatarShirt = user?.avatar_shirt ?? 0;
  const avatarPants = user?.avatar_pants ?? 0;
  const avatarShoes = user?.avatar_shoes ?? 0;

  const totalItems = AVATAR_ITEMS.hats.length + AVATAR_ITEMS.shirts.length + AVATAR_ITEMS.pants.length + AVATAR_ITEMS.shoes.length;
  const unlockedItems = Object.values(AVATAR_ITEMS).flat().filter(i => i.level <= levelInfo.level).length;

  const stats = [
    { icon: Zap, label: "Total XP", value: xp, color: "text-primary" },
    { icon: Award, label: "Level", value: levelInfo.level, color: "text-accent" },
    { icon: Flame, label: "Day Streak", value: streak, color: "text-secondary" },
    { icon: Coins, label: "Capital", value: capital, color: "text-warning" },
    { icon: BookOpen, label: "Lessons Done", value: completedCount, color: "text-primary" },
  ];

  function openCustomizer() {
    setPreviewHat(user?.avatar_hat ?? 0);
    setPreviewShirt(user?.avatar_shirt ?? 0);
    setPreviewPants(user?.avatar_pants ?? 0);
    setPreviewShoes(user?.avatar_shoes ?? 0);
    setActiveTab("hats");
    setCustomizing(true);
  }

  async function saveAvatar() {
    const updatedUser = await updateCurrentUser({
      avatar_hat: previewHat,
      avatar_shirt: previewShirt,
      avatar_pants: previewPants,
      avatar_shoes: previewShoes,
    });
    setUser(updatedUser);
    setCustomizing(false);
  }

  function selectItem(category, id) {
    if (category === "hats") setPreviewHat(id);
    else if (category === "shirts") setPreviewShirt(id);
    else if (category === "pants") setPreviewPants(id);
    else if (category === "shoes") setPreviewShoes(id);
    setWaveKey((k) => k + 1);
  }

  function getPreviewValue(category) {
    if (category === "hats") return previewHat;
    if (category === "shirts") return previewShirt;
    if (category === "pants") return previewPants;
    return previewShoes;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Profile Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Avatar Character */}
        <div className="relative mx-auto mb-4 w-fit">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
            <AvatarCharacter hat={avatarHat} shirt={avatarShirt} pants={avatarPants} shoes={avatarShoes} size={100} />
          </div>
          <button
            onClick={isProUser() ? openCustomizer : () => {}}
            title={isProUser() ? "Customize avatar" : "Pro required"}
            className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow ${
              isProUser() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-default"
            }`}
          >
            {isProUser() ? <Pencil className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </div>

        {/* Avatar Customizer Popup */}
        <AnimatePresence>
          {customizing && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizing(false)}
            >
              <motion.div
                className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with preview */}
                <div className="p-4 border-b border-border flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                    <AvatarCharacter hat={previewHat} shirt={previewShirt} pants={previewPants} shoes={previewShoes} size={72} waveKey={waveKey} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-heading font-bold text-lg">Customize Avatar</p>
                    <p className="text-xs text-muted-foreground">Choose your style! Items unlock as you level up.</p>
                    <p className="text-xs font-bold text-primary mt-1">{unlockedItems}/{totalItems} unlocked</p>
                  </div>
                </div>

                {/* Body with side tabs */}
                <div className="flex flex-1 min-h-0">
                  {/* Side tabs */}
                  <div className="w-16 border-r border-border flex flex-col py-2 shrink-0 bg-muted/30">
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex flex-col items-center gap-1 py-3 px-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                          activeTab === key
                            ? "text-primary bg-primary/10 border-r-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Items grid */}
                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-3 gap-2">
                      {AVATAR_ITEMS[activeTab].map((item) => {
                        const unlocked = item.level <= levelInfo.level;
                        const selected = getPreviewValue(activeTab) === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => unlocked && selectItem(activeTab, item.id)}
                            disabled={!unlocked}
                            className={`rounded-xl border p-2 text-center transition-all ${
                              selected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                                : unlocked
                                ? "border-border hover:border-primary/40 hover:bg-muted/60"
                                : "border-border bg-muted/40 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-lg mx-auto mb-1.5"
                              style={{ backgroundColor: item.color }}
                            />
                            <p className="text-[11px] font-bold truncate">{item.name}</p>
                            {!unlocked && (
                              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground">Lv{item.level}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setCustomizing(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 rounded-xl" onClick={saveAvatar}>
                    <Check className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {editing ? (
          <div className="flex items-center gap-2 justify-center">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm font-heading font-bold text-center bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
            <button
              onClick={async () => {
                setSaving(true);
                const updatedUser = await updateCurrentUser({ full_name: editName });
                setUser(updatedUser);
                setSaving(false);
                setEditing(false);
              }}
              disabled={saving}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(false); setEditName(user?.full_name || ""); }}
              className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-heading font-black">{user?.full_name || "Economist"}</h1>
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-3">
          <StreakBadge streak={streak} />
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-accent">
          <Award className="w-4 h-4" />
          <span className="text-sm font-heading font-bold">Level {levelInfo.level}</span>
          <span className="text-xs text-accent/80">· {levelInfo.title}</span>
        </div>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        className="bg-card rounded-2xl border border-border p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            <span className="font-heading font-bold">Level {levelInfo.level}</span>
          </div>
          {levelInfo.next && (
            <span className="text-xs text-muted-foreground">
              {levelInfo.xpToNextLevel} XP to Level {levelInfo.next.level}
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <div>
            <p className="font-heading font-bold">{rank}</p>
            <p className="text-xs text-muted-foreground">Current rank title</p>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-primary">
              {unlockedItems}/{totalItems} cosmetics
            </p>
            <p className="text-xs text-muted-foreground">Unlocked by level</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            className="bg-card rounded-xl border border-border p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
            <p className="text-2xl font-heading font-black">{value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              {label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <Button
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        variant="outline"
        className="w-full rounded-xl"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
