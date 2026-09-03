"use client";

import { useState } from "react";
import { MenuItem } from "@/lib/types";

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

interface AppliedVoucher {
  code: string;
  discountAmount: number;
}

export default function CartDrawer({
  lines,
  subtotal,
  placing,
  error,
  onClose,
  onSetQuantity,
  onPlaceOrder,
}: {
  lines: CartLine[];
  subtotal: number;
  placing: boolean;
  error: string | null;
  onClose: () => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onPlaceOrder: (voucher: AppliedVoucher | null) => void;
}) {
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<AppliedVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  const total = subtotal - (voucher?.discountAmount || 0);

  async function applyVoucher() {
    if (!voucherInput.trim()) return;
    setCheckingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherInput.trim(), subtotal }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Invalid voucher");
      }
      const data = await res.json();
      setVoucher({ code: data.code, discountAmount: data.discountAmount });
    } catch (err) {
      setVoucher(null);
      setVoucherError(err instanceof Error ? err.message : "Invalid voucher");
    } finally {
      setCheckingVoucher(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-lg font-semibold">Your order</h2>
          <button onClick={onClose} className="text-stone-500" aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {lines.length === 0 && (
            <p className="py-8 text-center text-stone-400">Your cart is empty</p>
          )}
          <div className="flex flex-col gap-3">
            {lines.map((line) => (
              <div key={line.item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">{line.item.name}</p>
                  <p className="text-sm text-stone-500">&#2547;{line.item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetQuantity(line.item.id, line.quantity - 1)}
                    className="h-8 w-8 rounded-full border border-stone-300 text-stone-600"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-medium">{line.quantity}</span>
                  <button
                    onClick={() => onSetQuantity(line.item.id, line.quantity + 1)}
                    className="h-8 w-8 rounded-full border border-stone-300 text-stone-600"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className="mt-5 border-t border-stone-100 pt-4">
              <div className="flex gap-2">
                <input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Voucher code"
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm uppercase"
                />
                <button
                  onClick={applyVoucher}
                  disabled={checkingVoucher || !voucherInput.trim()}
                  className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 disabled:opacity-50"
                >
                  {checkingVoucher ? "..." : "Apply"}
                </button>
              </div>
              {voucherError && <p className="mt-1 text-sm text-red-600">{voucherError}</p>}
              {voucher && (
                <p className="mt-1 text-sm text-green-700">
                  Voucher {voucher.code} applied: -&#2547;{voucher.discountAmount}
                </p>
              )}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-stone-100 px-4 py-4">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>&#2547;{subtotal}</span>
            </div>
            {voucher && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>-&#2547;{voucher.discountAmount}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between text-base font-bold text-stone-900">
              <span>Total</span>
              <span>&#2547;{total}</span>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button
              onClick={() => onPlaceOrder(voucher)}
              disabled={placing}
              className="mt-4 w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-60"
            >
              {placing ? "Placing order..." : "Place Order & Pay"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
