/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/**/*.ejs", "./public/**/*.html", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        darkBg: "#121212",
        darkCard: "#1e1e1e",
        darkText: "#e0e0e0",
      },
    },
  },
  plugins: [],
};

