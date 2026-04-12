import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MascotAvatar from "../components/MascotAvatar";
import { createPurchase, getCurrentUser, getShopItems, updateCurrentUser } from "@/lib/appData";

export default function Shop() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [u, i] = await Promise.all([
          getCurrentUser(),
          getShopItems(),
        ]);
        setUser(u);
        setItems(i);
      } catch (e) {
        console.error("Shop load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleBuy = async (item) => {
    const capital = user?.capital || 0;
    if (capital < item.price) {
      toast.error("Not enough Capital! Complete more lessons to earn Capital.");
      return;
    }

    setBuying(item.id);
    await createPurchase({
      user_email: user.email,
      item_id: item.id,
      item_type: item.item_type,
      used: false,
    });
    const updatedUser = await updateCurrentUser({
      capital: capital - item.price,
    });
    setUser(updatedUser);
    toast.success(`You bought ${item.name}!`);
    setBuying(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-3">
          <ShoppingBag className="w-4 h-4" />
          <span className="font-heading font-bold text-sm">EconoShop</span>
        </div>
        <h1 className="text-2xl font-heading font-black mb-1">Spend Your Capital</h1>
        <div className="flex items-center justify-center gap-2">
          <Coins className="w-5 h-5 text-secondary" />
          <span className="font-heading font-bold text-xl text-secondary">{user?.capital || 0}</span>
          <span className="text-sm text-muted-foreground">available</span>
        </div>
      </motion.div>

      {/* Items Grid */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {item.icon || "🎁"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-sm">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Button
              onClick={() => handleBuy(item)}
              disabled={buying === item.id || (user?.capital || 0) < item.price}
              className="rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0"
              size="sm"
            >
              <Coins className="w-3 h-3 mr-1" />
              {item.price}
            </Button>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-16">
            <MascotAvatar size="lg" mood="thinking" className="mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Shop is empty</h2>
            <p className="text-muted-foreground text-sm">Items will appear here soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
