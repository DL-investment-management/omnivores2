import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, ShoppingBag, Trophy, Flame, BookMarked, Library, Target, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, subscribeToCurrentUser, syncProStatus, getUnlockedAuthorIds, getPurchases } from "@/lib/appData";
import { getUnclaimedCount } from "@/lib/quests";

const navItems = [
  { path: "/", icon: Home, label: "Learn" },
  { path: "/leaderboard", icon: Trophy, label: "Rank" },
  { path: "/glossary", icon: BookMarked, label: "Glossary" },
  { path: "/quests", icon: Target, label: "Quests" },
  { path: "/good-reads", icon: Library, label: "Reads" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unclaimedQuests, setUnclaimedQuests] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [hasBoost, setHasBoost] = useState(false);

  useEffect(() => {
    const refresh = () => {
      getCurrentUser().then((u) => setUnclaimedQuests(getUnclaimedCount({
        streak: u?.streak || 0,
        unlockedAuthors: getUnlockedAuthorIds(),
        purchases: getPurchases(),
      }))).catch(() => {});
    };
    refresh();
    window.addEventListener("econogo:quests-updated", refresh);
    return () => window.removeEventListener("econogo:quests-updated", refresh);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkBoost = () => {
      const purchases = getPurchases();
      setHasBoost(purchases.some(p => p.item_type === "xp_boost" && !p.used));
    };
    checkBoost();
    window.addEventListener("econogo:user-updated", checkBoost);
    return () => window.removeEventListener("econogo:user-updated", checkBoost);
  }, []);

  useEffect(() => {
    let subscribed = false;
    getCurrentUser()
      .then(u => {
        if (!subscribed) setUser(u);
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
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Econ-Go" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            {hasBoost && (
              <motion.div
                className="flex items-center gap-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-2.5 py-1.5"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <span className="text-sm">⚡</span>
                <span className="font-black text-xs font-heading text-yellow-500">2×</span>
              </motion.div>
            )}
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-secondary" />
              <span className="font-bold text-sm font-heading">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <span className="text-sm">💰</span>
              <span className="font-bold text-sm font-heading">{user?.capital || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-6 sm:pb-20">
        <Outlet />
      </main>

      {/* Desktop Bottom Nav — hidden on mobile */}
      <nav className="hidden sm:block fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
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

      {/* Mobile Floating Nav — visible only on mobile */}
      <div className="sm:hidden">
        {/* Backdrop */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Popup nav card */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              key="navcard"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-3 w-72"
            >
              <div className="grid grid-cols-4 gap-1">
                {navItems.map(({ path, icon: Icon, label }) => {
                  const isActive = location.pathname === path;
                  const showBadge = path === "/quests" && unclaimedQuests > 0;
                  return (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setNavOpen(false); }}
                      className={`relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground active:bg-muted"
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
                      <span className="text-[9px] font-semibold leading-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating pill toggle button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setNavOpen(o => !o)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2.5 shadow-lg shadow-primary/30"
        >
          <AnimatePresence mode="wait" initial={false}>
            {navOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                {(() => {
                  const active = navItems.find(n => n.path === location.pathname) || navItems[0];
                  const ActiveIcon = active.icon;
                  return (
                    <>
                      <div className="relative">
                        <ActiveIcon className="w-5 h-5 stroke-[2.5]" />
                        {location.pathname === "/quests" && unclaimedQuests > 0 && (
                          <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            {unclaimedQuests}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-heading">{active.label}</span>
                    </>
                  );
                })()}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
