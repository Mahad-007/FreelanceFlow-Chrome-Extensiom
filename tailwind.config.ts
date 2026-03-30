import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edfdf7",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#2dd4a8",
          500: "#1ab394",
          600: "#1187f5",
          700: "#0a6fe1",
          800: "#0f59b6",
          900: "#134b8f",
        },
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        "surface-dim": "var(--bg-surface-dim)",
        elevated: "var(--bg-elevated)",
        inset: "var(--bg-inset)",
        "brand-subtle": "var(--bg-brand-subtle)",
        "status-success": "var(--bg-success)",
        "status-warning": "var(--bg-warning)",
        "status-error": "var(--bg-error)",
      },
      textColor: {
        skin: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
          accent: "var(--brand-accent)",
          soft: "var(--brand-soft)",
          success: "var(--text-success)",
          warning: "var(--text-warning)",
          error: "var(--text-error)",
        },
      },
      borderColor: {
        skin: {
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          subtle: "var(--border-subtle)",
          brand: "var(--border-brand)",
          success: "var(--border-success)",
          warning: "var(--border-warning)",
          error: "var(--border-error)",
        },
      },
      boxShadow: {
        neo: "var(--shadow-neo)",
        btn: "var(--shadow-btn)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      letterSpacing: {
        "tight-sm": "-0.01em",
        "wide-sm": "0.02em",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
