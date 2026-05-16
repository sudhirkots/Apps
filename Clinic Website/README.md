# Brainwaves Neurology Clinic Website

Static website for Dr. Sudhir Kothari and Brainwaves Neurology Clinic, ready for Cloudflare Pages.

## Edit Content

Most content is in `content/site-data.js`.

- Clinic phone, email, address and hours are in `site`.
- Home page copy is in `home`.
- About page copy is in `about`.
- Doctor profile, education and publications are in `doctor`.
- Treatments are in `treatments`.
- Blog posts are in `blogs`.
- Enquiry form choices are in `enquiry`.

After editing, refresh the browser. No build step is required.

## Preview Locally

```powershell
npm run dev
```

This runs:

```powershell
wrangler pages dev .
```

## Deploy to Cloudflare Pages

First login once:

```powershell
npm exec wrangler login
```

Then deploy:

```powershell
npm run deploy
```

This runs:

```powershell
wrangler pages deploy . --project-name drsudhir-kothari
```

Cloudflare will give a `*.pages.dev` URL after deployment. After that, connect `www.drsudhirkothari.com` in the Cloudflare Pages dashboard under Custom domains.

## Next Content Pass

Suggested next edits:

- Replace any placeholder treatment details with final clinic-approved text.
- Add more blog posts in `blogs`.
- Confirm the exact appointment link and phone numbers.
- Add testimonials only if you have patient consent.
