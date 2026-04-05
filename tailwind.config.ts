import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f3f4ee",
        ink: "#202123",
        moss: {
          50: "#edf7f3",
          100: "#d9efe6",
          200: "#b8decf",
          300: "#8fc6b2",
          400: "#61a78e",
          500: "#3f8a72",
          600: "#2f6d59",
          700: "#255549",
          800: "#1f453d",
          900: "#1b3933",
        },
        sand: {
          50: "#fbf7ef",
          100: "#f2e9d8",
          200: "#e7d4b6",
          300: "#d8bb8e",
          400: "#c79f6b",
          500: "#b18048",
          600: "#93663a",
          700: "#735132",
          800: "#60442d",
          900: "#523a29",
        },
        slate: {
          50: "#f5f6f7",
          100: "#e8eaed",
          200: "#d7dbe0",
          300: "#bcc3cb",
          400: "#98a0ab",
          500: "#757f8c",
          600: "#5e6774",
          700: "#4c545f",
          800: "#3b414a",
          900: "#2d3138",
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Inter"', '"Segoe UI"', "sans-serif"],
        display: ['"Avenir Next"', '"Inter"', '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 80px rgba(32, 33, 35, 0.08)",
        soft: "0 10px 28px rgba(32, 33, 35, 0.10)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top center, rgba(63, 138, 114, 0.18), transparent 30%), radial-gradient(circle at left top, rgba(255, 255, 255, 0.95), transparent 32%), radial-gradient(circle at right top, rgba(232, 234, 237, 0.78), transparent 36%)",
      },
    },
  },
  plugins: [],
};

export default config;
