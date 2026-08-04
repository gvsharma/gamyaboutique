/** Home page bootstrap */
const HomePage = {
  async init() {
    Nav.init("home");

    const [hero, gallery, videos] = await Promise.all([
      ContentService.getHomeHero(),
      ContentService.getHomeGallery(),
      ContentService.getHomeVideos(),
    ]);

    Components.renderHero(document.getElementById("hero-root"), hero.items);
    Components.renderTrustBar(document.getElementById("trust-bar-root"));
    Components.renderGallery(document.getElementById("gallery-root"), gallery.items, {
      columns: 3,
    });
    Components.renderVideos(document.getElementById("videos-root"), videos.items);
  },
};

document.addEventListener("DOMContentLoaded", () => HomePage.init());
