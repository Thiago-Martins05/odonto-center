/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "dm-serif": ["DM Serif Display", "serif"],
        "plus-jakarta": ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        primary: "#0E7490", // cyan-700
        "hero-bg": "#0B1220", // very dark blue-gray
        "light-bg": "#F8FAFC", // light background
        "text-primary": "#0F172A", // slate-900
        "text-secondary": "#334155", // slate-600
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
