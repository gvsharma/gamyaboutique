# Gamya Couture — Version 2 (Static Website)

Self-contained static website for Gamya Couture. Deploy by uploading the contents of this folder to an S3 bucket configured for static website hosting.

**No dependency on the legacy website or any other folder in this repository.**

## Version roadmap

| Version | Description |
|---------|-------------|
| V1 | Legacy website (unchanged) |
| **V2** | **This static S3 website** |
| V3 | Admin portal uploads images/videos to S3 |
| V4 | Spring Boot REST APIs |
| V5 | Shopping cart |
| V6 | Payments |
| V7 | Customer login |

## Structure

```
gamya-v2/
├── index.html          Home page
├── women.html          Women's collection
├── girls.html          Girls' collection
├── about.html          About & visit us
├── css/                Stylesheets
├── js/
│   ├── config.js       ← S3 / CDN configuration (edit this only)
│   ├── site.js         Brand & contact constants
│   ├── media.js        URL builder for S3 / CloudFront
│   ├── content-service.js  Content abstraction (S3 now, APIs later)
│   ├── components.js   Reusable render helpers
│   ├── nav.js          Header & footer
│   └── pages/          Page-specific bootstraps
├── images/             Local placeholders
├── assets/manifests/   Local manifest fallbacks for dev
└── README.md
```

## Configuration

Edit **`js/config.js`** to point the entire site at a different bucket or CDN:

```javascript
const CONFIG = {
  bucketName: "gamya-content",
  region: "ap-south-1",
  cloudFrontDomain: "",
  useCloudFront: false,
  baseUrl: "",
  folders: { /* ... */ }
};
```

| Setting | Purpose |
|---------|---------|
| `bucketName` + `region` | Direct S3 URLs |
| `useCloudFront` + `cloudFrontDomain` | Serve media via CloudFront |
| `baseUrl` | Override with any custom CDN base URL |
| `folders` | S3 prefix for each content section |

Changing `config.js` redirects all media across every page — no other code changes required.

## S3 content layout

Upload media and a `manifest.json` to each folder:

```
s3://gamya-content/
├── home/hero/manifest.json
├── home/hero/hero.jpg
├── home/gallery/manifest.json
├── home/gallery/look-01.jpg
├── women/images/manifest.json
├── women/images/women-01.jpg
└── ...
```

### Manifest format

```json
{
  "items": [
    {
      "file": "hero.jpg",
      "title": "Optional caption",
      "alt": "Accessibility text",
      "eyebrow": "Optional hero eyebrow",
      "subtitle": "Optional hero subtitle"
    }
  ]
}
```

For videos, include `poster` for the thumbnail:

```json
{
  "items": [
    {
      "file": "promo.mp4",
      "poster": "promo-poster.jpg",
      "title": "New season preview"
    }
  ]
}
```

See `assets/manifests/` for complete examples used as local fallbacks during development.

## Local development

Serve this folder with any static file server:

```bash
cd gamya-v2
python3 -m http.server 8080
# open http://localhost:8080
```

When S3 is unreachable, the site falls back to local manifests in `assets/manifests/` (controlled by `CONFIG.useLocalFallback`). Image files referenced in manifests will 404 until uploaded to S3 — the hero shows a local placeholder SVG when no hero image loads.

## Deployment — Vercel (recommended for V2)

Use a **separate Vercel project** from the legacy Next.js app (`frontend/`). Do not reuse the existing `gamyaboutique.vercel.app` project unless you intend to replace it.

### One-time setup (Vercel Dashboard)

1. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo.
2. **Project name:** e.g. `gamya-v2` or `gamya-couture-v2`
3. **Framework Preset:** Other
4. **Root Directory:** `gamya-v2` ← important
5. **Build Command:** leave empty (static site, no build)
6. **Output Directory:** leave empty
7. **Production Branch:** `feature/gamya-v2` (while V2 is isolated from `main`)
8. Deploy

Each push to `feature/gamya-v2` will produce a preview URL. Promote to production when ready.

### CLI deploy (alternative)

```bash
cd gamya-v2
npx vercel link          # create/link a new project (not the frontend one)
npx vercel               # preview deployment
npx vercel --prod        # production deployment
```

When linking, choose **Create new project** — do not link to the existing Next.js frontend project.

### Clean URLs on Vercel

With `vercel.json`, these work:

| URL | Page |
|-----|------|
| `/` | Home |
| `/women` | Women |
| `/girls` | Girls |
| `/about` | About |

`.html` URLs still work too (`/women.html`).

### S3 CORS (required when site is on Vercel)

The site runs on `*.vercel.app` but fetches manifests/images from S3. Add CORS to your **content bucket** (`gamya-content`):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "https://your-v2-project.vercel.app",
      "https://your-custom-domain.com"
    ],
    "ExposeHeaders": []
  }
]
```

Without CORS, the browser blocks manifest fetches and the site falls back to local placeholders.

If the content bucket is private, serve media through CloudFront and set in `js/config.js`:

```javascript
useCloudFront: true,
cloudFrontDomain: "dxxxx.cloudfront.net",
```

### Test after Vercel deploy

1. Open the Vercel preview/production URL.
2. DevTools → **Network** → confirm `index.html`, `css/*`, `js/*` return 200.
3. Check manifest requests to S3/CloudFront (should be 200, not CORS errors).
4. Click through Home → Women → Girls → About.
5. Test WhatsApp button and About page map.

## Deployment — S3 (alternative)

Upload the **contents** of `gamya-v2/` to a static website S3 bucket:

```bash
aws s3 sync gamya-v2/ s3://your-production-bucket/ --delete
```

Enable static website hosting on the bucket and set `index.html` as the index document.

For CloudFront in front of the bucket, set in `config.js`:

```javascript
useCloudFront: true,
cloudFrontDomain: "d1234abcd.cloudfront.net",
```

## Architecture for future APIs

`ContentService` (`js/content-service.js`) is the single integration point for page content. Page scripts call methods like `getHomeHero()` and `getWomenImages()` — they do not build URLs directly.

To migrate to REST APIs (V4), replace the internals of `ContentService` to `fetch('/api/v1/home/hero')` while keeping the same method signatures. Page scripts and HTML remain unchanged.

## Pages

| Page | Content sources |
|------|-----------------|
| `index.html` | `homeHero`, `homeGallery`, `homeVideos` |
| `women.html` | `womenImages`, `womenVideos` |
| `girls.html` | `girlsImages`, `girlsVideos` |
| `about.html` | `aboutImages`, `aboutVideos` + static story copy |
