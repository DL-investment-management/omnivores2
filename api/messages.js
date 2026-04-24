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

  // GET: fetch messages or conversation list
  if (req.method === "GET") {
    const { email, type, with_email } = req.query;
    if (!email) return res.status(400).json({ error: "email required" });

    if (type === "conversation" && with_email) {
      // Get full conversation between two users
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(from_email.eq.${email.toLowerCase()},to_email.eq.${with_email.toLowerCase()}),` +
          `and(from_email.eq.${with_email.toLowerCase()},to_email.eq.${email.toLowerCase()})`
        )
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) return res.status(500).json({ error: error.message });

      // Mark messages to this user as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("to_email", email.toLowerCase())
        .eq("from_email", with_email.toLowerCase())
        .eq("read", false);

      return res.status(200).json({ messages: data || [] });
    }

    if (type === "conversations") {
      // Get unique conversation partners with latest message
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`from_email.eq.${email.toLowerCase()},to_email.eq.${email.toLowerCase()}`)
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ error: error.message });

      // Deduplicate: one entry per conversation partner
      const seen = new Map();
      for (const msg of (data || [])) {
        const partner = msg.from_email === email.toLowerCase() ? msg.to_email : msg.from_email;
        if (!seen.has(partner)) seen.set(partner, msg);
      }

      // Fetch user info for each partner
      const partners = Array.from(seen.keys());
      let userMap = {};
      if (partners.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("email, full_name, xp, rank, avatar")
          .in("email", partners);
        for (const u of (users || [])) userMap[u.email] = u;
      }

      // Unread counts
      const { data: unreadData } = await supabase
        .from("messages")
        .select("from_email")
        .eq("to_email", email.toLowerCase())
        .eq("read", false);

      const unreadCounts = {};
      for (const row of (unreadData || [])) {
        unreadCounts[row.from_email] = (unreadCounts[row.from_email] || 0) + 1;
      }

      const conversations = Array.from(seen.entries()).map(([partner, msg]) => ({
        partner_email: partner,
        partner: userMap[partner] || { email: partner, full_name: partner, avatar: "?" },
        latest_message: msg,
        unread: unreadCounts[partner] || 0,
      }));

      return res.status(200).json({ conversations });
    }

    if (type === "unread_count") {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("to_email", email.toLowerCase())
        .eq("read", false);
      return res.status(200).json({ unread: count || 0 });
    }

    return res.status(400).json({ error: "Invalid type" });
  }

  // POST: send a message
  if (req.method === "POST") {
    const { from_email, to_email, content } = req.body || {};
    if (!from_email || !to_email || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (content.trim().length === 0 || content.length > 500) {
      return res.status(400).json({ error: "Invalid content length" });
    }
    if (from_email === to_email) {
      return res.status(400).json({ error: "Cannot message yourself" });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        from_email: from_email.toLowerCase(),
        to_email: to_email.toLowerCase(),
        content: content.trim(),
        read: false,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: data });
  }

  return res.status(405).end();
}
