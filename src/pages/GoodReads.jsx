import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Lock } from "lucide-react";
import { AUTHOR_REWARDS } from "@/lib/authorRewards";
import { getUnlockedAuthorIds, subscribeToUnlockedAuthors } from "@/lib/appData";

const INVESTORS = [
  {
    id: "buffett",
    name: "Warren Buffett",
    avatar: "👴",
    bio: "Chairman of Berkshire Hathaway. Built a $900B empire buying undervalued businesses and holding forever.",
    books: [
      { title: "The Essays of Warren Buffett", year: 1997, desc: "Letters to shareholders distilled into the clearest lessons on long-term value investing." },
      { title: "The Intelligent Investor", year: 1949, desc: "Benjamin Graham's masterwork — Buffett's bible. Defines margin of safety and Mr. Market." },
    ],
  },
  {
    id: "munger",
    name: "Charlie Munger",
    avatar: "🧓",
    bio: "Buffett's partner and Vice Chairman of Berkshire. Famous for mental models and multidisciplinary thinking.",
    books: [
      { title: "Poor Charlie's Almanack", year: 2005, desc: "A collection of Munger's speeches on investing, psychology, and the art of thinking clearly." },
      { title: "Seeking Wisdom", year: 2003, desc: "Peter Bevelin's synthesis of Munger and Darwin — how great thinkers avoid mental errors." },
    ],
  },
  {
    id: "lynch",
    name: "Peter Lynch",
    avatar: "📈",
    bio: "Ran Fidelity's Magellan Fund to a 29% annual return for 13 years. Believed ordinary people can beat Wall Street.",
    books: [
      { title: "One Up on Wall Street", year: 1989, desc: "How to use what you see around you in everyday life to find market-beating stocks before pros do." },
      { title: "Beating the Street", year: 1993, desc: "Lynch picks apart his own investment decisions and reveals how to build a winning portfolio." },
    ],
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    avatar: "🌊",
    bio: "Founder of Bridgewater Associates, the world's largest hedge fund. Pioneer of risk parity and radical transparency.",
    books: [
      { title: "Principles", year: 2017, desc: "Dalio's personal operating system for life and management — radical honesty meets systematic thinking." },
      { title: "The Changing World Order", year: 2021, desc: "A historical study of how empires rise and fall, and what it means for money and power today." },
    ],
  },
  {
    id: "graham",
    name: "Benjamin Graham",
    avatar: "📚",
    bio: "The father of value investing. Taught Buffett at Columbia. Defined how to think about price vs. intrinsic value.",
    books: [
      { title: "The Intelligent Investor", year: 1949, desc: "The cornerstone text of value investing. Introduces margin of safety and emotional discipline." },
      { title: "Security Analysis", year: 1934, desc: "The original deep-value playbook — how to dissect financial statements and find hidden worth." },
    ],
  },
  {
    id: "simons",
    name: "Jim Simons",
    avatar: "🧮",
    bio: "Mathematician turned quant investor. His Medallion Fund averaged 66% annual returns before fees for 30 years.",
    books: [
      { title: "The Man Who Solved the Market", year: 2019, desc: "Gregory Zuckerman's biography of Simons — how math and data conquered Wall Street." },
      { title: "The Quants", year: 2010, desc: "Scott Patterson's account of how math PhDs built and nearly broke the global financial system." },
    ],
  },
  {
    id: "marks",
    name: "Howard Marks",
    avatar: "🔁",
    bio: "Co-founder of Oaktree Capital. Famous for his memos on market cycles, risk, and second-level thinking.",
    books: [
      { title: "The Most Important Thing", year: 2011, desc: "Marks distills 20 years of investor memos into a book on risk, cycles, and thinking differently." },
      { title: "Mastering the Market Cycle", year: 2018, desc: "How to recognize where we are in economic and market cycles — and position accordingly." },
    ],
  },
  {
    id: "soros",
    name: "George Soros",
    avatar: "🌐",
    bio: "Founder of Quantum Fund. Famous for breaking the Bank of England in 1992 by shorting the pound for $1B profit.",
    books: [
      { title: "The Alchemy of Finance", year: 1987, desc: "Soros lays out reflexivity theory — how markets are shaped by the flawed perceptions of participants." },
      { title: "The New Paradigm for Financial Markets", year: 2008, desc: "Written during the 2008 crash: how reflexivity explains financial bubbles and their collapse." },
    ],
  },
];

export default function GoodReads() {
  const [unlockedAuthors, setUnlockedAuthors] = useState([]);

  useEffect(() => {
    setUnlockedAuthors(getUnlockedAuthorIds());
    return subscribeToUnlockedAuthors(setUnlockedAuthors);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-7 h-7 text-secondary" />
        </div>
        <h1 className="text-2xl font-heading font-black">Good Reads</h1>
        <p className="text-sm text-muted-foreground">Essential economics books & the minds behind them</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Economists ── */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Economists — unlock by completing units</p>
          <div className="flex flex-col gap-4">
            {AUTHOR_REWARDS.map((entry, i) => {
              const unlocked = unlockedAuthors.includes(entry.id);
              return (
                <motion.div
                  key={entry.author}
                  className={`bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 ${unlocked ? "" : "opacity-85"}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${unlocked ? "bg-primary/10" : "bg-muted"}`}>
                      {unlocked ? entry.avatar : <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm">{unlocked ? entry.author : "Locked Author"}</p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {unlocked ? entry.bio : entry.unlockCopy}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground w-fit">
                    <span>{entry.unit}</span>
                    <span>•</span>
                    <span>{unlocked ? "Unlocked" : "Locked"}</span>
                  </div>
                  <div className="space-y-2">
                    {entry.books.map((book) => (
                      <div key={book.title} className="bg-muted rounded-xl p-3">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-bold text-sm text-primary leading-snug">
                            {unlocked ? book.title : "???"}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground ml-2 shrink-0">
                            {unlocked ? book.year : "----"}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          {unlocked ? book.desc : "Finish the unit and unlock the author reward in the campaign path to reveal this reading."}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Investors ── */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-1">Investors — always available</p>
          <div className="flex flex-col gap-4">
            {INVESTORS.map((entry, i) => (
              <motion.div
                key={entry.id}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-secondary/10">
                    {entry.avatar}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm">{entry.name}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{entry.bio}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {entry.books.map((book) => (
                    <div key={book.title} className="bg-muted rounded-xl p-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-sm text-secondary leading-snug">{book.title}</p>
                        <span className="text-[10px] font-bold text-muted-foreground ml-2 shrink-0">{book.year}</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed">{book.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
