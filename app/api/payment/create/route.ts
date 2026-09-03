import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { createPayment } from "@/lib/payment";

// Public: called right after order creation, on "Place Order & Pay".
// Wraps lib/payment.ts so swapping in a real gateway later doesn't touch
// this route's shape — only createPayment()'s internals change.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderId: string | undefined = body?.orderId;

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await db.orders.get(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const result = await createPayment(order);

  if (!result.success) {
    return NextResponse.json({ error: "Payment failed" }, { status: 402 });
  }

  const updated = await db.orders.updateStatus(orderId, "paid", result.transactionId);

  return NextResponse.json({
    transactionId: result.transactionId,
    order: updated,
  });
}
