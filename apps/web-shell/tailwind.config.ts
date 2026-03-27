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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "#f7f9fb",
        "surface-container-low": "#f2f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#eceef0",
        "surface-container-highest": "#e2e4e6",
        "on-surface": "#000000",
        "primary-indigo": "#4F46E5",
        "outline-variant": "rgba(199, 196, 216, 0.2)",
      },
      backgroundImage: {
        "indigo-gradient": "linear-gradient(to right, #4F46E5, #6366F1)",
        "sidebar-gradient": "linear-gradient(to bottom, #0F172A, #1E1B4B)",
      },
      fontFamily: {
        display: ["var(--font-dm-sans)", "sans-serif"],
        utility: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        ambient: "0 4px 24px rgba(79, 70, 229, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
