export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap prose" style={{ textAlign: "center", padding: "60px 0" }}>
        <h1>Can&apos;t find that one.</h1>
        <p>The photo or page you&apos;re after isn&apos;t here.</p>
        <a className="btn" href="/#gallery">
          Back to the collection
        </a>
      </div>
    </section>
  );
}
