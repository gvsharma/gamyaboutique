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

## Deployment

Upload the **contents** of `gamya-v2/` to your production S3 bucket:

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
