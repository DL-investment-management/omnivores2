import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, ShoppingBag, Trophy, Flame, BookMarked, Library, Users, Mail, Crown, Link2, Zap, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, subscribeToCurrentUser, isProUser, syncProStatus, PRO_GATING_ENABLED, getEnergy, MAX_ENERGY } from "@/lib/appData";
import { getUnclaimedCount } from "@/lib/quests";

const PRO_LOCKED_PATHS = ["/leaderboard", "/glossary", "/good-reads", "/shop"];

const navItems = [
  { path: "/", icon: Home, label: "Learn" },
  { path: "/leaderboard", icon: Trophy, label: "Rank" },
  { path: "/glossary", icon: BookMarked, label: "Glossary" },
  { path: "/quests", icon: Target, label: "Quests" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/upgrade", icon: Crown, label: "Pro" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(isProUser());
  const [energy, setEnergy] = useState(() => getEnergy());
  const [unclaimedQuests, setUnclaimedQuests] = useState(0);

  useEffect(() => {
    const handler = (e) => setIsPro(e.detail);
    window.addEventListener("econogo:pro-updated", handler);
    return () => window.removeEventListener("econogo:pro-updated", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => setEnergy(e.detail);
    window.addEventListener("econogo:energy-updated", handler);
    const tick = setInterval(() => setEnergy(getEnergy()), 5 * 60 * 1000);
    return () => {
      window.removeEventListener("econogo:energy-updated", handler);
      clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      getCurrentUser().then((u) => setUnclaimedQuests(getUnclaimedCount(u?.streak || 0))).catch(() => {});
    };
    refresh();
    window.addEventListener("econogo:quests-updated", refresh);
    return () => window.removeEventListener("econogo:quests-updated", refresh);
  }, []);

  useEffect(() => {
    let subscribed = false;
    getCurrentUser()
      .then(u => {
        if (!subscribed) setUser(u);
        // Verify Pro status against Supabase on every load
        if (u?.email) syncProStatus(u.email);
      })
      .catch(() => {});
    return subscribeToCurrentUser(u => {
      subscribed = true;
      setUser(u);
    });
  }, []);

  const streak = user?.streak || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* MVP Banner */}
      <div className="fixed top-2 right-2 z-[100] border border-border bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 pointer-events-none">
        <span className="text-[10px] font-mono font-semibold text-muted-foreground tracking-wide">Minimum Viable Product</span>
      </div>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-lg">E</span>
              </div>
              <span className="font-heading font-bold text-lg text-foreground">Econ-Go</span>
            </Link>
            {PRO_GATING_ENABLED && (isPro ? (
              <span className="ml-2 flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-sm cursor-default">
                <Crown className="w-3.5 h-3.5" /> Pro
              </span>
            ) : (
              <Link to="/upgrade" className="ml-2 flex items-center gap-1 bg-muted text-primary rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border border-primary/30 hover:bg-primary/10 transition cursor-pointer">
                Free Tier
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-secondary" />
              <span className="font-bold text-sm font-heading">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm font-heading">{energy}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <span className="text-sm">💰</span>
              <span className="font-bold text-sm font-heading">{user?.capital || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            const showBadge = path === "/quests" && unclaimedQuests > 0;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unclaimedQuests}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
