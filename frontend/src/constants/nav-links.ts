import { ROUTES } from "@/constants/routes";

export type NavChild = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
  badge?: "new";
  highlight?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: ROUTES.home },
  {
    label: "Sarees",
    href: ROUTES.category("sarees"),
    children: [
      { label: "Silk Sarees", href: ROUTES.category("silk-sarees") },
      { label: "Cotton Sarees", href: ROUTES.category("cotton-sarees") },
      { label: "Party Wear Sarees", href: ROUTES.category("party-wear-sarees") },
      { label: "Wedding Sarees", href: ROUTES.category("wedding-sarees") },
      { label: "Daily Wear Sarees", href: ROUTES.category("daily-wear-sarees") },
    ],
  },
  {
    label: "Lehengas",
    href: ROUTES.category("lehengas"),
    children: [
      { label: "Bridal Lehengas", href: ROUTES.category("bridal-lehengas") },
      { label: "Party Wear", href: ROUTES.category("party-wear-lehengas") },
      { label: "Festive Collection", href: ROUTES.category("festive-lehengas") },
      { label: "Girls Lehengas", href: ROUTES.category("girls-lehengas") },
    ],
  },
  {
    label: "Girls Collection",
    href: ROUTES.category("girls-collection"),
    children: [
      { label: "Frocks", href: ROUTES.category("frocks") },
      { label: "Girls Lehenga Sets", href: ROUTES.category("girls-lehenga-sets") },
      { label: "Festival Wear", href: ROUTES.category("girls-festival-wear") },
      { label: "Birthday Specials", href: ROUTES.category("birthday-specials") },
      { label: "Mom & Daughter Matching Sets", href: ROUTES.category("mom-daughter-sets") },
    ],
  },
  {
    label: "New Arrivals",
    href: ROUTES.shopNewArrivals,
    badge: "new",
  },
  {
    label: "Custom Stitching",
    href: ROUTES.customStitching(),
    highlight: true,
    children: [
      { label: "Blouse Stitching", href: ROUTES.customStitching("blouse") },
      { label: "Lehenga Alterations", href: ROUTES.customStitching("lehenga-alterations") },
      { label: "Bridal Customization", href: ROUTES.customStitching("bridal") },
      {
        label: "Book Appointment",
        href: ROUTES.customStitching("appointment"),
        description: "Schedule a fitting at our boutique",
      },
    ],
  },
  {
    label: "About Us",
    href: ROUTES.about,
    children: [
      { label: "About Gamya Couture", href: ROUTES.about },
      { label: "Our Story", href: ROUTES.aboutStory },
    ],
  },
  { label: "Contact", href: ROUTES.contact },
];
