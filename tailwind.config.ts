import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#111318",
        ink: "#ececf1",
        moss: {
          50: "#17221e",
          100: "#1d2d27",
          200: "#254035",
          300: "#2d5647",
          400: "#36715d",
          500: "#3f8a72",
          600: "#5f9e88",
          700: "#86bba7",
          800: "#add8c8",
          900: "#d9efe6",
        },
        sand: {
          50: "#211b15",
          100: "#2e241d",
          200: "#423128",
          300: "#5a4133",
          400: "#785541",
          500: "#9a6d4b",
          600: "#bc8a61",
          700: "#d8ae86",
          800: "#eacaa8",
          900: "#f3e4d1",
        },
        slate: {
          50: "#181a1f",
          100: "#1e2128",
          200: "#2a2e36",
          300: "#3a404a",
          400: "#545c68",
          500: "#7c8491",
          600: "#a0a8b4",
          700: "#c2c8d0",
          800: "#dde2e8",
          900: "#f4f7fb",
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Inter"', '"Segoe UI"', "sans-serif"],
        display: ['"Avenir Next"', '"Inter"', '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 80px rgba(0, 0, 0, 0.38)",
        soft: "0 12px 32px rgba(0, 0, 0, 0.32)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top center, rgba(63, 138, 114, 0.22), transparent 28%), radial-gradient(circle at left top, rgba(54, 113, 93, 0.18), transparent 26%), radial-gradient(circle at right top, rgba(84, 92, 104, 0.20), transparent 32%)",
      },
    },
  },
  plugins: [],
};

export default config;
