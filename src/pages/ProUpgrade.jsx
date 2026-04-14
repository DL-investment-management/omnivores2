import { motion } from "framer-motion";
import { Crown, Check, X, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isProUser, syncProStatus } from "@/lib/appData";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";

const LS_MONTHLY_URL = import.meta.env.VITE_LS_MONTHLY_URL;

const COMPARISON = [
  { feature: "Supply & Demand unit",       free: true,  pro: true  },
  { feature: "Basic multiple choice quiz", free: true,  pro: true  },
  { feature: "Daily streak tracking",      free: true,  pro: true  },
  { feature: "All 7 economics units",      free: false, pro: true  },
  { feature: "16 full lessons",            free: false, pro: true  },
  { feature: "AI-graded typed answers",    free: false, pro: true  },
  { feature: "Leaderboard (Rank tab)",     free: false, pro: true  },
  { feature: "Economics Glossary",         free: false, pro: true  },
  { feature: "Good Reads library",         free: false, pro: true  },
  { feature: "Shop & cosmetics",           free: false, pro: true  },
  { feature: "Exclusive avatars",          free: false, pro: true  },
];

export default function ProUpgrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [pro, setProState] = useState(isProUser());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handler = (e) => setProState(e.detail);
    window.addEventListener("econogo:pro-updated", handler);
    return () => window.removeEventListener("econogo:pro-updated", handler);
  }, []);

  // Handle return from Lemon Squeezy checkout (?success=1)
  useEffect(() => {
    if (searchParams.get("success") === "1" && user?.email) {
      setSyncing(true);
      let attempts = 0;
      const poll = async () => {
        await syncProStatus(user.email);
        attempts++;
        if (!isProUser() && attempts < 6) {
          setTimeout(poll, 2000);
        } else {
          setSyncing(false);
          setProState(isProUser());
        }
      };
      poll();
    }
  }, [searchParams, user]);

  const handleUpgrade = () => {
    if (!LS_MONTHLY_URL) {
      alert("Checkout not configured yet — check back soon!");
      return;
    }
    const email = user?.email || "";
    const successUrl = encodeURIComponent(`${window.location.origin}/upgrade?success=1`);
    const url = `${LS_MONTHLY_URL}?checkout[email]=${encodeURIComponent(email)}&checkout[custom][user_email]=${encodeURIComponent(email)}&redirect=${successUrl}`;
    window.location.href = url;
  };

  if (syncing) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-heading font-black mb-2">Activating your Pro account…</h1>
          <p className="text-muted-foreground text-sm">This only takes a moment.</p>
        </motion.div>
      </div>
    );
  }

  if (pro) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-heading font-black mb-2">You're Pro!</h1>
          <p className="text-muted-foreground text-sm mb-6">
            You have access to all units, cosmetics, and AI-graded questions.
          </p>
          <Button onClick={() => navigate("/")} className="rounded-xl font-heading font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-heading font-black">Upgrade to Pro</h1>
        <p className="text-muted-foreground text-sm mt-1">Unlock the full Econ-Go experience</p>
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border overflow-hidden mb-6"
      >
        {/* Column headers */}
        <div className="grid grid-cols-3 text-center">
          <div className="bg-muted/50 px-3 py-4 border-b border-border">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Feature</p>
          </div>
          <div className="bg-muted/50 px-3 py-4 border-b border-l border-border">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Free</p>
            <p className="text-lg font-heading font-black text-foreground mt-0.5">$0</p>
          </div>
          <div className="bg-gradient-to-b from-yellow-500/15 to-orange-500/15 px-3 py-4 border-b border-l border-border">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Crown className="w-3 h-3 text-yellow-500" />
              <p className="text-xs font-black uppercase tracking-widest text-yellow-600">Pro</p>
            </div>
            <p className="text-lg font-heading font-black text-foreground">$4.99</p>
            <p className="text-[10px] text-muted-foreground font-semibold">/ month</p>
          </div>
        </div>

        {/* Rows */}
        {COMPARISON.map(({ feature, free, pro: hasPro }, i) => (
          <div
            key={feature}
            className={`grid grid-cols-3 text-center ${
              i < COMPARISON.length - 1 ? "border-b border-border" : ""
            } ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
          >
            <div className="px-3 py-3 text-left flex items-center">
              <span className="text-xs font-semibold text-foreground leading-snug">{feature}</span>
            </div>
            <div className="px-3 py-3 border-l border-border flex items-center justify-center">
              {free ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>
            <div className="px-3 py-3 border-l border-border flex items-center justify-center bg-yellow-500/5">
              {hasPro ? (
                <Check className="w-4 h-4 text-yellow-500" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={handleUpgrade}
          className="w-full h-13 py-3.5 rounded-2xl font-heading font-black text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 active:scale-[0.98] text-white shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" /> Go Pro — $4.99 / month
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime · No ads · Instant access
        </p>
      </motion.div>
    </div>
  );
}
