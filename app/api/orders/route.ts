import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { isAdminRequest } from "@/lib/apiAuth";
import { OrderItem } from "@/lib/types";

// Admin-only: the Orders tab polls this for the live order list.
export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await db.orders.list();
  return NextResponse.json(orders);
}

interface CartLine {
  menuItemId: string;
  quantity: number;
}

// Public: called when the customer taps "Place Order & Pay".
// Prices are recomputed from the menu server-side — the client only sends
// item ids and quantities, never trusted prices.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const tableNumber: string | undefined = body?.tableNumber;
  const cartLines: CartLine[] | undefined = body?.items;
  const voucherCode: string | undefined = body?.voucherCode?.trim();

  if (!tableNumber || !Array.isArray(cartLines) || cartLines.length === 0) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const menu = await db.menu.list();
  const orderItems: OrderItem[] = [];

  for (const line of cartLines) {
    const menuItem = menu.find((m) => m.id === line.menuItemId);
    if (!menuItem || !menuItem.available) {
      return NextResponse.json(
        { error: `Item unavailable: ${line.menuItemId}` },
        { status: 400 }
      );
    }
    if (typeof line.quantity !== "number" || line.quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    orderItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: line.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  let appliedVoucherCode: string | undefined;
  if (voucherCode) {
    const voucher = await db.vouchers.getByCode(voucherCode);
    if (voucher && voucher.active) {
      discountAmount =
        voucher.type === "percent"
          ? Math.round((subtotal * voucher.value) / 100)
          : Math.min(voucher.value, subtotal);
      appliedVoucherCode = voucher.code;
    }
  }

  const total = subtotal - discountAmount;

  const order = await db.orders.create({
    tableNumber,
    items: orderItems,
    subtotal,
    voucherCode: appliedVoucherCode,
    discountAmount,
    total,
    status: "pending",
  });

  return NextResponse.json(order, { status: 201 });
}
