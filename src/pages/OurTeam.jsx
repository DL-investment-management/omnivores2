import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function OurTeam() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-black">Our Team</h1>
        <p className="text-sm text-muted-foreground">The people behind Econ-Go</p>
      </motion.div>

      <div className="text-center text-muted-foreground text-sm">
        Coming soon.
      </div>
    </div>
  );
}
