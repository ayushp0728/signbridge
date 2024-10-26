/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "pastel-light-purple": "#E6E6FA", // Background
        "pastel-light-blue": "#A6C8FF", // Header and Create button
        "pastel-light-pink": "#FFD1DC", // Create Room Section
        "pastel-light-yellow": "#FFF9C4", // Join Room Section
        "pastel-light-green": "#C8E6C9", // Join button
      },
    },
  },
  plugins: [],
};
