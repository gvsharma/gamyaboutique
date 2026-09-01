/** Women collection page bootstrap */
const WomenPage = {
  items: [],
  activeCategory: "all",

  async init() {
    Nav.init("women");

    const [images, videos] = await Promise.all([
      ContentService.getWomenImages(),
      ContentService.getWomenVideos(),
    ]);

    this.items = images.items || [];
    this.activeCategory = this._categoryFromLocation();
    this.renderGallery();
    Components.renderVideos(document.getElementById("videos-root"), videos.items);

    window.addEventListener("hashchange", () => {
      this.activeCategory = this._categoryFromLocation();
      this.renderGallery();
    });
  },

  renderGallery() {
    Components.renderCategorizedGallery(
      document.getElementById("gallery-filters"),
      document.getElementById("gallery-root"),
      this.items,
      {
        columns: 3,
        activeCategory: this.activeCategory,
        onFilter: (category) => this.setCategory(category),
      }
    );
  },

  setCategory(category) {
    this.activeCategory = category || "all";
    const slug = category === "all" ? "" : Components.slugify(category);
    const nextHash = slug ? `#${slug}` : "";
    if (location.hash !== nextHash) {
      history.replaceState(null, "", `${location.pathname}${location.search}${nextHash}`);
    }
    this.renderGallery();
  },

  _categoryFromLocation() {
    const params = new URLSearchParams(location.search);
    const requested = (params.get("category") || location.hash.replace(/^#/, "") || "")
      .trim()
      .toLowerCase();
    if (!requested || requested === "all") return "all";

    const aliases = {
      blouses: "Designer blouses",
      "designer-blouses": "Designer blouses",
      blouse: "Designer blouses",
      sarees: "Silk sarees",
      "silk-sarees": "Silk sarees",
      saree: "Silk sarees",
      "party-wear": "Party wear",
      party: "Party wear",
      gowns: "Party wear",
    };
    if (aliases[requested]) return aliases[requested];

    const match = this.items.find(
      (item) => Components.slugify(item.category) === Components.slugify(requested)
    );
    return match ? match.category : "all";
  },
};

document.addEventListener("DOMContentLoaded", () => WomenPage.init());
