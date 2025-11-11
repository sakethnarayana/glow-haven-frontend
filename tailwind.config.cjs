module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#111827',
        soft: '#f5f5f2',
        accent: '#1f2937'
      }
    },
  },
  plugins: [],
}
