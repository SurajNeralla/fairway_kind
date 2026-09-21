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
        // FairwayKind Official Brand Tokens
        "on-background": "#1b1c1a",
        "surface": "#faf9f5",
        "primary": {
          DEFAULT: "#15422e",
          glow: "#15422e40",
          hover: "#2e5a44",
        },
        "secondary-container": "#fed269",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#251a00",
        "surface-dim": "#dbdad6",
        "primary-fixed": "#bdeed0",
        "surface-variant": "#e3e2df",
        "on-error": "#ffffff",
        "surface-tint": "#3b6750",
        "secondary-fixed": "#ffdf99",
        "secondary": {
          DEFAULT: "#775a00",
          hover: "#5a4300",
        },
        "on-surface": "#1b1c1a",
        "primary-fixed-dim": "#a2d1b5",
        "on-tertiary-fixed": "#181d1a",
        "surface-container": "#efeeea",
        "secondary-fixed-dim": "#ecc15a",
        "tertiary": "#373c38",
        "on-secondary": "#ffffff",
        "surface-bright": "#faf9f5",
        "error": "#ba1a1a",
        "tertiary-container": "#4e534f",
        "surface-container-highest": "#e3e2df",
        "on-tertiary-fixed-variant": "#434844",
        "on-surface-variant": "#414943",
        "tertiary-fixed-dim": "#c3c8c3",
        "surface-container-low": "#f5f4f0",
        "on-secondary-fixed-variant": "#5a4300",
        "primary-container": "#2e5a44",
        "tertiary-fixed": "#dfe4de",
        "inverse-on-surface": "#f2f1ed",
        "on-primary-fixed-variant": "#234f3a",
        "inverse-primary": "#a2d1b5",
        "outline-variant": "#c1c9c1",
        "on-error-container": "#93000a",
        "inverse-surface": "#30312e",
        "surface-container-lowest": "#ffffff",
        "on-secondary-container": "#765900",
        "on-primary-container": "#a0cfb4",
        "background": "#faf9f5",
        "on-tertiary": "#ffffff",
        "outline": "#717973",
        "on-primary-fixed": "#002113",
        "on-primary": "#ffffff",
        "on-tertiary-container": "#c2c6c1",
        "surface-container-high": "#e9e8e4",

        // Compatibility aliases for existing UI components
        charity: {
          DEFAULT: "#15422e",
          light: "#2e5a44",
          dark: "#0b251a",
        },
        gold: {
          DEFAULT: "#775a00",
          glow: "#775a0040",
        }
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px"
      },
      spacing: {
        "space-md": "1rem",
        "margin": "2rem",
        "gutter": "1.5rem",
        "space-sm": "0.5rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "space-xs": "0.25rem"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        "body-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-sm": ["'Plus Jakarta Sans'", "sans-serif"],
        "label-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "body-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "label-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-sm": ["Outfit", "sans-serif"],
        "label-sm": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-lg-mobile": ["Outfit", "sans-serif"],
      },
      fontSize: {
        "body-md": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "0em", fontWeight: "400" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.04em", fontWeight: "600" }],
        "headline-md": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em", fontWeight: "500" }],
        "headline-lg": ["2.5rem", { lineHeight: "3rem", letterSpacing: "-0.025em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em", fontWeight: "400" }],
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em", fontWeight: "600" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "label-sm": ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.06em", fontWeight: "700" }],
        "headline-lg-mobile": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display": ["3.5rem", { lineHeight: "4rem", letterSpacing: "-0.03em", fontWeight: "600" }]
      },
      boxShadow: {
        "custom-card": "0 4px 20px -2px rgba(20, 25, 22, 0.03), 0 1px 3px 0 rgba(20, 25, 22, 0.02)",
        "custom-floating": "0 20px 32px -8px rgba(20, 25, 22, 0.06), 0 4px 8px -2px rgba(20, 25, 22, 0.03)",
        "green-glow": "0 0 25px -5px rgba(46, 90, 68, 0.3)",
      }
    },
  },
  plugins: [],
};

export default config;
