import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only allow requests from our own domain
  const origin = req.headers.origin || "";
  const allowedOrigins = ["https://econ-go.com", "http://localhost:5173", "http://localhost:4173"];
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
    return res.status(400).json({ is_pro: false });
  }

  const emailClean = email.toLowerCase().trim();

  // Upsert: create user row if first time (is_pro defaults to false), leave alone if exists
  await supabase.from("users").upsert({ email: emailClean }, { onConflict: "email", ignoreDuplicates: true });

  const { data, error } = await supabase
    .from("users")
    .select("is_pro")
    .eq("email", emailClean)
    .single();

  if (error || !data) {
    // User not in DB yet — not pro
    return res.status(200).json({ is_pro: false });
  }

  return res.status(200).json({ is_pro: data.is_pro === true });
}
