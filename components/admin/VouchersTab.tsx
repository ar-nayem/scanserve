"use client";

import { useEffect, useState } from "react";
import { Voucher, VoucherType } from "@/lib/types";

export default function VouchersTab() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<VoucherType>("percent");
  const [value, setValue] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/vouchers");
    if (res.ok) setVouchers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    const numericValue = Number(value);
    if (!code.trim() || Number.isNaN(numericValue)) {
      setError("Code and a valid value are required");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type, value: numericValue, active }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Could not create voucher");
      return;
    }
    setCode("");
    setValue("");
    setActive(true);
    load();
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-stone-800">Vouchers</h2>

      <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">Create voucher</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-stone-500">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SAVE20"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm uppercase"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as VoucherType)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off (BDT)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "10" : "50"}
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
          <button
            onClick={create}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.code} className="border-b border-stone-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-stone-900">{v.code}</td>
                  <td className="px-3 py-2 text-stone-600">
                    {v.type === "percent" ? "Percent off" : "Fixed off"}
                  </td>
                  <td className="px-3 py-2 text-stone-600">
                    {v.type === "percent" ? `${v.value}%` : `৳${v.value}`}
                  </td>
                  <td className="px-3 py-2">
                    {v.active ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-stone-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-stone-400">
                    No vouchers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
