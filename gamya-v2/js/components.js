/**
 * Reusable UI render helpers — pure DOM, no framework dependency.
 */
const Components = {
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  },

  /**
   * @param {HTMLElement} container
   * @param {Array} items
   * @param {{ variant?: 'hero'|'gallery'|'editorial' }} [options]
   */
  renderHero(container, items, options = {}) {
    const item = items[0];
    if (!item) {
      container.innerHTML = this._placeholderHero();
      return;
    }

    const alt = this.escapeHtml(item.alt || SITE.name);
    const title = this.escapeHtml(item.title || "Couture woven for every celebration");
    const subtitle = this.escapeHtml(item.subtitle || SITE.tagline);
    const eyebrow = this.escapeHtml(item.eyebrow || "New season · Women & girls");

    container.innerHTML = `
      <section class="hero">
        <div class="hero__content editorial-panel">
          <div class="hero__inner animate-fade-up">
            <p class="eyebrow">${eyebrow}</p>
            <h1 class="hero__title">${title}</h1>
            <p class="hero__subtitle">${subtitle}</p>
            <div class="hero__actions">
              <a href="women.html" class="btn btn--primary">Shop women</a>
              <a href="${whatsappHref()}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">WhatsApp enquiry</a>
            </div>
          </div>
        </div>
        <div class="hero__media">
          <img src="${item.src}" alt="${alt}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='images/placeholder.svg'" />
        </div>
      </section>
    `;
  },

  _placeholderHero() {
    return `
      <section class="hero">
        <div class="hero__content editorial-panel">
          <div class="hero__inner animate-fade-up">
            <p class="eyebrow">New season · Women & girls</p>
            <h1 class="hero__title">Couture woven for every celebration</h1>
            <p class="hero__subtitle">${this.escapeHtml(SITE.tagline)}</p>
            <div class="hero__actions">
              <a href="women.html" class="btn btn--primary">Shop women</a>
              <a href="${whatsappHref()}" class="btn btn--outline" target="_blank" rel="noopener noreferrer">WhatsApp enquiry</a>
            </div>
          </div>
        </div>
        <div class="hero__media hero__media--placeholder">
          <img src="images/placeholder.svg" alt="${this.escapeHtml(SITE.name)}" />
        </div>
      </section>
    `;
  },

  slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  },

  galleryCard(item) {
    const category = item.category
      ? `<p class="gallery-card__category">${this.escapeHtml(item.category)}</p>`
      : "";
    const title = item.title
      ? `<p class="gallery-card__title">${this.escapeHtml(item.title)}</p>`
      : "";
    const caption =
      category || title
        ? `<figcaption class="gallery-card__caption">${category}${title}</figcaption>`
        : "";

    return `
      <figure class="gallery-card animate-fade-up">
        <div class="gallery-card__media">
          <img src="${item.src}" alt="${this.escapeHtml(item.alt || item.title || "")}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='images/placeholder.svg'" />
        </div>
        ${caption}
      </figure>
    `;
  },

  /**
   * @param {HTMLElement} container
   * @param {Array} items
   * @param {{ columns?: number, aspect?: string }} [options]
   */
  renderGallery(container, items, options = {}) {
    const columns = options.columns || 3;

    if (!items.length) {
      container.innerHTML = `<p class="empty-state">Gallery content will appear here once uploaded.</p>`;
      container.classList.add("gallery-grid", `gallery-grid--${columns}`);
      return;
    }

    container.classList.add("gallery-grid", `gallery-grid--${columns}`);
    container.innerHTML = items.map((item) => this.galleryCard(item)).join("");
  },

  /**
   * Grouped lookbook with category filter chips (Women page).
   *
   * @param {HTMLElement} filterRoot
   * @param {HTMLElement} galleryRoot
   * @param {Array} items
   * @param {{ activeCategory?: string, columns?: number, onFilter?: function, categoryOrder?: string[] }} [options]
   */
  renderCategorizedGallery(filterRoot, galleryRoot, items, options = {}) {
    const columns = options.columns || 3;
    const categoryOrder = options.categoryOrder || [
      "Designer blouses",
      "Silk sarees",
      "Party wear",
    ];
    const grouped = this._groupByCategory(items, categoryOrder);
    const categories = grouped.map((group) => group.category);
    const requested = options.activeCategory || "all";
    const active =
      requested === "all" || categories.includes(requested) ? requested : "all";

    if (filterRoot) {
      const chips = [
        { id: "all", label: "All" },
        ...categories.map((category) => ({ id: category, label: category })),
      ];
      filterRoot.innerHTML = chips
        .map(
          (chip) => `
          <button type="button" class="gallery-filter${chip.id === active ? " is-active" : ""}" data-category="${this.escapeHtml(chip.id)}" aria-pressed="${chip.id === active}">
            ${this.escapeHtml(chip.label)}
          </button>
        `
        )
        .join("");

      filterRoot.querySelectorAll("[data-category]").forEach((button) => {
        button.addEventListener("click", () => {
          if (typeof options.onFilter === "function") {
            options.onFilter(button.getAttribute("data-category"));
          }
        });
      });
    }

    const visible =
      active === "all" ? grouped : grouped.filter((group) => group.category === active);

    if (!items.length) {
      galleryRoot.innerHTML = `<p class="empty-state">Gallery content will appear here once uploaded.</p>`;
      return;
    }

    galleryRoot.innerHTML = visible
      .map(
        (group) => `
        <section class="gallery-group" data-category="${this.escapeHtml(group.category)}">
          <div class="gallery-group__header">
            <h3 class="gallery-group__title">${this.escapeHtml(group.category)}</h3>
          </div>
          <div class="gallery-grid gallery-grid--${columns}">
            ${group.items.map((item) => this.galleryCard(item)).join("")}
          </div>
        </section>
      `
      )
      .join("");
  },

  _groupByCategory(items, categoryOrder) {
    const buckets = new Map();
    items.forEach((item) => {
      const category = item.category || "Lookbook";
      if (!buckets.has(category)) buckets.set(category, []);
      buckets.get(category).push(item);
    });

    const ordered = [];
    categoryOrder.forEach((category) => {
      if (buckets.has(category)) {
        ordered.push({ category, items: buckets.get(category) });
        buckets.delete(category);
      }
    });
    buckets.forEach((groupItems, category) => {
      ordered.push({ category, items: groupItems });
    });
    return ordered;
  },

  /**
   * @param {HTMLElement} container
   * @param {Array} items
   */
  renderVideos(container, items) {
    if (!items.length) {
      container.innerHTML = `<p class="empty-state">Videos will appear here once uploaded to S3.</p>`;
      return;
    }

    container.classList.add("video-grid");
    container.innerHTML = items
      .map(
        (item) => `
        <article class="video-card animate-fade-up">
          <video controls playsinline preload="metadata"${item.poster ? ` poster="${item.poster}"` : ""}>
            <source src="${item.src}" type="video/mp4" />
            Your browser does not support video playback.
          </video>
          ${
            item.title
              ? `<h3 class="video-card__title">${this.escapeHtml(item.title)}</h3>`
              : ""
          }
        </article>
      `
      )
      .join("");
  },

  /**
   * @param {HTMLElement} container
   * @param {{ eyebrow: string, title: string, body: string, image?: object, reverse?: boolean }} block
   */
  renderStoryBlock(container, block) {
    const reverseClass = block.reverse ? " story-block--reverse" : "";
    const imageHtml = block.image
      ? `<div class="story-block__media"><img src="${block.image.src}" alt="${this.escapeHtml(block.image.alt || "")}" loading="lazy" /></div>`
      : "";

    container.innerHTML = `
      <div class="story-block${reverseClass}">
        ${imageHtml}
        <div class="story-block__text animate-fade-up">
          <p class="eyebrow eyebrow--accent">${this.escapeHtml(block.eyebrow)}</p>
          <h2>${this.escapeHtml(block.title)}</h2>
          <div class="prose">${block.body}</div>
        </div>
      </div>
    `;
  },

  renderTrustBar(container) {
    const items = [
      "Custom stitching & alterations",
      "Bridal & festive wear",
      "Women & girls collections",
      "Hyderabad boutique since day one",
    ];

    container.innerHTML = `
      <div class="trust-bar">
        <div class="container trust-bar__inner">
          ${items.map((text) => `<span class="trust-bar__item">${this.escapeHtml(text)}</span>`).join("")}
        </div>
      </div>
    `;
  },

  renderValues(container) {
    const values = [
      {
        title: "Perfect fit",
        body: "Every blouse, lehenga, and girls' ensemble is measured, draped, and finished to sit beautifully on you.",
      },
      {
        title: "Heritage craft",
        body: "We honour handloom silks, zari borders, and time-tested tailoring techniques passed down through generations.",
      },
      {
        title: "Celebration ready",
        body: "From wedding mornings to festival evenings, our collections are curated for life's finest chapters.",
      },
      {
        title: "Made for families",
        body: "Mom-and-daughter sets, birthday frocks, and bridal trousseaus — dressing women and little girls with equal care.",
      },
    ];

    container.innerHTML = `
      <div class="values-grid">
        ${values
          .map(
            (v) => `
          <article class="value-card animate-fade-up">
            <h3>${this.escapeHtml(v.title)}</h3>
            <p>${this.escapeHtml(v.body)}</p>
          </article>
        `
          )
          .join("")}
      </div>
    `;
  },
};
