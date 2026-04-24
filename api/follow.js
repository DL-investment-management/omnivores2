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
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET: fetch followers or following list
  if (req.method === "GET") {
    const { email, type } = req.query;
    if (!email) return res.status(400).json({ error: "email required" });

    if (type === "followers") {
      // Who follows this user
      const { data, error } = await supabase
        .from("follows")
        .select("follower_email, users!follows_follower_email_fkey(full_name, xp, rank, avatar)")
        .eq("following_email", email.toLowerCase());
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ follows: data || [] });
    }

    if (type === "following") {
      // Who this user follows
      const { data, error } = await supabase
        .from("follows")
        .select("following_email, users!follows_following_email_fkey(full_name, xp, rank, avatar)")
        .eq("follower_email", email.toLowerCase());
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ follows: data || [] });
    }

    if (type === "check") {
      // Check if follower_email follows following_email
      const { follower_email, following_email } = req.query;
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_email", follower_email.toLowerCase())
        .eq("following_email", following_email.toLowerCase())
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ following: !!data });
    }

    if (type === "counts") {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_email", email.toLowerCase()),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_email", email.toLowerCase()),
      ]);
      return res.status(200).json({
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
      });
    }

    return res.status(400).json({ error: "Invalid type" });
  }

  // POST: follow or unfollow
  if (req.method === "POST") {
    const { action, follower_email, following_email } = req.body || {};
    if (!action || !follower_email || !following_email) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (follower_email === following_email) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    if (action === "follow") {
      const { error } = await supabase
        .from("follows")
        .upsert(
          { follower_email: follower_email.toLowerCase(), following_email: following_email.toLowerCase() },
          { onConflict: "follower_email,following_email" }
        );
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === "unfollow") {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_email", follower_email.toLowerCase())
        .eq("following_email", following_email.toLowerCase());
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).end();
}
