import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: "#274C4A", // Slate Pine (Primary)
          50: "#F2F6F5",
          100: "#E3ECEB",
          200: "#C4D8D6",
          300: "#9CBEBB",
          400: "#5D9490",
          500: "#274C4A",
          600: "#1E3B39",
          700: "#172E2D",
          800: "#10201F",
          900: "#091211",
          light: "#3A6764",
        },
        ivory: {
          DEFAULT: "#F8F6F2", // Warm Ivory (Background)
          50: "#FFFFFF",
          100: "#FAF9F7",
          200: "#F8F6F2",
          300: "#ECE7DD",
          400: "#DFD7C7",
          500: "#D1C6B0",
        },
        amberSignal: {
          DEFAULT: "#D98A1E", // Amber Signal (Accent)
          hover: "#C27715",
          light: "#FDF5E8",
        },
        graphite: {
          DEFAULT: "#202528", // Graphite (Text & Authority)
          light: "#3A4247",
          muted: "#637077",
          border: "#D2D9D8",
          dark: "#14181B",
          cardDark: "#1C2124",
          borderDark: "#2B3338",
        },
        mist: {
          DEFAULT: "#E8EBEA", // Mist (Surface, Cards, Containers)
          dark: "#D8DFDE",
          light: "#F2F5F4",
        },
        forest: {
          DEFAULT: "#1F7A5C", // Forest (Success)
          light: "#E8F5F0",
        },
        clayGold: {
          DEFAULT: "#C99727", // Clay Gold (Warning / Pending)
          light: "#FCF7EB",
        },
        brick: {
          DEFAULT: "#B84A43", // Brick (Danger / Errors)
          light: "#FBEFEF",
        },
        steelBlue: {
          DEFAULT: "#4D6E81", // Steel Blue (Info / Guidance)
          light: "#EDF3F7",
        },
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(32, 37, 40, 0.05), 0 1px 2px rgba(32, 37, 40, 0.03)",
        elevation: "0 4px 6px -1px rgba(32, 37, 40, 0.06), 0 2px 4px -1px rgba(32, 37, 40, 0.04)",
        card: "0 2px 8px rgba(32, 37, 40, 0.04), 0 1px 3px rgba(32, 37, 40, 0.02)",
        darkCard: "0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "'Inter'", "'Geist'", "sans-serif"],
        headline: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
