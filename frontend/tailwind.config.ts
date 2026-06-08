import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        ivory: "#F3EDE4",
        burgundy: {
          DEFAULT: "#6B2D3C",
          dark: "#4A1F2A",
          light: "#8B3D4F",
        },
        gold: {
          DEFAULT: "#C9A962",
          muted: "#B8956A",
        },
        charcoal: "#2C2C2C",
        stone: "#6B6560",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(44, 44, 44, 0.08)",
        elevated: "0 12px 40px rgba(44, 44, 44, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
