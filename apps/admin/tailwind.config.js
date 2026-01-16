/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
                    400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
                    800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
                },
                accent: {
                    50: '#f0f7ff', 100: '#e0efff', 200: '#b9dfff', 300: '#7cc4ff',
                    400: '#36a6ff', 500: '#0c8bff', 600: '#006cdb', 700: '#0055b0',
                    800: '#004890', 900: '#003d77', 950: '#002754',
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
