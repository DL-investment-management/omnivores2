import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Lock, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnitAuthorNode({ reward, status, index, onUnlock, onOpenReads }) {
  const [showPopup, setShowPopup] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const isLocked = status === "locked";
  const isReady = status === "ready";
  const isUnlocked = status === "unlocked";
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      className={`flex w-full max-w-[320px] flex-col ${isLeft ? "items-start" : "items-end"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Circle + portrait card side by side */}
      <div className={`flex items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
        <button
          onClick={() => setShowPopup(true)}
          className="group shrink-0"
          disabled={isLocked}
        >
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
              isUnlocked
                ? "bg-accent shadow-lg shadow-accent/30"
                : isReady
                ? "bg-secondary shadow-lg shadow-secondary/30 group-hover:scale-110"
                : "bg-muted opacity-60"
            }`}
          >
            {isLocked ? <Lock className="w-6 h-6 text-muted-foreground" /> : reward.avatar}
            {(isReady || isUnlocked) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                {isUnlocked ? <BookOpen className="w-3 h-3 text-accent" /> : <Sparkles className="w-3 h-3 text-secondary" />}
              </div>
            )}
          </div>
        </button>

        {/* Portrait card — visible once not locked */}
        {!isLocked ? (
          <button
            onClick={() => setShowPopup(true)}
            className={`flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all hover:border-primary/40`}
          >
            <span className="text-3xl leading-none">{reward.avatar}</span>
            <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"}`}>
              <span className="text-sm font-black text-foreground leading-tight">{reward.author}</span>
              {reward.lifespan && (
                <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{reward.lifespan}</span>
              )}
              <span className="text-[10px] text-primary font-black uppercase tracking-wide mt-1">Author Reward</span>
            </div>
          </button>
        ) : (
          <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"}`}>
            <span className="text-xs font-semibold text-muted-foreground">???</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-black">Author Reward</span>
          </div>
        )}
      </div>

      {/* Info popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            className="bg-card rounded-2xl border border-border w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{reward.unit}</p>
                <h3 className="text-lg font-heading font-black">{reward.author}</h3>
                {reward.lifespan && !isLocked && (
                  <p className="text-xs text-muted-foreground mt-0.5">{reward.lifespan}</p>
                )}
              </div>
              <button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                {isLocked ? "🔒" : reward.avatar}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isLocked ? reward.unlockCopy : reward.bio}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              {reward.books.map((book) => (
                <div key={book.title} className="bg-muted rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-sm text-primary leading-snug">{book.title}</p>
                    <span className="text-[10px] font-bold text-muted-foreground">{book.year}</span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    {isLocked ? "Unlock this author at the end of the unit to read the full notes." : book.desc}
                  </p>
                </div>
              ))}
            </div>

            {isLocked && (
              <Button disabled className="w-full rounded-xl h-11 font-heading font-bold">
                Finish The Unit To Unlock
              </Button>
            )}

            {isReady && (
              <Button
                onClick={() => {
                  onUnlock(reward.id);
                  setShowPopup(false);
                  setShowReveal(true);
                }}
                className="w-full rounded-xl h-11 font-heading font-bold"
              >
                Unlock Author Reward
              </Button>
            )}

            {isUnlocked && (
              <Button
                onClick={() => {
                  setShowPopup(false);
                  onOpenReads();
                }}
                className="w-full rounded-xl h-11 font-heading font-bold"
              >
                Open Good Reads
              </Button>
            )}
          </motion.div>
        </div>
      )}

      {/* Unlock reveal popup — shown once on first unlock */}
      {showReveal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowReveal(false)}
        >
          <motion.div
            className="bg-card rounded-2xl border border-border w-full max-w-md p-8 text-center"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 14 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {reward.avatar}
            </motion.div>

            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Author Unlocked</p>
            <h2 className="text-2xl font-heading font-black mb-1">{reward.author}</h2>
            {reward.lifespan && (
              <p className="text-xs text-muted-foreground mb-4">{reward.lifespan}</p>
            )}

            <p className="text-sm text-foreground/80 leading-relaxed mb-5">{reward.bio}</p>

            {reward.contributions && reward.contributions.length > 0 && (
              <div className="text-left bg-muted rounded-xl p-4 mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Contributions</p>
                <ul className="space-y-2">
                  {reward.contributions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Star className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setShowReveal(false)}
              className="w-full rounded-xl h-11 font-heading font-bold"
            >
              Awesome!
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}