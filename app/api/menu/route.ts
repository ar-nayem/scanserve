import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { isAdminRequest } from "@/lib/apiAuth";

// Public: the customer menu page reads this.
export async function GET() {
  const items = await db.menu.list();
  return NextResponse.json(items);
}

// Admin-only: adds a new menu item.
export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || typeof body.price !== "number") {
    return NextResponse.json({ error: "Invalid menu item" }, { status: 400 });
  }

  const item = await db.menu.create({
    name: body.name,
    category: body.category || "Uncategorized",
    description: body.description || "",
    price: body.price,
    available: body.available !== false,
    imageUrl: body.imageUrl || undefined,
  });

  return NextResponse.json(item, { status: 201 });
}
