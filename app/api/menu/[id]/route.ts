import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { isAdminRequest } from "@/lib/apiAuth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = await db.menu.update(params.id, {
    name: body.name,
    category: body.category,
    description: body.description,
    price: body.price,
    available: body.available,
    imageUrl: body.imageUrl || undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const removed = await db.menu.remove(params.id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
