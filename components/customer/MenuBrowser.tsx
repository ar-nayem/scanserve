"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/lib/types";
import CartDrawer, { CartLine } from "./CartDrawer";

export default function MenuBrowser({
  items,
  tableNumber,
}: {
  items: MenuItem[];
  tableNumber: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [items]);

  const cartLines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, quantity]) => {
        const item = items.find((i) => i.id === menuItemId)!;
        return { item, quantity };
      });
  }, [cart, items]);

  const itemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.quantity * l.item.price, 0);

  function addItem(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function setQuantity(id: string, quantity: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[id];
      } else {
        next[id] = quantity;
      }
      return next;
    });
  }

  async function placeOrder(voucher: { code: string; discountAmount: number } | null) {
    if (!tableNumber) {
      setError("No table number found. Please scan the QR code at your table.");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: cartLines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })),
          voucherCode: voucher?.code,
        }),
      });
      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        throw new Error(body.error || "Could not place order");
      }
      const order = await orderRes.json();

      const paymentRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!paymentRes.ok) {
        throw new Error("Payment failed");
      }

      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPlacing(false);
    }
  }

  return (
    <div className="px-4">
      {categories.map(([category, categoryItems]) => (
        <section key={category} className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-stone-800">{category}</h2>
          <div className="flex flex-col gap-3">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm ${
                  !item.available ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-brand-700">
                    &#2547;{item.price}
                  </p>
                </div>
                <button
                  disabled={!item.available}
                  onClick={() => addItem(item.id)}
                  className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white active:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {item.available ? "Add" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {itemCount > 0 && !cartOpen && (
        <button
          onClick={() => {
            setError(null);
            setCartOpen(true);
          }}
          className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-xl bg-brand-600 px-5 py-3.5 text-white shadow-lg"
        >
          <span className="font-semibold">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
          <span className="font-semibold">View cart &middot; &#2547;{subtotal}</span>
        </button>
      )}

      {cartOpen && (
        <CartDrawer
          lines={cartLines}
          subtotal={subtotal}
          placing={placing}
          error={error}
          onClose={() => setCartOpen(false)}
          onSetQuantity={setQuantity}
          onPlaceOrder={placeOrder}
        />
      )}
    </div>
  );
}
