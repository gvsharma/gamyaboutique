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
    label: "Women",
    href: ROUTES.category("women"),
    children: [
      { label: "Sarees", href: ROUTES.category("sarees") },
      { label: "Kurtas", href: ROUTES.category("kurtas") },
      { label: "Lehengas", href: ROUTES.category("lehengas") },
      { label: "Blouses", href: ROUTES.category("blouses") },
    ],
  },
  {
    label: "Girls",
    href: ROUTES.category("girls"),
    children: [
      { label: "Kurtas", href: ROUTES.category("girls-kurtas") },
      { label: "Lehengas", href: ROUTES.category("girls-lehengas") },
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
