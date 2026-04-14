import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { data, error } = await supabase
    .from("users")
    .select("email, full_name, xp, streak, avatar, rank")
    .gt("xp", 0)
    .order("xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("leaderboard error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ users: data || [] });
}
