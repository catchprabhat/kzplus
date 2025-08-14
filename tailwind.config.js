/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // Extra small devices (phones)
        'sm': '640px',  // Small devices (tablets)
        'md': '768px',  // Medium devices (landscape tablets)
        'lg': '1024px', // Large devices (laptops/desktops)
        'xl': '1280px', // Extra large devices (large desktops)
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
};
