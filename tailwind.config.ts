import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      keyframes: {
        "brand-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "brand-pulse": "brand-pulse 2s ease-in-out infinite",
      },
      colors: {
        surface: {
          base: "rgb(var(--surface-base) / <alpha-value>)",
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
          highlight: "rgb(var(--surface-highlight) / <alpha-value>)",
        },
        content: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--text-tertiary) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border-default) / <alpha-value>)",
          hover: "rgb(var(--border-hover) / <alpha-value>)",
        },
        accent: {
          primary: "rgb(var(--accent-primary) / <alpha-value>)",
          success: "rgb(var(--accent-success) / <alpha-value>)",
          warning: "rgb(var(--accent-warning) / <alpha-value>)",
          danger: "rgb(var(--accent-danger) / <alpha-value>)",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        pill: "var(--radius-pill)",
      },
    },
  },
  plugins: [],
};
export default config;
