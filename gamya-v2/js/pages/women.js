/** Women collection page bootstrap */
const WomenPage = {
  async init() {
    Nav.init("women");

    const [images, videos] = await Promise.all([
      ContentService.getWomenImages(),
      ContentService.getWomenVideos(),
    ]);

    Components.renderGallery(document.getElementById("gallery-root"), images.items, {
      columns: 3,
    });
    Components.renderVideos(document.getElementById("videos-root"), videos.items);
  },
};

document.addEventListener("DOMContentLoaded", () => WomenPage.init());
