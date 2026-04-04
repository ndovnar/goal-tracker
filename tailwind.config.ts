import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f3ed",
        ink: "#172026",
        moss: {
          50: "#eef6ef",
          100: "#d9eadb",
          200: "#b6d8bc",
          300: "#90c09c",
          400: "#69a67b",
          500: "#4f8c62",
          600: "#3b6d4b",
          700: "#2f573c",
          800: "#274731",
          900: "#213c2a",
        },
        sand: {
          50: "#fdf8ee",
          100: "#f9eed5",
          200: "#f0daad",
          300: "#e6c17c",
          400: "#dda55c",
          500: "#d48a3f",
          600: "#bd6d31",
          700: "#9d542a",
          800: "#804427",
          900: "#6a3a24",
        },
        slate: {
          50: "#f3f7fa",
          100: "#e5edf2",
          200: "#ccdbe6",
          300: "#aac1d2",
          400: "#7f9eb8",
          500: "#5f7f9d",
          600: "#4a657f",
          700: "#3c5167",
          800: "#344457",
          900: "#2f3b49",
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Fraunces"', '"Times New Roman"', "serif"],
      },
      boxShadow: {
        card: "0 18px 40px rgba(20, 33, 28, 0.08)",
        soft: "0 10px 24px rgba(23, 32, 38, 0.12)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(217, 234, 219, 0.8), transparent 45%), radial-gradient(circle at right top, rgba(240, 218, 173, 0.55), transparent 42%)",
      },
    },
  },
  plugins: [],
};

export default config;
