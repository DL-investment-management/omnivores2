import { motion } from "framer-motion";
import { Crown, Check, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isProUser, syncProStatus, FREE_UNITS } from "@/lib/appData";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";

const LS_MONTHLY_URL = import.meta.env.VITE_LS_MONTHLY_URL;
const LS_YEARLY_URL  = import.meta.env.VITE_LS_YEARLY_URL;

const PRO_FEATURES = [
  "All 7 economics units (16 lessons)",
  "AI-graded typed questions with feedback",
  "Exclusive cosmetics & avatars",
  "Good Reads author library",
  "Priority on the leaderboard",
];

export default function ProUpgrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [pro, setProState] = useState(isProUser());
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [syncing, setSyncing] = useState(false);

  // Listen for real-time pro status changes
  useEffect(() => {
    const handler = (e) => setProState(e.detail);
    window.addEventListener("econogo:pro-updated", handler);
    return () => window.removeEventListener("econogo:pro-updated", handler);
  }, []);

  // Handle return from Lemon Squeezy checkout (?success=1)
  useEffect(() => {
    if (searchParams.get("success") === "1" && user?.email) {
      setSyncing(true);
      // Poll a few times — webhook may take a second or two
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
    const baseUrl = selectedPlan === "monthly" ? LS_MONTHLY_URL : LS_YEARLY_URL;
    if (!baseUrl) {
      alert("Checkout not configured yet — check back soon!");
      return;
    }
    const email = user?.email || "";
    const successUrl = encodeURIComponent(`${window.location.origin}/upgrade?success=1`);
    const url = `${baseUrl}?checkout[email]=${encodeURIComponent(email)}&checkout[custom][user_email]=${encodeURIComponent(email)}&redirect=${successUrl}`;
    window.location.href = url;
  };

  // Syncing state — shown while polling after payment
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
          <p className="text-muted-foreground text-sm mb-6">You have access to all units, cosmetics, and AI-graded questions.</p>
          <Button onClick={() => navigate("/")} className="rounded-xl font-heading font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-heading font-black">Upgrade to Pro</h1>
        <p className="text-muted-foreground text-sm mt-1">Unlock the full Econ-Go experience</p>
      </motion.div>

      {/* Free vs Pro comparison */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Free Plan</p>
          <div className="space-y-2 mb-4">
            {FREE_UNITS.map((u) => (
              <div key={u} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{u}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <span>Leaderboard & Glossary</span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-yellow-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Pro Features</p>
            </div>
            <div className="space-y-2">
              {PRO_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setSelectedPlan("monthly")}
          className={`relative rounded-2xl border-2 p-4 text-center transition-all ${
            selectedPlan === "monthly"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Monthly</p>
          <p className="text-2xl font-heading font-black">$3.99</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </button>

        <button
          onClick={() => setSelectedPlan("yearly")}
          className={`relative rounded-2xl border-2 p-4 text-center transition-all ${
            selectedPlan === "yearly"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            SAVE 58%
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Yearly</p>
          <p className="text-2xl font-heading font-black">$19.99</p>
          <p className="text-xs text-muted-foreground">/year</p>
        </button>
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button
          onClick={handleUpgrade}
          className="w-full rounded-xl h-12 font-heading font-bold text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30"
        >
          <Crown className="w-5 h-5 mr-2" /> Go Pro — {selectedPlan === "monthly" ? "$3.99/mo" : "$19.99/yr"}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">Cancel anytime · No ads · Instant access</p>
      </motion.div>
    </div>
  );
}
