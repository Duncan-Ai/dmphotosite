import type { Metadata } from "next";
import { getPhotoBySlug } from "@/lib/photos";
import { site } from "@/data/site";
import InquiryForm from "./InquiryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Inquire — ${site.name}`,
  description: "Ask about buying a one-of-a-kind print.",
};

export default async function InquirePage({
  searchParams,
}: {
  searchParams: { photo?: string };
}) {
  const slug = searchParams.photo || "";
  const photo = slug ? await getPhotoBySlug(slug) : undefined;

  return (
    <section className="form-page">
      <div className="wrap">
        <div className="form-shell">
          <div className="form-intro">
            <h1>
              {photo ? "Ask about this print" : "Ask about a print"}
            </h1>
            <p>
              {photo
                ? "You found one you like. Send me a note and I'll get back to you with the details."
                : "See something you want on your wall? Send me a note and let's talk. Each photo is a single print — first one to claim it gets it."}
            </p>

            {photo && (
              <div className="form-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.image} alt={photo.title} />
                <div>
                  <div className="t">{photo.title}</div>
                  <div className="l">{photo.location}</div>
                </div>
              </div>
            )}
          </div>

          <InquiryForm
            photoSlug={photo ? photo.slug : ""}
            photoTitle={photo ? photo.title : ""}
          />
        </div>
      </div>
    </section>
  );
}
