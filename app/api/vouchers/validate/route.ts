import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";

// Public: called from the customer cart when they tap "Apply" on a voucher code.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code: string | undefined = body?.code?.trim();
  const subtotal: number | undefined = body?.subtotal;

  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const voucher = await db.vouchers.getByCode(code);
  if (!voucher || !voucher.active) {
    return NextResponse.json({ error: "Voucher code not found or inactive" }, { status: 404 });
  }

  const discountAmount =
    voucher.type === "percent"
      ? Math.round((subtotal * voucher.value) / 100)
      : Math.min(voucher.value, subtotal);

  return NextResponse.json({
    code: voucher.code,
    type: voucher.type,
    value: voucher.value,
    discountAmount,
  });
}
