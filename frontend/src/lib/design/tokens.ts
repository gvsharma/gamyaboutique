/**
 * Gamya Couture design tokens — single source for programmatic use.
 * Tailwind classes remain the primary styling surface.
 */
export const tokens = {
  colors: {
    pearl: "#FFFCF9",
    cream: "#FAF8F5",
    ivory: "#F3EEE7",
    champagne: "#E8DFD0",
    blush: "#E8D5D0",
    maroon: "#7A3E48",
    gold: "#C4A962",
    charcoal: "#1C1C1C",
    stone: "#6E6862",
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96] as const,
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  motion: {
    duration: "400ms",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;
