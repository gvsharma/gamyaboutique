/**
 * Content service — abstracts where page content comes from.
 *
 * V2: manifest.json files on S3 (or local fallbacks)
 * V4+: swap implementation to fetch from Spring Boot REST APIs
 */
const ContentService = {
  _cache: new Map(),

  /**
   * @param {string} folderKey - CONFIG.folders key
   * @param {string} [localFallback] - manifest filename under assets/manifests/
   * @returns {Promise<{ items: Array }>}
   */
  async loadFolder(folderKey, localFallback) {
    const cacheKey = `${folderKey}:${localFallback || ""}`;
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    const promise = this._fetchManifest(folderKey, localFallback);
    this._cache.set(cacheKey, promise);
    return promise;
  },

  async _fetchManifest(folderKey, localFallback) {
    const remoteUrl = Media.manifestUrl(folderKey);

    try {
      const response = await fetch(remoteUrl, { cache: "default" });
      if (response.ok) {
        return this._normalize(await response.json(), folderKey);
      }
    } catch (_) {
      /* fall through to local fallback */
    }

    if (CONFIG.useLocalFallback && localFallback) {
      try {
        const localUrl = Media.localManifestUrl(localFallback);
        const response = await fetch(localUrl);
        if (response.ok) {
          return this._normalize(await response.json(), folderKey);
        }
      } catch (_) {
        /* fall through to empty */
      }
    }

    return { items: [] };
  },

  /**
   * Parse `product-name_4500.jpg` → { title, price }.
   * Last underscore + digits before extension = price (INR).
   * @param {string} filename
   * @returns {{ title: string, price: string|null }}
   */
  parseNamePrice(filename) {
    if (!filename) return { title: "", price: null };

    const base = filename.replace(/\.[^.]+$/, "");
    const match = base.match(/^(.+)_(\d+)$/);

    const humanize = (text) =>
      text
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

    if (match) {
      return { title: humanize(match[1]), price: match[2] };
    }

    return { title: humanize(base), price: null };
  },

  /**
   * @param {object} data
   * @param {string} folderKey
   * @returns {{ items: Array }}
   */
  _normalize(data, folderKey) {
    const items = (data.items || data.images || data.videos || []).map(
      (item) => {
        const parsed = this.parseNamePrice(item.file || "");
        return {
          ...item,
          title: item.title || parsed.title,
          price: item.price != null && item.price !== "" ? item.price : parsed.price,
          alt:
            item.alt ||
            (parsed.title
              ? `${parsed.title} — Gamya Couture`
              : "Gamya Couture"),
          src: item.src || Media.url(folderKey, item.file),
          poster: item.poster
            ? Media.url(folderKey, item.poster)
            : item.posterUrl || "",
        };
      }
    );
    return { items };
  },

  /* Page-level helpers — future API endpoints can mirror these signatures */

  getHomeHero() {
    return this.loadFolder("homeHero", "home-hero.json");
  },

  getHomeGallery() {
    return this.loadFolder("homeGallery", "home-gallery.json");
  },

  getHomeVideos() {
    return this.loadFolder("homeVideos", "home-videos.json");
  },

  getWomenImages() {
    return this.loadFolder("womenImages", "women-images.json");
  },

  getWomenVideos() {
    return this.loadFolder("womenVideos", "women-videos.json");
  },

  getGirlsImages() {
    return this.loadFolder("girlsImages", "girls-images.json");
  },

  getGirlsVideos() {
    return this.loadFolder("girlsVideos", "girls-videos.json");
  },

  getAboutImages() {
    return this.loadFolder("aboutImages", "about-images.json");
  },

  getAboutVideos() {
    return this.loadFolder("aboutVideos", "about-videos.json");
  },
};
