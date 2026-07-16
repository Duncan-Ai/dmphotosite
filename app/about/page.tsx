import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `About — ${site.name}`,
  description: "A little about Duncan and how this works.",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="wrap prose">
        <div className="eyebrow" style={{ color: "var(--gold)" }}>
          About
        </div>
        <h1>Hey, I&apos;m Duncan.</h1>
        <p>
          I&apos;m not a gallery guy and I&apos;m not going to talk your ear off
          about &ldquo;fine art.&rdquo; I just love getting up early, driving out
          to some quiet corner of Florida, and waiting for the light to do
          something. Marshes, the Gulf, herons and spoonbills, storms coming in
          off the water — that&apos;s what I point the camera at.
        </p>
        <p>
          Here&apos;s the part that makes this a little different: I only sell
          one print of each photo. One. When it&apos;s gone, it&apos;s gone — I
          don&apos;t print it again, I don&apos;t sell copies, and I don&apos;t
          run it as a poster. So whatever you hang on your wall is genuinely the
          only one out there.
        </p>
        <p>
          I do it that way because I like the idea that a photo ends up meaning
          something to one person and one home, instead of being everywhere. If
          that sounds good to you, take a look through the collection and send me
          a note about anything that catches your eye.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="btn" href="/#gallery">
            See the photos
          </a>
          <a className="btn ghost" href={site.facebook} target="_blank" rel="noreferrer">
            Follow on Facebook
          </a>
        </div>
      </div>
    </section>
  );
}
