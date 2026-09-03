import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const transactionId: string | undefined = body?.transactionId;

  if (!transactionId) {
    return NextResponse.json({ error: "transactionId required" }, { status: 400 });
  }

  const result = await verifyPayment(transactionId);
  return NextResponse.json(result);
}
