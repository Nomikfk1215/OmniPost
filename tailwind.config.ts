import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#ffffff",
          warm: "#faf9f7",
          cool: "#f5f4f2",
          muted: "#f0eeea",
        },
        ink: {
          DEFAULT: "#171717",
          soft: "#3d3833",
          muted: "#6b6560",
          faint: "#a39d97",
        },
        coral: {
          DEFAULT: "#ff5c3c",
          bright: "#ff7b5c",
          dark: "#e0452a",
          pale: "#ffeee8",
          glow: "rgba(255, 92, 60, 0.12)",
        },
        // Platform accent colors
        wechat: {
          DEFAULT: "#07c160",
          light: "#e6f9ef",
        },
        zhihu: {
          DEFAULT: "#0066ff",
          light: "#e6f0ff",
        },
        xiaohongshu: {
          DEFAULT: "#ff2442",
          light: "#ffe8eb",
        },
        bilibili: {
          DEFAULT: "#00a1d6",
          light: "#e6f6fb",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(23, 23, 23, 0.06)",
        card: "0 1px 3px rgba(23, 23, 23, 0.04), 0 4px 16px rgba(23, 23, 23, 0.04)",
        elevated:
          "0 1px 2px rgba(23, 23, 23, 0.04), 0 8px 24px rgba(23, 23, 23, 0.06)",
        "card-hover":
          "0 2px 4px rgba(23, 23, 23, 0.04), 0 12px 32px rgba(23, 23, 23, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.7s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundSize: {
        "shimmer-200": "200% 100%",
      },
    },
  },
  plugins: [],
};

export default config;
