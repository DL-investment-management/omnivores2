import React from "react";
import { Link } from "react-router-dom";

export default function OurTeam() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
      <div className="bg-background rounded-lg shadow p-8 flex flex-col items-center w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Our Team</h1>
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-muted mb-4 flex items-center justify-center text-4xl font-bold text-primary">
            D
          </div>
          <div className="text-lg font-semibold mb-1">Donald Liang, Lead Developer</div>
          <div className="italic text-muted-foreground mb-2">"who dares wins"</div>
          <a href="mailto:econgo321@gmail.com" className="text-primary underline text-sm">
            econgo321@gmail.com
          </a>
        </div>

        <div className="border-t border-border w-full pt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Legal</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-primary underline hover:opacity-75 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-primary underline hover:opacity-75 transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
