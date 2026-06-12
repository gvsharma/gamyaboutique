import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Legacy aliases — map to new tokens */
        cream: "#FAF7F2",
        ivory: "#F3EEE7",
        linen: "#EDE8E0",
        sand: "#D9D0C5",
        warm: "#F5F0E8",
        burgundy: {
          DEFAULT: "#7A3E48",
          dark: "#5C2E36",
          light: "#9A5560",
          muted: "#7A3E481A",
        },
        gold: {
          DEFAULT: "#C4A962",
          muted: "#B89B5E",
          soft: "#E8DFC8",
        },
        charcoal: "#1A1A1A",
        stone: "#6B6560",
        /* Premium palette */
        pearl: "#FFFCF9",
        champagne: "#E8DFD0",
        blush: "#E8D5D0",
        rose: {
          DEFAULT: "#C9A9A6",
          soft: "#F0E4E2",
        },
        maroon: {
          DEFAULT: "#7A3E48",
          hover: "#6A3540",
        },
        success: "#4A7C59",
        warning: "#B8956A",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(2.75rem,5.5vw,5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "section-title": ["clamp(1.875rem,3.2vw,3rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        "product-title": ["1.0625rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        caption: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.14em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 24px rgba(26, 26, 26, 0.04)",
        card: "0 4px 32px rgba(26, 26, 26, 0.06)",
        elevated: "0 20px 56px rgba(26, 26, 26, 0.1)",
        glow: "0 0 0 1px rgba(122, 62, 72, 0.08)",
        "image-hover": "0 12px 40px rgba(26, 26, 26, 0.12)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        premium: "400ms",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "slow-zoom": "slowZoom 12s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" },
        },
        slowZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
