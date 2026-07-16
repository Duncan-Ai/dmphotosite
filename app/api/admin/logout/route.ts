import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
