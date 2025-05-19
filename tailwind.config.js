/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#a81331",
          50: "#fef2f4",
          100: "#fde6e9",
          200: "#fbd0d8",
          300: "#f7aab8",
          400: "#f27792",
          500: "#e54a6a",
          600: "#d42d51",
          700: "#a81331",
          800: "#8f1029",
          900: "#7a1026",
          950: "#420813",
        },
        secondary: {
          DEFAULT: "#000000",
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#000000",
        },
      },
    },
  },
  plugins: [],
};
