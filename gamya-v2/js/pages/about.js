/** About page bootstrap */
const AboutPage = {
  async init() {
    Nav.init("about");

    const [images, videos] = await Promise.all([
      ContentService.getAboutImages(),
      ContentService.getAboutVideos(),
    ]);

    this.renderStorySections(images.items);
    Components.renderValues(document.getElementById("values-root"));
    Components.renderVideos(document.getElementById("videos-root"), videos.items);
    this.renderVisitSection();
  },

  renderStorySections(images) {
    const beginning = images[0] || null;
    const craft = images[1] || null;
    const boutique = images[2] || beginning;

    Components.renderStoryBlock(document.getElementById("story-beginning"), {
      eyebrow: "Our beginning",
      title: "Rooted in Hyderabad, grown with love",
      image: beginning,
      body: `
        <p>What started as a modest stitching studio in Green Homes Colony has blossomed into a boutique cherished by women across Hyderabad. We opened our doors with one promise: solve the everyday struggle of finding ethnic wear that truly fits.</p>
        <p>Word spread through weddings, housewarmings, and school festivals — mothers who found their perfect blouse here returned with their daughters for frocks and lehenga sets. That trust became the heart of ${Components.escapeHtml(SITE.name)}.</p>
      `,
    });

    Components.renderStoryBlock(document.getElementById("story-craft"), {
      eyebrow: "Craft & fit",
      title: "Where every stitch has a purpose",
      image: craft,
      reverse: true,
      body: `
        <p>Sarees, lehengas, designer blouses, and girls' festive wear — each piece in our boutique is chosen for drape, comfort, and lasting elegance.</p>
        <p>Our in-house tailoring team handles custom stitching and alterations with the same attention a couture house would offer: precise measurements, thoughtful finishing, and fittings until the silhouette feels unmistakably yours.</p>
      `,
    });

    Components.renderStoryBlock(document.getElementById("story-boutique"), {
      eyebrow: "The boutique today",
      title: "A wardrobe for every celebration",
      image: boutique,
      body: `
        <p>Walk into ${Components.escapeHtml(SITE.name)} and you will find curated racks of silk sarees, bridal and party lehengas, everyday cotton drapes, and a vibrant girls' collection.</p>
        <p>We take special pride in bridal and festive ensembles — pieces that photograph beautifully, move gracefully, and become part of your family's story for years to come.</p>
      `,
    });
  },

  renderVisitSection() {
    const root = document.getElementById("visit-root");
    if (!root) return;

    const c = SITE.contact;
    root.innerHTML = `
      <div class="visit-grid">
        <div class="visit-text animate-fade-up">
          <p class="eyebrow eyebrow--accent">Visit us</p>
          <h2>Step into ${Components.escapeHtml(SITE.name)}</h2>
          <p class="prose">We welcome you to our boutique in Nadargul, Hyderabad — for browsing, fittings, and bespoke consultations.</p>
          <address class="visit-address">
            <p><strong>${Components.escapeHtml(SITE.name)}</strong></p>
            <p><a href="${c.mapsUrl}" target="_blank" rel="noopener noreferrer">${Components.escapeHtml(c.address)}</a></p>
            <p>${Components.escapeHtml(c.businessHours)}</p>
            <p><a href="${c.phoneHref}">${Components.escapeHtml(c.phoneDisplay)}</a></p>
          </address>
          <a href="${whatsappHref()}" class="btn btn--primary" target="_blank" rel="noopener noreferrer">Book a visit on WhatsApp</a>
        </div>
        <div class="visit-map">
          <iframe
            title="${Components.escapeHtml(SITE.name)} on Google Maps"
            src="${c.mapsEmbedUrl}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    `;
  },
};

document.addEventListener("DOMContentLoaded", () => AboutPage.init());
