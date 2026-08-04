/**
 * Static site metadata — contact, branding, social links.
 * Kept separate from CONFIG so bucket settings stay isolated.
 */
const SITE = {
  name: "Gamya Couture",
  tagline: "Where Style Meets Perfect Fit.",
  description:
    "Customized women's wear, designer blouses, kids wear, and personalized stitching in Hyderabad.",
  contact: {
    phone: "7995229463",
    phoneDisplay: "+91 79952 29463",
    phoneHref: "tel:+917995229463",
    address:
      "1st Main Rd, Green Homes Colony, Nadargul, Telangana 501510",
    mapsUrl: "https://maps.app.goo.gl/9Lci1QGzMYs5Ejvt5",
    mapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.8026818579783!2d78.5310495761666!3d17.276778583591735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcba3fbea237d59%3A0xa15b4e4ee5f459d3!2sGamya%20Couture!5e0!3m2!1sen!2sin!4v1781458485673!5m2!1sen!2sin",
    instagramUrl: "https://www.instagram.com/gamya_couture?utm_source=qr",
    instagramHandle: "@gamya_couture",
    youtubeUrl: "https://youtube.com/@gamya_couture",
    businessHours: "Mon – Sat: 10:00 AM – 7:00 PM",
    email: "gamyacouture9@gmail.com",
  },
  whatsappMessage:
    "Hello Gamya Couture! I'd like to enquire about your collections and custom stitching.",
};

function whatsappHref(message) {
  const text = message || SITE.whatsappMessage;
  return `https://wa.me/91${SITE.contact.phone}?text=${encodeURIComponent(text)}`;
}
