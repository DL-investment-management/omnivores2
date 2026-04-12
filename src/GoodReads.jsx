import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const BOOKS = [
  {
    author: "Adam Smith",
    avatar: "🎩",
    bio: "Scottish economist and philosopher, widely considered the father of modern economics.",
    books: [
      { title: "The Wealth of Nations", year: 1776, desc: "The foundational text of capitalism and free-market economics." },
      { title: "The Theory of Moral Sentiments", year: 1759, desc: "Explores the role of empathy and ethics in human behavior." },
    ],
  },
  {
    author: "John Maynard Keynes",
    avatar: "📊",
    bio: "British economist whose ideas fundamentally changed macroeconomics and government economic policy.",
    books: [
      { title: "The General Theory of Employment, Interest and Money", year: 1936, desc: "Argued for government spending to combat recessions." },
      { title: "A Tract on Monetary Reform", year: 1923, desc: "Keynes's early critique of post-WWI economic policies." },
    ],
  },
  {
    author: "Karl Marx",
    avatar: "⚙️",
    bio: "German philosopher and economist whose critique of capitalism shaped 20th-century political history.",
    books: [
      { title: "Das Kapital", year: 1867, desc: "A deep critique of capitalism, profit, and labor exploitation." },
      { title: "The Communist Manifesto", year: 1848, desc: "A political pamphlet calling workers to unite against capitalism." },
    ],
  },
  {
    author: "Milton Friedman",
    avatar: "🏦",
    bio: "American economist and Nobel laureate, champion of free markets and monetary policy.",
    books: [
      { title: "Capitalism and Freedom", year: 1962, desc: "Argues economic freedom is essential to political freedom." },
      { title: "A Monetary History of the United States", year: 1963, desc: "Influential analysis of money supply and the Great Depression." },
    ],
  },
  {
    author: "Daniel Kahneman",
    avatar: "🧠",
    bio: "Israeli-American psychologist and Nobel laureate, pioneer of behavioral economics.",
    books: [
      { title: "Thinking, Fast and Slow", year: 2011, desc: "Explores two systems of thought and the biases that affect our decisions." },
    ],
  },
  {
    author: "Thomas Piketty",
    avatar: "📉",
    bio: "French economist known for his groundbreaking research on wealth inequality.",
    books: [
      { title: "Capital in the Twenty-First Century", year: 2013, desc: "Analyzes historical data to argue that wealth inequality is rising." },
      { title: "A Brief History of Equality", year: 2021, desc: "A more optimistic look at the long-run progress toward equality." },
    ],
  },
  {
    author: "Friedrich Hayek",
    avatar: "🗽",
    bio: "Austrian-British economist and political philosopher, fierce advocate of free-market capitalism.",
    books: [
      { title: "The Road to Serfdom", year: 1944, desc: "Warns that central planning leads to authoritarianism." },
      { title: "The Constitution of Liberty", year: 1960, desc: "Lays out a philosophical case for individual freedom and limited government." },
    ],
  },
  {
    author: "Richard Thaler",
    avatar: "🎯",
    bio: "American economist and Nobel laureate, co-founder of behavioral economics and nudge theory.",
    books: [
      { title: "Nudge", year: 2008, desc: "How small design choices can steer people toward better decisions." },
      { title: "Misbehaving", year: 2015, desc: "A behind-the-scenes look at the rise of behavioral economics." },
    ],
  },
];

export default function GoodReads() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BOOKS.map((entry, i) => (
          <motion.div
            key={entry.author}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                {entry.avatar}
              </div>
              <div>
                <p className="font-heading font-bold text-sm">{entry.author}</p>
                <p className="text-xs text-muted-foreground leading-snug">{entry.bio}</p>
              </div>
            </div>

            {/* Books */}
            <div className="space-y-2">
              {entry.books.map((book) => (
                <div key={book.title} className="bg-muted rounded-xl p-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm text-primary leading-snug">{book.title}</p>
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
  );
}