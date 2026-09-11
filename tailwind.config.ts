import type { Config } from "tailwindcss";

/**
 * 旅遇设计系统
 * - 湖蓝渐变（主色）: #4A8B9C → #7DC4CE
 * - 森林绿渐变（辅色）: #2F4A3D → #5A8768
 * - 暖白沙（背景）: #F6F3EA
 * - 珊瑚橙（CTA点缀）: #FF8B6B
 * - 深墨绿黑（文字主色）: #1E2A28
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lake: {
          50: "#EEF6F8",
          100: "#D8EDF1",
          200: "#B0DCE4",
          300: "#88CBD7",
          400: "#7DC4CE",
          500: "#5FA6B5",
          600: "#4A8B9C",
          700: "#3B707E",
          800: "#2C5560",
          900: "#1D3A42",
        },
        forest: {
          50: "#F0F4F1",
          100: "#DCE6DF",
          200: "#B9CDBF",
          300: "#96B49F",
          400: "#5A8768",
          500: "#487057",
          600: "#2F4A3D",
          700: "#253B31",
          800: "#1B2C24",
          900: "#121E18",
        },
        sand: {
          50: "#FBFAF5",
          100: "#F6F3EA",
          200: "#EDE7D6",
          300: "#E0D6BC",
          400: "#C9B98F",
        },
        coral: {
          50: "#FFF3EF",
          100: "#FFE4DC",
          200: "#FFC9BA",
          300: "#FFAB94",
          400: "#FF8B6B",
          500: "#F06E4C",
          600: "#D4552F",
          700: "#A83F20",
          800: "#7C2E17",
          900: "#501D0E",
        },
        ink: {
          50: "#F4F6F6",
          100: "#E3E8E7",
          200: "#B9C3C1",
          300: "#8A9694",
          400: "#5C6865",
          500: "#3D4744",
          600: "#2A3431",
          700: "#1E2A28",
          800: "#15201E",
          900: "#0D1514",
        },
      },
      borderRadius: {
        card: "24px",
        cardlg: "28px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(30, 42, 40, 0.08)",
        "glass-lg": "0 16px 48px rgba(30, 42, 40, 0.12)",
        soft: "0 2px 12px rgba(30, 42, 40, 0.06)",
      },
      backgroundImage: {
        "lake-grad": "linear-gradient(135deg, #4A8B9C 0%, #7DC4CE 100%)",
        "forest-grad": "linear-gradient(135deg, #2F4A3D 0%, #5A8768 100%)",
        "hero-grad":
          "linear-gradient(150deg, #4A8B9C 0%, #7DC4CE 45%, #5A8768 100%)",
        "sand-grad": "linear-gradient(150deg, #F6F3EA 0%, #EDE7D6 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        twinkle: "twinkle 2.6s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
