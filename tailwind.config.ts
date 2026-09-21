import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        foreground: "#F1F5F9",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.75)",
          hover: "rgba(30, 41, 59, 0.85)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        primary: {
          DEFAULT: "#00F0FF",
          glow: "#00F0FF40",
          hover: "#00D8E6",
        },
        hero: {
          cyan: "#00F0FF",
          emerald: "#10B981",
          violet: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        charity: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        gold: {
          DEFAULT: "#F59E0B",
          glow: "#F59E0B40",
        }
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(9, 13, 22, 1) 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
        "gold-gradient": "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        "charity-gradient": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      },
      boxShadow: {
        "cyan-glow": "0 0 25px -5px rgba(0, 240, 255, 0.3)",
        "gold-glow": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
