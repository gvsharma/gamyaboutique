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
  {
    label: "Collections",
    href: ROUTES.shopCollections,
    children: [
      { label: "All collections", href: ROUTES.shopCollections },
      { label: "New arrivals", href: ROUTES.shopNewArrivals },
      { label: "Full shop", href: ROUTES.shop },
    ],
  },
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
    label: "Custom stitching",
    href: ROUTES.customStitching(),
    highlight: true,
    children: [
      { label: "Blouse stitching", href: ROUTES.customStitching("blouse") },
      { label: "Lehenga alterations", href: ROUTES.customStitching("lehenga-alterations") },
      { label: "Bridal customization", href: ROUTES.customStitching("bridal") },
      {
        label: "Book appointment",
        href: ROUTES.customStitching("appointment"),
        description: "Private fitting at our boutique",
      },
    ],
  },
  {
    label: "Our story",
    href: ROUTES.aboutStory,
    children: [
      { label: "About Gamya Couture", href: ROUTES.about },
      { label: "Contact", href: ROUTES.contact },
    ],
  },
];
