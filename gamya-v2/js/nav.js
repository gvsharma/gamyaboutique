/**
 * Shared navigation and footer — injected into every page.
 */
const Nav = {
  pages: [
    { href: "index.html", label: "Home", id: "home" },
    { href: "women.html", label: "Women", id: "women" },
    { href: "girls.html", label: "Girls", id: "girls" },
    { href: "about.html", label: "About", id: "about" },
  ],

  init(activePage) {
    this.renderHeader(activePage);
    this.renderFooter();
    this.bindMobileNav();
  },

  renderHeader(activePage) {
    const header = document.getElementById("site-header");
    if (!header) return;

    const links = this.pages
      .map(
        (p) =>
          `<a href="${p.href}" class="nav-link${p.id === activePage ? " nav-link--active" : ""}">${p.label}</a>`
      )
      .join("");

    header.innerHTML = `
      <div class="container header__inner">
        <a href="index.html" class="logo">${Components.escapeHtml(SITE.name)}</a>
        <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
          <span></span><span></span><span></span>
        </button>
        <nav id="site-nav" class="site-nav" aria-label="Main">
          ${links}
          <a href="${whatsappHref()}" class="btn btn--small btn--primary nav-cta" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </nav>
      </div>
    `;
  },

  renderFooter() {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const year = new Date().getFullYear();
    const c = SITE.contact;

    footer.innerHTML = `
      <div class="container footer__grid">
        <div class="footer__brand">
          <p class="footer__logo">${Components.escapeHtml(SITE.name)}</p>
          <p class="footer__tagline">${Components.escapeHtml(SITE.tagline)}</p>
        </div>
        <div>
          <p class="footer__heading">Collections</p>
          <ul class="footer__links">
            <li><a href="women.html">Women</a></li>
            <li><a href="girls.html">Girls</a></li>
            <li><a href="about.html">Our story</a></li>
          </ul>
        </div>
        <div>
          <p class="footer__heading">Connect</p>
          <ul class="footer__links">
            <li><a href="${whatsappHref()}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="${c.instagramUrl}" target="_blank" rel="noopener noreferrer">${Components.escapeHtml(c.instagramHandle)}</a></li>
            <li><a href="${c.youtubeUrl}" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
        </div>
        <div>
          <p class="footer__heading">Visit us</p>
          <ul class="footer__links footer__contact">
            <li><a href="${c.mapsUrl}" target="_blank" rel="noopener noreferrer">${Components.escapeHtml(c.address)}</a></li>
            <li><a href="${c.phoneHref}">${Components.escapeHtml(c.phoneDisplay)}</a></li>
            <li>${Components.escapeHtml(c.businessHours)}</li>
          </ul>
        </div>
      </div>
      <div class="footer__bar">
        <div class="container footer__bar-inner">
          <p>© ${year} ${Components.escapeHtml(SITE.name)}. Crafted with care in Hyderabad.</p>
          <p>Version 2 · Static showcase</p>
        </div>
      </div>
    `;
  },

  bindMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("site-nav--open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("site-nav--open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  },
};
