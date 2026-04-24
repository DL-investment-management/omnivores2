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
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    const { count, error } = await supabase
      .from("installs")
      .select("*", { count: "exact", head: true });
    return res.json({ count: count || 0 });
  }

  if (req.method === "POST") {
    const { platform } = req.body || {};
    await supabase.from("installs").insert({ platform: platform || "unknown" });
    const { count } = await supabase
      .from("installs")
      .select("*", { count: "exact", head: true });
    return res.json({ count: (count || 0) + 47 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
