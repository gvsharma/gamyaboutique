/**
 * Gamya Couture V2 — central configuration.
 * Change this file to point the entire site at a different S3 bucket or CDN.
 */
const CONFIG = {
  bucketName: "gamya-content",
  region: "ap-south-1",
  cloudFrontDomain: "",
  useCloudFront: false,
  baseUrl: "",
  folders: {
    homeHero: "home/hero/",
    homeGallery: "home/gallery/",
    homeVideos: "home/videos/",
    womenImages: "women/images/",
    womenVideos: "women/videos/",
    girlsImages: "girls/images/",
    girlsVideos: "girls/videos/",
    aboutImages: "about/images/",
    aboutVideos: "about/videos/",
  },
  /** Manifest filename placed inside each content folder on S3 */
  manifestFile: "manifest.json",
  /** Local fallback manifests when S3 is unreachable (dev / preview) */
  useLocalFallback: true,
  localManifestBase: "assets/manifests/",
};
