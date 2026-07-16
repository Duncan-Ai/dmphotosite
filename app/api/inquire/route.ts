import { NextResponse } from "next/server";
import { site } from "@/data/site";

export const runtime = "nodejs";

type Inquiry = {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  message?: string;
};

export async function POST(request: Request) {
  let data: Inquiry;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const message = (data.message || "").trim();
  const phone = (data.phone || "").trim();
  const photo = (data.photo || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and a message." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look right — mind checking it?" },
      { status: 400 }
    );
  }

  const to = process.env.INQUIRY_TO_EMAIL || site.contactEmail;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL || "onboarding@resend.dev";

  const subject = photo
    ? `Print inquiry: ${photo}`
    : `New print inquiry from ${name}`;

  const text = [
    `New inquiry from your photography site`,
    ``,
    `Photo:   ${photo || "(not specified)"}`,
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Phone:   ${phone || "(none)"}`,
    ``,
    `Message:`,
    message,
  ].join("\n");

  // If email isn't configured yet, still accept the inquiry so the visitor
  // sees a success message. The submission is logged in the Vercel function
  // logs as a fallback. Add RESEND_API_KEY to actually receive emails.
  if (!apiKey) {
    console.log("[inquiry] (email not configured) —\n" + text);
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Photo Site <${from}>`,
        to: [to],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[inquiry] Resend error:", res.status, detail);
      // Don't punish the visitor for a mail config issue — log it and accept.
      console.log("[inquiry] (delivery failed) —\n" + text);
      return NextResponse.json({ ok: true, delivered: false });
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[inquiry] send failed:", err);
    console.log("[inquiry] (delivery failed) —\n" + text);
    return NextResponse.json({ ok: true, delivered: false });
  }
}
