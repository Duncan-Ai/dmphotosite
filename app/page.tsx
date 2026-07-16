import { getPhotos } from "@/lib/photos";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">{site.tagline}</div>
          <h1>{site.headline}</h1>
          <p className="sub">{site.subheadline}</p>
          <div className="cta-row">
            <a className="btn" href="#gallery">
              See the photos
            </a>
            <a className="btn ghost" href="/about">
              About Duncan
            </a>
          </div>
        </div>
      </section>

      <div className="promise">
        <div className="wrap inner">
          <span className="dot" />
          <span>{site.promise}</span>
        </div>
      </div>

      <section className="section" id="gallery">
        <div className="wrap">
          <div className="section-head">
            <h2>The Collection</h2>
            <p>Tap any photo to read the story behind it.</p>
          </div>

          <div className="gallery">
            {photos.map((photo) => (
              <a className="card" key={photo.slug} href={`/photo/${photo.slug}`}>
                <div className="frame">
                  <span className={`badge${photo.sold ? " sold" : ""}`}>
                    {photo.sold ? "Sold" : "One available"}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.image} alt={photo.title} loading="lazy" />
                </div>
                <div className="meta">
                  <h3>{photo.title}</h3>
                  <div className="loc">{photo.location}</div>
                  <p className="teaser">{photo.teaser}</p>
                  <div className="read">Read the story →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
