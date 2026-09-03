import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { isAdminRequest } from "@/lib/apiAuth";
import { OrderStatus } from "@/lib/types";

// Public: the order-confirmation page fetches its own order by id.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await db.orders.get(params.id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "preparing", "ready", "completed"];

// Admin-only: moves an order forward through the kitchen workflow.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status: OrderStatus | undefined = body?.status;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db.orders.updateStatus(params.id, status);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
