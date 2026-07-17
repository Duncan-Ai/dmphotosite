"use client";

import { useEffect, useState, useCallback } from "react";
import type { Photo } from "@/data/photos";

// Shrink a photo in the browser to a web-friendly JPEG before uploading.
// Keeps big camera files from ever needing to travel full-size.
async function resizeToJpeg(file: File, maxSide = 2200): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.86)
  );
  if (!blob) throw new Error("Couldn't process the image.");
  return blob;
}

type Status = "checking" | "locked" | "ready";

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notice, setNotice] = useState("");

  const loadPhotos = useCallback(async () => {
    const res = await fetch("/api/admin/photos", { cache: "no-store" });
    if (res.status === 401) {
      setStatus("locked");
      return;
    }
    const data = await res.json();
    setPhotos(data.photos || []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  if (status === "checking") {
    return (
      <div className="admin-wrap">
        <p className="admin-muted">Loading…</p>
      </div>
    );
  }

  if (status === "locked") {
    return <Login onDone={loadPhotos} />;
  }

  return (
    <div className="admin-wrap">
      <div className="admin-head">
        <div>
          <h1>Your photos</h1>
          <p className="admin-muted">
            Add a photo, tell its story, and it goes live on your site.
          </p>
        </div>
        <button
          className="btn ghost"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setStatus("locked");
          }}
        >
          Log out
        </button>
      </div>

      {notice && <div className="alert ok">{notice}</div>}

      <AddPhoto
        onAdded={(msg) => {
          setNotice(msg);
          loadPhotos();
        }}
        onError={(msg) => setNotice("")}
      />

      <h2 className="admin-h2">
        On your site now{" "}
        <span className="admin-count">{photos.length}</span>
      </h2>
      {photos.length === 0 ? (
        <p className="admin-muted">
          Nothing yet. Add your first photo above — it&apos;ll show up here and on
          your homepage right away.
        </p>
      ) : (
        <div className="admin-list">
          {photos.map((p) => (
            <PhotoRow key={p.id} photo={p} onChanged={loadPhotos} />
          ))}
        </div>
      )}
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      onDone();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "That didn't work.");
    }
  }

  return (
    <div className="admin-wrap admin-login">
      <h1>Photo manager</h1>
      <p className="admin-muted">Enter your password to manage your photos.</p>
      <form className="card-form" onSubmit={submit}>
        {error && <div className="alert err">{error}</div>}
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

const EMPTY = {
  title: "",
  location: "",
  teaser: "",
  story: "",
  price: "",
  sold: false,
};

function AddPhoto({
  onAdded,
  onError,
}: {
  onAdded: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [form, setForm] = useState({ ...EMPTY });
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState("");

  function pick(f: File | null) {
    setFile(f);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Pick a photo first.");
      return;
    }
    if (!form.title.trim()) {
      setError("Give it a title.");
      return;
    }
    try {
      setPhase("uploading");
      const resized = await resizeToJpeg(file);

      setPhase("saving");
      const body = new FormData();
      body.append("image", resized, "photo.jpg");
      body.append("title", form.title);
      body.append("location", form.location);
      body.append("teaser", form.teaser);
      body.append("story", form.story);
      body.append("price", form.price);
      body.append("sold", String(form.sold));

      const res = await fetch("/api/admin/photos", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Couldn't save the photo.");
      }
      // reset
      pick(null);
      setForm({ ...EMPTY });
      setPhase("idle");
      onAdded(`"${form.title.trim()}" is live on your site. 🎉`);
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      onError("");
    }
  }

  const busy = phase !== "idle";

  return (
    <form className="card-form add-photo" onSubmit={submit}>
      <h2 className="admin-h2 tight">Add a photo</h2>
      {error && <div className="alert err">{error}</div>}

      <div className="add-grid">
        <div>
          <label className="drop">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" />
            ) : (
              <span className="drop-hint">
                Click to choose a photo
                <small>JPG or PNG — big camera files are fine</small>
              </span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => pick(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="add-fields">
          <div className="field">
            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="The Old Heron"
            />
          </div>
          <div className="field">
            <label>Where in Florida</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Wakodahatchee Wetlands, Delray Beach"
            />
          </div>
          <div className="field">
            <label>One-line teaser (shows on the gallery)</label>
            <input
              value={form.teaser}
              onChange={(e) => setForm({ ...form, teaser: e.target.value })}
              placeholder="Same bird, same corner, every morning."
            />
          </div>
          <div className="field">
            <label>The story (this is the good part)</label>
            <textarea
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
              placeholder="Write it like you're telling a buddy. Hit Enter twice to start a new paragraph."
            />
          </div>
          <div className="add-row">
            <div className="field price-field">
              <label>Price (optional)</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Leave blank for 'Inquire'"
                inputMode="numeric"
              />
            </div>
            <label className="sold-toggle">
              <input
                type="checkbox"
                checked={form.sold}
                onChange={(e) => setForm({ ...form, sold: e.target.checked })}
              />
              Already sold
            </label>
          </div>
        </div>
      </div>

      <button className="btn" type="submit" disabled={busy}>
        {phase === "uploading"
          ? "Uploading photo…"
          : phase === "saving"
          ? "Publishing…"
          : "Publish to my site"}
      </button>
    </form>
  );
}

function PhotoRow({
  photo,
  onChanged,
}: {
  photo: Photo;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggleSold() {
    setBusy(true);
    await fetch("/api/admin/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, sold: !photo.sold }),
    });
    setBusy(false);
    onChanged();
  }

  async function remove() {
    if (!confirm(`Delete "${photo.title}"? This can't be undone.`)) return;
    setBusy(true);
    await fetch("/api/admin/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id }),
    });
    setBusy(false);
    onChanged();
  }

  return (
    <div className="admin-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.image} alt={photo.title} />
      <div className="admin-row-body">
        <div className="admin-row-title">
          {photo.title}
          {photo.sold && <span className="tag-sold">Sold</span>}
        </div>
        <div className="admin-muted small">{photo.location}</div>
        <a
          className="admin-link"
          href={`/photo/${photo.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          View on site ↗
        </a>
      </div>
      <div className="admin-row-actions">
        <button className="btn ghost small" onClick={toggleSold} disabled={busy}>
          {photo.sold ? "Mark available" : "Mark sold"}
        </button>
        <button className="btn danger small" onClick={remove} disabled={busy}>
          Delete
        </button>
      </div>
    </div>
  );
}
