import { NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, adminConfigured } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin isn't set up yet. Add an ADMIN_PASSWORD in Vercel." },
      { status: 503 }
    );
  }
  let password = "";
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  setAuthCookie();
  return NextResponse.json({ ok: true });
}
