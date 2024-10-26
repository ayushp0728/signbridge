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
      boxShadow: {
        '3xl': '0 10px 30px rgba(0, 0, 0, 0.5)', // Existing custom shadow
        '4xl': '0 15px 40px rgba(0, 0, 0, 0.6)', // New larger shadow
        '5xl': '0 20px 50px rgba(0, 0, 0, 0.7)', // Even larger shadow
      },
    },
  },
  plugins: [],
};
