import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: {
          bg: "#121214",
          text: "#F1F2F4",
          card: "#18181C",
          border: "#26262C",
          muted: "#8E929B",
        },
        bento: {
          bg: "#121214",
          card: "#18181C",
          border: "#26262C",
          hover: "#1E1E24",
          accent: "#F43F5E",
        },
      },
      fontFamily: {
        sans: [
          '"Segoe UI"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"Segoe UI"',
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        bento: "0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "bento-glow": "0 0 25px -5px rgba(16, 185, 129, 0.15)",
      },
      gridTemplateRows: {
        "7": "repeat(7, minmax(0, 1fr))",
        "8": "repeat(8, minmax(0, 1fr))",
        "10": "repeat(10, minmax(0, 1fr))",
        "12": "repeat(12, minmax(0, 1fr))",
      },
      gridRow: {
        "span-7": "span 7 / span 7",
        "span-8": "span 8 / span 8",
        "span-9": "span 9 / span 9",
        "span-10": "span 10 / span 10",
        "span-11": "span 11 / span 11",
        "span-12": "span 12 / span 12",
      },
    },
  },
  plugins: [],
};
export default config;
