import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPhotoBySlug } from "@/lib/photos";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const photo = await getPhotoBySlug(params.slug);
  if (!photo) return { title: "Photo not found" };
  return {
    title: `${photo.title} — ${photo.location}`,
    description: photo.teaser,
  };
}

export default async function PhotoPage({
  params,
}: {
  params: { slug: string };
}) {
  const photo = await getPhotoBySlug(params.slug);
  if (!photo) notFound();

  const priceLabel =
    typeof photo.price === "number"
      ? `$${photo.price.toLocaleString()}`
      : "Inquire for price";

  return (
    <section className="detail">
      <div className="wrap">
        <a className="back" href="/#gallery">
          ← Back to the collection
        </a>

        <div className="detail-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.image} alt={photo.title} />
        </div>

        <div className="detail-grid">
          <div className="detail-story">
            <div className="loc">{photo.location}</div>
            <h1>{photo.title}</h1>
            {photo.story.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <aside className={`buy-card${photo.sold ? " sold-card" : ""}`}>
            <div className="status">
              <span className="dot" />
              {photo.sold ? "Sold — one of a kind" : "Available — 1 of 1"}
            </div>
            <div className="price">{photo.sold ? "Sold" : priceLabel}</div>
            <p className="fine">
              {photo.sold
                ? "This one found its home. It won't be printed again."
                : "A single physical print. When it sells, it's gone for good."}
            </p>

            {photo.sold ? (
              <a className="btn ghost" href="/#gallery">
                See what's still available
              </a>
            ) : (
              <a
                className="btn"
                href={`/inquire?photo=${encodeURIComponent(photo.slug)}`}
              >
                Inquire about this print
              </a>
            )}

            <ul>
              <li>The only print I&apos;ll ever sell of this photo</li>
              <li>Shot here in Florida by Duncan</li>
              <li>No prints, no copies, no reruns</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
