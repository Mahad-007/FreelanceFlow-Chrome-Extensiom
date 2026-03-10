import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d8f1ff",
          200: "#b9e8ff",
          300: "#89dbff",
          400: "#51c5ff",
          500: "#29a5ff",
          600: "#1187f5",
          700: "#0a6fe1",
          800: "#0f59b6",
          900: "#134b8f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
