// ============================================================================
//  PHOTO DATA LAYER
// ----------------------------------------------------------------------------
//  Photos added through /admin are stored in Vercel Blob as a single
//  manifest.json file (plus the image files themselves). The public site reads
//  from that manifest.
//
//  If Blob storage isn't set up yet (no token), or no photos have been added,
//  the site falls back to the placeholder set in data/photos.ts so it never
//  looks empty or breaks.
// ============================================================================

import { list, put, del } from "@vercel/blob";
import { photos as seedPhotos, type Photo } from "@/data/photos";

export type { Photo };

const MANIFEST = "manifest.json";

export function blobEnabled(): boolean {
  // A store connected the classic way exposes BLOB_READ_WRITE_TOKEN; a store
  // connected with OIDC exposes BLOB_STORE_ID instead. Either means storage is
  // available at runtime.
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}

async function manifestUrl(): Promise<string | null> {
  const { blobs } = await list({ prefix: MANIFEST });
  const found = blobs.find((b) => b.pathname === MANIFEST);
  return found ? found.url : null;
}

/** The real, admin-managed photos (empty array if none yet). */
export async function readManagedPhotos(): Promise<Photo[]> {
  if (!blobEnabled()) return [];
  try {
    const url = await manifestUrl();
    if (!url) return [];
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: Photo[] };
    return Array.isArray(data.photos) ? data.photos : [];
  } catch {
    return [];
  }
}

async function writeManagedPhotos(photos: Photo[]): Promise<void> {
  // Remove any existing manifest first so the write never conflicts, then
  // write it back at the same stable pathname.
  try {
    const existing = await manifestUrl();
    if (existing) await del(existing);
  } catch {
    /* ignore */
  }
  await put(MANIFEST, JSON.stringify({ photos }, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

/** What the public site shows: real photos, or the seed placeholders. */
export async function getPhotos(): Promise<Photo[]> {
  const managed = await readManagedPhotos();
  return managed.length > 0 ? managed : seedPhotos;
}

export async function getPhotoBySlug(slug: string): Promise<Photo | undefined> {
  return (await getPhotos()).find((p) => p.slug === slug);
}

// ---- mutations (used by the admin API) ------------------------------------

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base || "photo";
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export type NewPhoto = {
  title: string;
  location: string;
  teaser: string;
  story: string[];
  image: string;
  sold: boolean;
  price?: number;
};

export async function addPhoto(input: NewPhoto): Promise<Photo> {
  const photos = await readManagedPhotos();
  const taken = new Set(photos.map((p) => p.slug));
  const photo: Photo = {
    id: cryptoRandomId(),
    slug: uniqueSlug(slugify(input.title), taken),
    title: input.title,
    location: input.location,
    teaser: input.teaser,
    story: input.story,
    image: input.image,
    sold: input.sold,
    price: input.price,
    createdAt: Date.now(),
  };
  await writeManagedPhotos([photo, ...photos]);
  return photo;
}

export async function updatePhoto(
  id: string,
  patch: Partial<NewPhoto>
): Promise<Photo | undefined> {
  const photos = await readManagedPhotos();
  const idx = photos.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  photos[idx] = { ...photos[idx], ...patch };
  await writeManagedPhotos(photos);
  return photos[idx];
}

export async function deletePhoto(id: string): Promise<boolean> {
  const photos = await readManagedPhotos();
  const target = photos.find((p) => p.id === id);
  if (!target) return false;
  const remaining = photos.filter((p) => p.id !== id);
  await writeManagedPhotos(remaining);
  // best-effort cleanup of the image file
  if (target.image && target.image.includes("blob.vercel-storage.com")) {
    try {
      await del(target.image);
    } catch {
      /* ignore */
    }
  }
  return true;
}

function cryptoRandomId(): string {
  // Node's crypto is available in the Vercel Node runtime.
  return require("crypto").randomBytes(9).toString("hex");
}
