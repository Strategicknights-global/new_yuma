// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       // Default Tailwind colors will be used, no custom palette defined
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yuma-red': {
          500: '#ef4444', // Matches red-500, customizable
          600: '#dc2626', // Matches red-600, used in buttons
        },
        'yuma-gray': {
          50: '#f9fafb', // Matches gray-50, background
          800: '#1f2937', // Matches gray-800, footer
        },
        'yuma-yellow': '#f59e0b', // Matches yellow-500, cart button
        'yuma-green': '#10b981', // Matches green-500, stock indicator
      },
      screens: {
        'xl': '1280px', // Default Tailwind XL
        '2xl': '1536px', // Add custom extra-large breakpoint
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Enhances form styling
  ],
  safelist: [
    'bg-yellow-500',
    'bg-green-500',
    'animate-marquee', // Ensure animation class isn’t purged
  ],
}