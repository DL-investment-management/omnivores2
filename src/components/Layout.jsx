import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, ShoppingBag, Trophy, Flame, BookMarked, Library, Users, Mail, Crown, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, subscribeToCurrentUser, isProUser, syncProStatus } from "@/lib/appData";

const PRO_LOCKED_PATHS = ["/leaderboard", "/glossary", "/good-reads", "/shop"];

const navItems = [
  { path: "/", icon: Home, label: "Learn" },
  { path: "/leaderboard", icon: Trophy, label: "Rank" },
  { path: "/glossary", icon: BookMarked, label: "Glossary" },
  { path: "/good-reads", icon: Library, label: "Reads" },
  { path: "/shop", icon: ShoppingBag, label: "Shop" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/our-team", icon: Users, label: "Team" },
  { path: "/contact", icon: Mail, label: "Contact" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(isProUser());

  useEffect(() => {
    const handler = (e) => setIsPro(e.detail);
    window.addEventListener("econogo:pro-updated", handler);
    return () => window.removeEventListener("econogo:pro-updated", handler);
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">E</span>
            </div>
            <span className="font-heading font-bold text-lg text-foreground">Econ-Go</span>
          </Link>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link to="/upgrade" className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-sm">
                <Crown className="w-3.5 h-3.5" /> Pro
              </Link>
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
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            const locked = !isPro && PRO_LOCKED_PATHS.includes(path);
            return (
              <button
                key={path}
                onClick={() => navigate(locked ? "/upgrade" : path)}
                title={locked ? "Purchase premium to unlock" : label}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  locked
                    ? "text-muted-foreground/40 cursor-pointer"
                    : isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive && !locked ? "stroke-[2.5]" : ""}`} />
                  {locked && (
                    <div className="absolute -top-1.5 -right-2.5 flex items-center">
                      <Link2 className="w-3 h-3 text-yellow-500 rotate-45" />
                      <Link2 className="w-3 h-3 text-yellow-500 -rotate-45 -ml-1.5" />
                    </div>
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
