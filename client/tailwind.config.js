/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#86C232',
        'primary-light': '#61892F',
        'bg-dark': '#121619',
        surface:    '#181c1f',
        muted:      '#6B6E70',
        danger:     '#E74C3C',
        warning:    '#F39C12',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
