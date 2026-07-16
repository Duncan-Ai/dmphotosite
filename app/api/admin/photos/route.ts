import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { isAuthed } from "@/lib/auth";
import {
  readManagedPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto,
} from "@/lib/photos";

export const runtime = "nodejs";
export const maxDuration = 60;

function unauthorized() {
  return NextResponse.json({ error: "Not authorized." }, { status: 401 });
}

// List the real (admin-managed) photos.
export async function GET() {
  if (!isAuthed()) return unauthorized();
  const photos = await readManagedPhotos();
  return NextResponse.json({ photos });
}

// Create a photo: takes the freshly-uploaded original image URL, makes a
// web-optimized version, then saves the record.
export async function POST(request: Request) {
  if (!isAuthed()) return unauthorized();

  let body: {
    originalUrl?: string;
    title?: string;
    location?: string;
    teaser?: string;
    story?: string;
    price?: string | number | null;
    sold?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const originalUrl = (body.originalUrl || "").trim();
  if (!title || !originalUrl) {
    return NextResponse.json(
      { error: "A photo and a title are both required." },
      { status: 400 }
    );
  }

  // Fetch the original from Blob and make a smaller, web-friendly JPEG.
  let webUrl = originalUrl;
  try {
    const res = await fetch(originalUrl, { cache: "no-store" });
    const input = Buffer.from(await res.arrayBuffer());
    const optimized = await sharp(input)
      .rotate() // respect EXIF orientation
      .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    const uploaded = await put(`web/${Date.now()}-${randomSlugPart()}.jpg`, optimized, {
      access: "public",
      contentType: "image/jpeg",
    });
    webUrl = uploaded.url;
    // Remove the large original; we only need the web version.
    try {
      await del(originalUrl);
    } catch {
      /* ignore */
    }
  } catch {
    // If optimizing fails for any reason, fall back to the original URL so the
    // photo still gets published rather than lost.
    webUrl = originalUrl;
  }

  const priceNum =
    body.price === "" || body.price === null || body.price === undefined
      ? undefined
      : Number(body.price);

  const photo = await addPhoto({
    title,
    location: (body.location || "").trim(),
    teaser: (body.teaser || "").trim(),
    story: splitStory(body.story || ""),
    image: webUrl,
    sold: Boolean(body.sold),
    price: Number.isFinite(priceNum) ? (priceNum as number) : undefined,
  });

  return NextResponse.json({ photo });
}

// Update a photo (edit fields, toggle sold, etc.).
export async function PATCH(request: Request) {
  if (!isAuthed()) return unauthorized();
  let body: Record<string, unknown> & { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.location === "string") patch.location = body.location.trim();
  if (typeof body.teaser === "string") patch.teaser = body.teaser.trim();
  if (typeof body.story === "string") patch.story = splitStory(body.story);
  if (typeof body.sold === "boolean") patch.sold = body.sold;
  if ("price" in body) {
    const n = Number(body.price);
    patch.price =
      body.price === "" || body.price === null || !Number.isFinite(n)
        ? undefined
        : n;
  }

  const updated = await updatePhoto(body.id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
  return NextResponse.json({ photo: updated });
}

// Delete a photo.
export async function DELETE(request: Request) {
  if (!isAuthed()) return unauthorized();
  let id = "";
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const ok = await deletePhoto(id);
  if (!ok) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

function splitStory(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function randomSlugPart(): string {
  return require("crypto").randomBytes(4).toString("hex");
}
