import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.subheadline,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.subheadline,
    type: "website",
  },
};

function Header() {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <a className="brand" href="/">
          <span className="name">{site.name}</span>
          <span className="tag">{site.tagline}</span>
        </a>
        <nav className="nav">
          <a href="/#gallery">Gallery</a>
          <a href="/about">About</a>
          <a href="/inquire">Inquire</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap inner">
        <span>
          © {new Date().getFullYear()} {site.name}. Every print one of a kind.
        </span>
        <span>
          <a href={site.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          {"  ·  "}
          <a href={`mailto:${site.contactEmail}`}>Email</a>
        </span>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
