import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { syncProStatus, setPro, isProUser } from "@/lib/appData";

// Secret key — only you know this URL
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export default function Admin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const key = searchParams.get("key");
    const action = searchParams.get("action") || "grant";

    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      // Wrong key — silently redirect to home so it's not obvious this route exists
      navigate("/");
      return;
    }

    async function run() {
      if (action === "revoke") {
        setPro(false);
      } else {
        setPro(true);
      }

      // Also sync proper state from server if we have an email
      if (user?.email) {
        await syncProStatus(user.email);
      }

      navigate("/");
    }

    run();
  }, []);

  return null;
}
