/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f7ff', 100: '#e0efff', 200: '#b9dfff', 300: '#7cc4ff',
                    400: '#36a6ff', 500: '#0c8bff', 600: '#006cdb', 700: '#0055b0',
                    800: '#004890', 900: '#003d77', 950: '#002754',
                },
                secondary: {
                    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
                    400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
                    800: '#86198f', 900: '#701a75', 950: '#4a044e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
