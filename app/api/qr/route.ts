import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminRequest } from "@/lib/apiAuth";

// Admin-only: generates a QR code PNG (as a data URL) encoding the menu URL
// for a given table number.
//
// MULTI-TENANT NOTE: once this app serves many restaurants, encode
// `?restaurant=X&table=N` instead of just `?table=N`.
export async function GET(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const table = req.nextUrl.searchParams.get("table");
  if (!table) {
    return NextResponse.json({ error: "table query param required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const targetUrl = `${baseUrl}/?table=${encodeURIComponent(table)}`;

  const dataUrl = await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 2,
  });

  return NextResponse.json({ dataUrl, url: targetUrl, table });
}
