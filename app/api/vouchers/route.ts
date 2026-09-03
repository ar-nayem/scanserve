import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data";
import { isAdminRequest } from "@/lib/apiAuth";
import { VoucherType } from "@/lib/types";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const vouchers = await db.vouchers.list();
  return NextResponse.json(vouchers);
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const code: string | undefined = body?.code?.trim();
  const type: VoucherType | undefined = body?.type;
  const value: number | undefined = body?.value;

  if (!code || (type !== "percent" && type !== "fixed") || typeof value !== "number") {
    return NextResponse.json({ error: "Invalid voucher" }, { status: 400 });
  }

  const existing = await db.vouchers.getByCode(code);
  if (existing) {
    return NextResponse.json({ error: "Voucher code already exists" }, { status: 409 });
  }

  const voucher = await db.vouchers.create({
    code: code.toUpperCase(),
    type,
    value,
    active: body.active !== false,
  });

  return NextResponse.json(voucher, { status: 201 });
}
