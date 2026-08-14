#!/usr/bin/env bash
#
# Upload Gamya V2 media from a local folder to S3.
#
# Default local folder: ~/Downloads/gamya-v2
# Default S3 bucket:   gamya-content (see js/config.js)
#
# Usage:
#   ./scripts/upload-content.sh                  # upload from ~/Downloads/gamya-v2
#   ./scripts/upload-content.sh --generate       # regenerate manifest.json files first
#   LOCAL_DIR=./content ./scripts/upload-content.sh
#   DRY_RUN=1 ./scripts/upload-content.sh        # preview only
#
set -euo pipefail

BUCKET="${BUCKET:-gamya-content}"
REGION="${REGION:-ap-south-1}"
LOCAL_DIR="${LOCAL_DIR:-$HOME/Downloads/gamya-v2}"
DRY_RUN="${DRY_RUN:-0}"
GENERATE_MANIFESTS=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
V2_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Content folders — must match js/config.js
CONTENT_FOLDERS=(
  "home/hero"
  "home/gallery"
  "home/videos"
  "women/images"
  "women/videos"
  "girls/images"
  "girls/videos"
  "about/images"
  "about/videos"
)

usage() {
  sed -n '2,12p' "$0"
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage 0 ;;
    -g|--generate) GENERATE_MANIFESTS=1; shift ;;
    *) echo "Unknown option: $1" >&2; usage 1 ;;
  esac
done

if ! command -v aws >/dev/null 2>&1; then
  echo "Error: AWS CLI not found. Install: https://aws.amazon.com/cli/" >&2
  exit 1
fi

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Error: Local folder not found: $LOCAL_DIR" >&2
  echo "Create it or set LOCAL_DIR, e.g.:" >&2
  echo "  mkdir -p \"$LOCAL_DIR/home/hero\"" >&2
  echo "  LOCAL_DIR=\"$V2_ROOT/content\" $0" >&2
  exit 1
fi

is_image() {
  case "${1,,}" in
    *.jpg|*.jpeg|*.png|*.webp|*.gif|*.avif) return 0 ;;
    *) return 1 ;;
  esac
}

is_video() {
  case "${1,,}" in
    *.mp4|*.webm|*.mov|*.m4v) return 0 ;;
    *) return 1 ;;
  esac
}

human_title() {
  local base="${1%.*}"
  base="${base//-/ }"
  base="${base//_/ }"
  echo "$base" | awk '{ for (i=1; i<=NF; i++) $i=toupper(substr($i,1,1)) substr($i,2); print }'
}

# silk-saree-red_4500.jpg -> name: silk-saree-red, price: 4500
parse_name_price() {
  local basename_no_ext="${1%.*}"
  if [[ "$basename_no_ext" =~ ^(.+)_([0-9]+)$ ]]; then
    PARSED_NAME="${BASH_REMATCH[1]}"
    PARSED_PRICE="${BASH_REMATCH[2]}"
  else
    PARSED_NAME="$basename_no_ext"
    PARSED_PRICE=""
  fi
}

title_from_name_part() {
  local part="${1//-/ }"
  part="${part//_/ }"
  echo "$part" | awk '{ for (i=1; i<=NF; i++) $i=toupper(substr($i,1,1)) substr($i,2); print }'
}

generate_manifest() {
  local folder_path="$1"
  local folder_key="$2"
  local manifest="$folder_path/manifest.json"
  local items=()
  local shopt_was_on=0

  shopt -s nullglob nocaseglob 2>/dev/null || true

  if [[ "$folder_key" == *"/videos" ]]; then
    for f in "$folder_path"/*; do
      [[ -f "$f" ]] || continue
      local name
      name="$(basename "$f")"
      [[ "$name" == "manifest.json" ]] && continue
      is_video "$name" || continue

      local title poster=""
      title="$(human_title "$name")"
      if [[ -f "$folder_path/${name%.*}-poster.jpg" ]]; then
        poster="${name%.*}-poster.jpg"
      elif [[ -f "$folder_path/${name%.*}_poster.jpg" ]]; then
        poster="${name%.*}_poster.jpg"
      fi

      if [[ -n "$poster" ]]; then
        items+=("    {\"file\": \"$name\", \"poster\": \"$poster\", \"title\": \"$title\"}")
      else
        items+=("    {\"file\": \"$name\", \"title\": \"$title\"}")
      fi
    done
  else
    for f in "$folder_path"/*; do
      [[ -f "$f" ]] || continue
      local name
      name="$(basename "$f")"
      [[ "$name" == "manifest.json" ]] && continue
      is_image "$name" || continue

      local title alt price=""
      parse_name_price "$name"
      title="$(title_from_name_part "$PARSED_NAME")"
      price="$PARSED_PRICE"
      alt="$title — Gamya Couture"
      if [[ -n "$price" ]]; then
        items+=("    {\"file\": \"$name\", \"title\": \"$title\", \"price\": \"$price\", \"alt\": \"$alt\"}")
      else
        items+=("    {\"file\": \"$name\", \"title\": \"$title\", \"alt\": \"$alt\"}")
      fi
    done
  fi

  if [[ ${#items[@]} -eq 0 ]]; then
    echo "  skip manifest (no media): $folder_key"
    return 0
  fi

  {
    echo "{"
    echo "  \"items\": ["
    local i
    for i in "${!items[@]}"; do
      if [[ "$i" -lt $((${#items[@]} - 1)) ]]; then
        echo "${items[$i]},"
      else
        echo "${items[$i]}"
      fi
    done
    echo "  ]"
    echo "}"
  } > "$manifest"

  echo "  wrote manifest: $folder_key/manifest.json (${#items[@]} items)"
}

aws_s3_sync() {
  local src="$1"
  local dest="$2"
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [dry-run] aws s3 sync \"$src\" \"$dest\" --region $REGION"
    aws s3 sync "$src" "$dest" --region "$REGION" --dryrun
  else
    aws s3 sync "$src" "$dest" --region "$REGION" \
      --exclude ".DS_Store" \
      --exclude "*/.DS_Store"
  fi
}

echo "Gamya V2 content upload"
echo "  Local:  $LOCAL_DIR"
echo "  Bucket: s3://$BUCKET ($REGION)"
echo ""

if [[ "$GENERATE_MANIFESTS" == "1" ]]; then
  echo "Generating manifest.json files..."
  for folder in "${CONTENT_FOLDERS[@]}"; do
    if [[ -d "$LOCAL_DIR/$folder" ]]; then
      generate_manifest "$LOCAL_DIR/$folder" "$folder"
    fi
  done
  echo ""
fi

echo "Uploading folders..."
for folder in "${CONTENT_FOLDERS[@]}"; do
  if [[ ! -d "$LOCAL_DIR/$folder" ]]; then
    echo "  skip (missing): $folder"
    continue
  fi
  file_count="$(find "$LOCAL_DIR/$folder" -maxdepth 1 -type f ! -name '.DS_Store' | wc -l | tr -d ' ')"
  if [[ "$file_count" == "0" ]]; then
    echo "  skip (empty): $folder"
    continue
  fi
  echo "  sync: $folder ($file_count files)"
  aws_s3_sync "$LOCAL_DIR/$folder/" "s3://$BUCKET/$folder/"
done

echo ""
echo "Done."
echo ""
echo "Verify (browser or curl):"
echo "  https://$BUCKET.s3.$REGION.amazonaws.com/home/hero/manifest.json"
echo ""
echo "Site: https://gamya-v2.vercel.app (hard-refresh after upload)"
