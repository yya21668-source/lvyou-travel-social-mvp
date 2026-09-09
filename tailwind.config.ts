import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lake: { 300: "#7DC4CE", 500: "#4A8B9C" },
        forest: { 500: "#5A8768", 700: "#2F4A3D" },
        sand: "#F6F3EA",
        coral: "#FF8B6B",
        ink: "#1E2A28",
      },
      borderRadius: { glass: "24px", card: "28px" },
      boxShadow: { glass: "0 18px 50px rgba(30,42,40,.10)", soft: "0 10px 30px rgba(30,42,40,.08)" },
      fontFamily: { sans: ["Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
