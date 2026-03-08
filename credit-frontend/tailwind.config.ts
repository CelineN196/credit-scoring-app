import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Giữ lại cho chắc nếu bạn có dùng src
  ],
  darkMode: 'class', // Cực kỳ quan trọng!
  theme: {
    extend: {
      colors: {
        // Bạn có thể định nghĩa thêm màu ở đây nếu muốn
      }
    },
  },
  plugins: [],
};
export default config;