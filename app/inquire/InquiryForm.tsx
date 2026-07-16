"use client";

import { useState } from "react";

type Props = {
  photoSlug: string;
  photoTitle: string;
};

export default function InquiryForm({ photoSlug, photoTitle }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("err");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="card-form">
        <div className="alert ok">
          <strong>Thanks — got it.</strong>
          <br />
          Your message is on its way to Duncan. He&apos;ll get back to you by
          email, usually within a day or two.
        </div>
        <a className="btn ghost" href="/#gallery">
          Back to the collection
        </a>
      </div>
    );
  }

  return (
    <form className="card-form" onSubmit={onSubmit}>
      {status === "err" && (
        <div className="alert err">{errorMsg}</div>
      )}

      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="field">
        <label htmlFor="photo">Which photo?</label>
        <input
          id="photo"
          name="photo"
          type="text"
          defaultValue={photoTitle}
          readOnly={Boolean(photoSlug)}
        />
      </div>

      <div className="field">
        <label htmlFor="message">Your message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Tell Duncan a little about what you're after — where it'd hang, any questions, etc."
          required
        />
      </div>

      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>
      <p className="form-note">
        No obligation — this just starts a conversation.
      </p>
    </form>
  );
}
