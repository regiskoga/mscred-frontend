/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mscred: {
                    orange: '#FF6600',
                    blue: '#002E5D',
                    light: '#F5F7FA'
                }
            }
        },
    },
    plugins: [],
}
