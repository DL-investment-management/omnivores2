import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_ORIGINS = [
  "https://econ-go.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const origin = req.headers.origin || "";
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).end();
  }

  const { email, full_name, xp, streak, avatar, rank } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { error } = await supabase
    .from("users")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        full_name: full_name || null,
        xp: xp || 0,
        streak: streak || 0,
        avatar: avatar || null,
        rank: rank || "Novice",
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("sync-user error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
