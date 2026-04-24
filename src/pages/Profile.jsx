import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Zap, Coins, BookOpen, LogOut, Pencil, Check, X, Lock, Crown, Shirt, Footprints, Clock, Search, MessageCircle, UserPlus, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import StreakBadge from "../components/StreakBadge";
import { getCurrentUser, getUserProgress, updateCurrentUser, markOnboardingDone } from "@/lib/appData";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { supabase } from "@/lib/supabase";
import { getLevelInfo } from "@/lib/progression";
import AvatarCharacter, { AVATAR_ITEMS } from "../components/AvatarCharacter";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "hats", label: "Hats", icon: Crown },
  { key: "shirts", label: "Shirts", icon: Shirt },
  { key: "pants", label: "Pants", icon: () => <span className="text-sm font-bold">👖</span> },
  { key: "shoes", label: "Shoes", icon: Footprints },
  { key: "watches", label: "Watches", icon: Clock },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState("hats");
  const [waveKey, setWaveKey] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Live preview state
  const [previewHat, setPreviewHat] = useState(0);
  const [previewShirt, setPreviewShirt] = useState(0);
  const [previewPants, setPreviewPants] = useState(0);
  const [previewShoes, setPreviewShoes] = useState(0);
  const [previewWatch, setPreviewWatch] = useState(0);

  // Social state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [followingMap, setFollowingMap] = useState({}); // email -> bool
  const [socialCounts, setSocialCounts] = useState({ followers: 0, following: 0 });
  const searchTimeout = useRef(null);

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
        setPreviewWatch(u.avatar_watch ?? 0);
        const progress = await getUserProgress(u.email);
        setCompletedCount(progress.filter((record) => record.completed).length);
        // Load social counts
        try {
          const r = await fetch(`/api/follow?email=${encodeURIComponent(u.email)}&type=counts`);
          if (r.ok) setSocialCounts(await r.json());
        } catch {}
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSearch(q) {
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/search-users?q=${encodeURIComponent(q.trim())}`);
        const { users } = await r.json();
        // Filter out self
        const filtered = (users || []).filter(u2 => u2.email !== user?.email);
        setSearchResults(filtered);
        // Check follow status for each result
        if (user && filtered.length > 0) {
          const checks = await Promise.all(
            filtered.map(u2 =>
              fetch(`/api/follow?type=check&follower_email=${encodeURIComponent(user.email)}&following_email=${encodeURIComponent(u2.email)}`)
                .then(r => r.json())
                .then(d => [u2.email, d.following])
                .catch(() => [u2.email, false])
            )
          );
          setFollowingMap(Object.fromEntries(checks));
        }
      } catch {}
      setSearching(false);
    }, 400);
  }

  async function handleFollow(targetEmail) {
    if (!user) return;
    const isFollowing = followingMap[targetEmail];
    const action = isFollowing ? "unfollow" : "follow";
    setFollowingMap(prev => ({ ...prev, [targetEmail]: !isFollowing }));
    try {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, follower_email: user.email, following_email: targetEmail }),
      });
      // Refresh counts
      const r = await fetch(`/api/follow?email=${encodeURIComponent(user.email)}&type=counts`);
      if (r.ok) setSocialCounts(await r.json());
    } catch {
      // Revert on error
      setFollowingMap(prev => ({ ...prev, [targetEmail]: isFollowing }));
    }
  }

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
  const avatarWatch = user?.avatar_watch ?? 0;

  const totalItems = Object.values(AVATAR_ITEMS).reduce((sum, arr) => sum + arr.length, 0);
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
    setPreviewWatch(user?.avatar_watch ?? 0);
    setActiveTab("hats");
    setCustomizing(true);
  }

  async function saveAvatar() {
    const updatedUser = await updateCurrentUser({
      avatar_hat: previewHat,
      avatar_shirt: previewShirt,
      avatar_pants: previewPants,
      avatar_shoes: previewShoes,
      avatar_watch: previewWatch,
    });
    setUser(updatedUser);
    setCustomizing(false);
  }

  function selectItem(category, id) {
    if (category === "hats") setPreviewHat(id);
    else if (category === "shirts") setPreviewShirt(id);
    else if (category === "pants") setPreviewPants(id);
    else if (category === "shoes") setPreviewShoes(id);
    else if (category === "watches") setPreviewWatch(id);
    setWaveKey((k) => k + 1);
  }

  function getPreviewValue(category) {
    if (category === "hats") return previewHat;
    if (category === "shirts") return previewShirt;
    if (category === "pants") return previewPants;
    if (category === "watches") return previewWatch;
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
            <AvatarCharacter hat={avatarHat} shirt={avatarShirt} pants={avatarPants} shoes={avatarShoes} watch={avatarWatch} size={100} />
          </div>
          <button
            onClick={openCustomizer}
            title="Customize avatar"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow bg-primary text-primary-foreground"
          >
            <Pencil className="w-4 h-4" />
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
                className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-lg">Customize Avatar</p>
                    <p className="text-xs text-muted-foreground">{unlockedItems}/{totalItems} items unlocked · level up to unlock more</p>
                  </div>
                  <button onClick={() => setCustomizing(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body: big character left + items right */}
                <div className="flex flex-1 min-h-0">
                  {/* Big character viewer */}
                  <div className="w-44 shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-accent/5 border-r border-border p-4 gap-3">
                    <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                      <AvatarCharacter
                        hat={previewHat}
                        shirt={previewShirt}
                        pants={previewPants}
                        shoes={previewShoes}
                        watch={previewWatch}
                        size={128}
                        waveKey={waveKey}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground text-center">Preview</p>
                    <div className="flex flex-col gap-1 w-full text-[10px] text-muted-foreground">
                      <div className="flex justify-between"><span>Hat</span><span className="font-bold text-foreground">{AVATAR_ITEMS.hats.find(h => h.id === previewHat)?.name ?? "None"}</span></div>
                      <div className="flex justify-between"><span>Shirt</span><span className="font-bold text-foreground">{AVATAR_ITEMS.shirts.find(s => s.id === previewShirt)?.name ?? "None"}</span></div>
                      <div className="flex justify-between"><span>Pants</span><span className="font-bold text-foreground">{AVATAR_ITEMS.pants.find(p => p.id === previewPants)?.name ?? "None"}</span></div>
                      <div className="flex justify-between"><span>Shoes</span><span className="font-bold text-foreground">{AVATAR_ITEMS.shoes.find(s => s.id === previewShoes)?.name ?? "None"}</span></div>
                      <div className="flex justify-between"><span>Watch</span><span className="font-bold text-foreground">{AVATAR_ITEMS.watches.find(w => w.id === previewWatch)?.name ?? "None"}</span></div>
                    </div>
                  </div>

                  {/* Right panel: horizontal tabs + grid */}
                  <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    {/* Horizontal tabs */}
                    <div className="flex border-b border-border bg-muted/20 overflow-x-auto scrollbar-hide">
                      {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wide shrink-0 transition-colors border-b-2 ${
                            activeTab === key
                              ? "text-primary border-primary bg-primary/5"
                              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
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

      {/* Social Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {/* Follower counts */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-heading font-black">{socialCounts.followers}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Followers</p>
          </div>
          <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-heading font-black">{socialCounts.following}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Following</p>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            className="flex-1 rounded-xl gap-2"
          >
            <Search className="w-4 h-4" /> Find People
          </Button>
          <Button
            onClick={() => navigate("/messages")}
            variant="outline"
            className="flex-1 rounded-xl gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Messages
          </Button>
        </div>
      </motion.div>

      {/* Replay Tutorial */}
      <Button
        onClick={() => setShowTutorial(true)}
        variant="outline"
        className="w-full rounded-xl mt-3"
      >
        🎓 Replay Tutorial
      </Button>

      {/* Logout */}
      <Button
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        variant="outline"
        className="w-full rounded-xl mt-3"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      <AnimatePresence>
        {showTutorial && (
          <OnboardingTutorial
            userName={user?.full_name}
            onComplete={() => {
              markOnboardingDone();
              setShowTutorial(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Find People modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
          >
            <motion.div
              className="bg-card border border-border rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden mb-4 sm:mb-0"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {searching && (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                  )}
                </div>
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {searchQuery.trim().length < 2 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm font-semibold">Search for learners</p>
                    <p className="text-xs mt-1">Type at least 2 characters</p>
                  </div>
                ) : searchResults.length === 0 && !searching ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm font-semibold">No one found</p>
                    <p className="text-xs mt-1">Try a different name</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {searchResults.map((u2) => {
                      const isFollowing = followingMap[u2.email];
                      return (
                        <div
                          key={u2.email}
                          className="flex items-center gap-3 bg-muted/40 rounded-2xl px-4 py-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-black text-primary">
                              {(u2.full_name || u2.email)?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-bold text-sm truncate">{u2.full_name || "Economist"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {u2.rank || "Novice"} · {u2.xp || 0} XP
                            </p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); navigate(`/messages?with=${encodeURIComponent(u2.email)}`); }}
                              className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-card transition-colors"
                              title="Message"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleFollow(u2.email)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black transition-colors ${
                                isFollowing
                                  ? "bg-muted border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                              }`}
                            >
                              {isFollowing ? (
                                <><UserCheck className="w-3 h-3" /> Following</>
                              ) : (
                                <><UserPlus className="w-3 h-3" /> Follow</>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
