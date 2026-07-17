import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

// Create a photo. The browser sends an already-resized JPEG as multipart form
// data, which we store in Blob (works with OIDC — no client token needed).
export async function POST(request: Request) {
  if (!isAuthed()) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const image = form.get("image");
  const title = String(form.get("title") || "").trim();

  if (!(image instanceof Blob) || image.size === 0) {
    return NextResponse.json({ error: "No photo received." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Give it a title." }, { status: 400 });
  }

  let webUrl: string;
  try {
    webUrl = await putJpeg(image);
  } catch (err) {
    console.error("[admin] blob put failed:", err);
    return NextResponse.json(
      { error: "Couldn't save the image to storage." },
      { status: 500 }
    );
  }

  // Optional second photo of the actual physical print.
  let printUrl: string | undefined;
  const printImage = form.get("printImage");
  if (printImage instanceof Blob && printImage.size > 0) {
    try {
      printUrl = await putJpeg(printImage);
    } catch (err) {
      console.error("[admin] print image put failed:", err);
    }
  }

  const priceRaw = String(form.get("price") || "").trim();
  const priceNum = priceRaw === "" ? undefined : Number(priceRaw);

  const photo = await addPhoto({
    title,
    location: String(form.get("location") || "").trim(),
    teaser: String(form.get("teaser") || "").trim(),
    story: splitStory(String(form.get("story") || "")),
    image: webUrl,
    sold: form.get("sold") === "true",
    price: Number.isFinite(priceNum) ? (priceNum as number) : undefined,
    size: String(form.get("size") || "").trim(),
    material: String(form.get("material") || "").trim(),
    printImage: printUrl,
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
  if (typeof body.size === "string") patch.size = body.size.trim() || undefined;
  if (typeof body.material === "string")
    patch.material = body.material.trim() || undefined;
  if (typeof body.printImage === "string")
    patch.printImage = body.printImage.trim() || undefined;
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

async function putJpeg(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const uploaded = await put(`web/${Date.now()}-${randomPart()}.jpg`, buffer, {
    access: "public",
    contentType: "image/jpeg",
  });
  return uploaded.url;
}

function randomPart(): string {
  return require("crypto").randomBytes(4).toString("hex");
}
