/**
 * Gamya Couture design tokens — single source for programmatic use.
 * Tailwind classes remain the primary styling surface.
 * Palette inspired by luxury fashion eCommerce (soft neutrals, warm creams).
 */
export const tokens = {
  colors: {
    pearl: "#FFFCF9",
    cream: "#FAF7F2",
    ivory: "#F3EEE7",
    linen: "#EDE8E0",
    sand: "#D9D0C5",
    champagne: "#E8DFD0",
    blush: "#E8D5D0",
    maroon: "#7A3E48",
    gold: "#C4A962",
    charcoal: "#1A1A1A",
    stone: "#6B6560",
    warm: "#F5F0E8",
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96] as const,
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    pill: "9999px",
  },
  motion: {
    duration: "400ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;
