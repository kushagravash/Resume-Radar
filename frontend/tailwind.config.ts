import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A6B3A", // Professional Green
          hover: "#14522c",
          light: "#E8F0EB",
        },
        background: "#F4F6F8",
        surface: "#FFFFFF",
        text: {
          primary: "#1A1A2E",
          secondary: "#4A5568",
        },
        border: "#E2E8F0",
        danger: "#E53E3E",
        success: "#38A169"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
