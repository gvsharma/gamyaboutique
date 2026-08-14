# Local content staging folder

Put photos and videos here (or in `~/Downloads/gamya-v2` with the same layout), then run the upload script.

## S3 bucket

| Setting | Value |
|---------|-------|
| **Bucket** | `gamya-content` |
| **Region** | `ap-south-1` |
| **Configured in** | `js/config.js` |

This is separate from:
- **Vercel** — serves the HTML/CSS/JS site (`gamya-v2.vercel.app`)
- **`gamya-couture-dev-media`** — legacy product media bucket (CloudFront). Do not use unless you change `config.js`.

## Folder layout

Mirror this structure locally:

```
gamya-v2/content/          ← or ~/Downloads/gamya-v2/
├── home/
│   ├── hero/
│   │   ├── hero.jpg
│   │   └── manifest.json      ← auto-generated with --generate
│   ├── gallery/
│   │   ├── look-01.jpg
│   │   ├── look-02.jpg
│   │   └── manifest.json
│   └── videos/
│       ├── promo-01.mp4
│       ├── promo-01-poster.jpg   ← optional thumbnail
│       └── manifest.json
├── women/
│   ├── images/
│   └── videos/
├── girls/
│   ├── images/
│   └── videos/
└── about/
    ├── images/
    └── videos/
```

## Upload

From the repo:

```bash
# 1. Put files in ~/Downloads/gamya-v2/ (or gamya-v2/content/)

# 2. Generate manifests + upload
chmod +x gamya-v2/scripts/upload-content.sh
gamya-v2/scripts/upload-content.sh --generate

# Or upload from this folder:
LOCAL_DIR=gamya-v2/content gamya-v2/scripts/upload-content.sh --generate

# Preview without uploading:
DRY_RUN=1 gamya-v2/scripts/upload-content.sh --generate
```

Requires AWS CLI configured (`aws configure`) with permission to write to the bucket.

## File naming — name & price on gallery images

For **gallery and collection** folders (`home/gallery`, `women/images`, `girls/images`), name files:

```
product-name_PRICE.ext
```

| Filename | Display name | Display price |
|----------|--------------|---------------|
| `silk-saree-red_4500.jpg` | Silk Saree Red | ₹4,500 |
| `designer-blouse_2800.jpg` | Designer Blouse | ₹2,800 |
| `girls-lehenga-set_3500.jpg` | Girls Lehenga Set | ₹3,500 |

**Rules:**
- Hyphens separate words in the name part
- Price is **digits only** after the **last** underscore (INR, no commas in filename)
- No spaces in filenames

**Exceptions (no price):**
- `home/hero/hero.jpg` — single hero image
- `about/images/` — story photos (order matters, not pricing)

The upload script and website both parse `name_price` automatically.

## One-time bucket setup (if bucket does not exist)

```bash
aws s3 mb s3://gamya-content --region ap-south-1

# Public read for manifests + images (simplest for V2)
aws s3api put-public-access-block \
  --bucket gamya-content \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# CORS — required for gamya-v2.vercel.app to fetch manifests
aws s3api put-bucket-cors --bucket gamya-content --cors-configuration '{
  "CORSRules": [{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://gamya-v2.vercel.app", "http://localhost:*"],
    "ExposeHeaders": []
  }]
}'
```

After upload, open https://gamya-v2.vercel.app and hard-refresh.
