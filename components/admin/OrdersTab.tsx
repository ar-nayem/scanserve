"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  paid: "preparing",
  preparing: "ready",
  ready: "completed",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-stone-100 text-stone-600",
  paid: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-stone-200 text-stone-500",
};

const POLL_INTERVAL_MS = 5000;

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function advance(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  if (loading) return <p className="text-stone-400">Loading...</p>;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-stone-800">Orders</h2>
      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const next = NEXT_STATUS[order.status];
          return (
            <div
              key={order.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-stone-900">Table {order.tableNumber}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(order.createdAt).toLocaleTimeString()} &middot; #
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="mt-3 text-sm text-stone-600">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.quantity} &times; {item.name}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                <p className="font-semibold text-stone-900">&#2547;{order.total}</p>
                {next && (
                  <button
                    onClick={() => advance(order)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Mark as {next}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="py-8 text-center text-stone-400">No orders yet</p>
        )}
      </div>
    </div>
  );
}
