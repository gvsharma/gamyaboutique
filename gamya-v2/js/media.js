/**
 * Builds media URLs from CONFIG — S3, CloudFront, or custom base URL.
 */
const Media = {
  /**
   * @param {string} folderKey - key in CONFIG.folders
   * @param {string} filename
   * @returns {string}
   */
  url(folderKey, filename) {
    const folder = CONFIG.folders[folderKey];
    if (!folder || !filename) return "";
    const key = `${folder}${filename}`.replace(/\/+/g, "/");
    return this.urlFromKey(key);
  },

  /**
   * @param {string} objectKey - full S3 object key
   * @returns {string}
   */
  urlFromKey(objectKey) {
    const normalized = objectKey.replace(/^\/+/, "");
    const { bucketName, region, cloudFrontDomain, useCloudFront, baseUrl } =
      CONFIG;

    if (baseUrl) {
      return `${baseUrl.replace(/\/$/, "")}/${normalized}`;
    }
    if (useCloudFront && cloudFrontDomain) {
      const domain = cloudFrontDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return `https://${domain}/${normalized}`;
    }
    return `https://${bucketName}.s3.${region}.amazonaws.com/${normalized}`;
  },

  /**
   * @param {string} folderKey
   * @returns {string}
   */
  manifestUrl(folderKey) {
    const folder = CONFIG.folders[folderKey];
    if (!folder) return "";
    return this.urlFromKey(`${folder}${CONFIG.manifestFile}`);
  },

  /**
   * @param {string} localName - filename under assets/manifests/
   * @returns {string}
   */
  localManifestUrl(localName) {
    return `${CONFIG.localManifestBase}${localName}`;
  },
};
