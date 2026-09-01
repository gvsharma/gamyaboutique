/**
 * Content service — abstracts where page content comes from.
 *
 * V2: manifest.json files on S3, merged with local editorial manifests
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
    const remote = await this._tryJson(Media.manifestUrl(folderKey));
    const local =
      CONFIG.useLocalFallback && localFallback
        ? await this._tryJson(Media.localManifestUrl(localFallback))
        : null;

    if (remote && local) {
      return this._normalize(this._mergeManifests(remote, local), folderKey);
    }
    if (remote) return this._normalize(remote, folderKey);
    if (local) return this._normalize(local, folderKey);
    return { items: [] };
  },

  async _tryJson(url) {
    if (!url) return null;
    try {
      const response = await fetch(url, { cache: "default" });
      if (response.ok) return await response.json();
    } catch (_) {
      /* network / CORS — caller falls through */
    }
    return null;
  },

  /**
   * Local manifests are the editorial catalog (titles, categories, new photos).
   * Remote-only files that are not listed locally still appear at the end.
   */
  _mergeManifests(remote, local) {
    const remoteItems = this._rawItems(remote);
    const localItems = this._rawItems(local);
    const remoteByFile = new Map(
      remoteItems.filter((item) => item.file).map((item) => [item.file, item])
    );
    const seen = new Set();
    const items = [];

    localItems.forEach((localItem) => {
      const remoteItem = localItem.file ? remoteByFile.get(localItem.file) : null;
      if (localItem.file) seen.add(localItem.file);
      items.push({
        ...(remoteItem || {}),
        ...localItem,
        src: this._isSiteSrc(localItem.src)
          ? localItem.src
          : (remoteItem && remoteItem.src) || undefined,
      });
    });

    remoteItems.forEach((remoteItem) => {
      if (remoteItem.file && !seen.has(remoteItem.file)) {
        items.push(remoteItem);
      }
    });

    return { items };
  },

  _rawItems(data) {
    if (!data) return [];
    return data.items || data.images || data.videos || [];
  },

  _isSiteSrc(src) {
    if (!src || typeof src !== "string") return false;
    if (src === "images/placeholder.svg") return false;
    return (
      /^(images|assets)\//.test(src) ||
      src.startsWith("./") ||
      src.startsWith("/") ||
      /^https?:\/\//i.test(src)
    );
  },

  _resolveSrc(item, folderKey) {
    if (this._isSiteSrc(item.src)) return item.src;
    if (item.src && item.src !== "images/placeholder.svg") {
      return Media.urlFromKey(item.src);
    }
    return Media.url(folderKey, item.file);
  },

  _resolvePoster(item, folderKey) {
    if (!item.poster && !item.posterUrl) return "";
    if (this._isSiteSrc(item.poster)) return item.poster;
    if (item.posterUrl && this._isSiteSrc(item.posterUrl)) return item.posterUrl;
    if (item.poster) return Media.url(folderKey, item.poster);
    return item.posterUrl || "";
  },

  /**
   * @param {object} data
   * @param {string} folderKey
   * @returns {{ items: Array }}
   */
  _normalize(data, folderKey) {
    const items = this._rawItems(data).map((item) => ({
      ...item,
      src: this._resolveSrc(item, folderKey),
      poster: this._resolvePoster(item, folderKey),
    }));
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
