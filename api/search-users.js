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
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.status(400).json({ error: "Query too short" });

  const { data, error } = await supabase
    .from("users")
    .select("email, full_name, xp, streak, rank, avatar")
    .ilike("full_name", `%${q.trim()}%`)
    .limit(15);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ users: data || [] });
}
