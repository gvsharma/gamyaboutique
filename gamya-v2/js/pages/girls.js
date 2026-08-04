/** Girls collection page bootstrap */
const GirlsPage = {
  async init() {
    Nav.init("girls");

    const [images, videos] = await Promise.all([
      ContentService.getGirlsImages(),
      ContentService.getGirlsVideos(),
    ]);

    Components.renderGallery(document.getElementById("gallery-root"), images.items, {
      columns: 3,
    });
    Components.renderVideos(document.getElementById("videos-root"), videos.items);
  },
};

document.addEventListener("DOMContentLoaded", () => GirlsPage.init());
