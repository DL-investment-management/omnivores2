import React from "react";

export default function OurTeam() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="bg-background rounded-lg shadow p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Our Team</h1>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-muted mb-4 flex items-center justify-center text-4xl font-bold text-primary">
            D
          </div>
          <div className="text-lg font-semibold mb-1">Donald Liang, Lead Developer</div>
          <div className="italic text-muted-foreground mb-2">"who dares wins"</div>
          <a href="mailto:econgo321@gmail.com" className="text-primary underline text-sm">
            econgo321@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
