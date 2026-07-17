import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stores a single (already browser-resized) JPEG and returns its URL.
// Used by the edit form to attach a "photo of the actual print".
export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const image = form.get("image");
  if (!(image instanceof Blob) || image.size === 0) {
    return NextResponse.json({ error: "No image received." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploaded = await put(
      `web/${Date.now()}-${require("crypto").randomBytes(4).toString("hex")}.jpg`,
      buffer,
      { access: "public", contentType: "image/jpeg" }
    );
    return NextResponse.json({ url: uploaded.url });
  } catch (err) {
    console.error("[admin] upload-image put failed:", err);
    return NextResponse.json(
      { error: "Couldn't save the image to storage." },
      { status: 500 }
    );
  }
}
