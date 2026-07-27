/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12181B",
        paper: "#F7F5F1",
        signal: "#1F6F5C",
        signalDark: "#154C40",
        rust: "#B24C2A",
        line: "#E4E0D8",
        muted: "#6B6459",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
