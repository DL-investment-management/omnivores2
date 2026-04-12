import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Verify the webhook came from Lemon Squeezy
function verifySignature(rawBody, signature) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false; // REJECT all webhooks until secret is configured
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const digestBuf = Buffer.from(digest);
  if (sigBuf.length !== digestBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, sigBuf);
}

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers["x-signature"];

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const eventName = payload?.meta?.event_name;

  // On successful payment, grant Pro
  if (
    eventName === "order_created" ||
    eventName === "subscription_created" ||
    eventName === "subscription_payment_success"
  ) {
    const email =
      payload?.data?.attributes?.user_email ||
      payload?.data?.attributes?.billing_address?.email;

    if (!email) {
      return res.status(400).json({ error: "No email in payload" });
    }

    // Upsert: create user row if not exists, set is_pro = true
    const { error } = await supabase
      .from("users")
      .upsert(
        { email: email.toLowerCase().trim(), is_pro: true },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: "DB error" });
    }

    console.log(`Granted Pro to ${email}`);
  }

  // On refund/cancellation, revoke Pro
  if (
    eventName === "order_refunded" ||
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    const email =
      payload?.data?.attributes?.user_email ||
      payload?.data?.attributes?.billing_address?.email;

    if (email) {
      await supabase
        .from("users")
        .update({ is_pro: false })
        .eq("email", email.toLowerCase().trim());

      console.log(`Revoked Pro from ${email}`);
    }
  }

  return res.status(200).json({ received: true });
}
