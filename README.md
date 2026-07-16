# Duncan Metts — Florida Nature Photography

A simple, light photography portfolio. Every photo is sold as a single
one-of-a-kind print, each with its own story page, and buyers reach out through
an inquiry form.

Built with Next.js. No database, no fuss — your photos and words live in two
plain files.

---

## The two files you'll actually edit

Everything you'd want to change is in the `data` folder:

| File | What's in it |
| --- | --- |
| `data/photos.ts` | Every photo: its title, location, the story, and whether it's sold. |
| `data/site.ts` | Your name, the big headline, the sub-headline, and your contact email. |

You do **not** need to touch anything else to run the site day to day.

### Adding a real photo

1. Drop your image into the `public/images` folder (e.g. `heron.jpg`).
2. Open `data/photos.ts` and copy one of the existing blocks.
3. Change the `title`, `location`, `teaser`, and `story`.
4. Set `image` to `"/images/heron.jpg"`.
5. Save. That's it — the gallery, the story page, and the inquiry link all
   update automatically.

> The photos on the site right now are placeholder illustrations so you can see
> how everything looks. Swap in your real shots whenever you're ready.

### Marking a photo as sold

In `data/photos.ts`, change that photo's `sold: false` to `sold: true`.
It stays on the site with a "Sold" badge, and the buy button turns off.

### Setting a price

Add `price: 450` to a photo (any number). Leave it out and the page just says
"Inquire for price."

---

## Getting the inquiry emails

The form works out of the box — visitors always see a "thanks" message, and
every submission is written to your Vercel logs. To get an actual **email**
each time someone inquires:

1. Make a free account at [resend.com](https://resend.com).
2. Create an API key.
3. In Vercel: **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` — your key (starts with `re_`)
   - `INQUIRY_TO_EMAIL` — where you want inquiries sent
4. Redeploy. Done.

See `.env.example` for the full list.

---

## Running it on your own computer (optional)

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To copy your email settings locally, `cp .env.example .env.local` and fill it in.
