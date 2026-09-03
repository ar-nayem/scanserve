"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MenuTab from "./MenuTab";
import OrdersTab from "./OrdersTab";
import VouchersTab from "./VouchersTab";
import QrTab from "./QrTab";

type Tab = "menu" | "orders" | "vouchers" | "qr";

const TABS: { key: Tab; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "menu", label: "Menu" },
  { key: "vouchers", label: "Vouchers" },
  { key: "qr", label: "QR Codes" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-stone-900">ScanServe Owner Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600"
        >
          Log out
        </button>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
              tab === t.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-stone-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-4xl p-4">
        {tab === "menu" && <MenuTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "vouchers" && <VouchersTab />}
        {tab === "qr" && <QrTab />}
      </main>
    </div>
  );
}
