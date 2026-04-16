import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // zinc-950
        foreground: "#fafafa", // zinc-50
        primary: {
          DEFAULT: "#8b5cf6", // violet-500
          foreground: "#ffffff",
          hover: "#7c3aed", // violet-600
        },
        secondary: {
          DEFAULT: "#27272a", // zinc-800
          foreground: "#fafafa", // zinc-50
          hover: "#3f3f46", // zinc-700
        },
        accent: {
          DEFAULT: "#22d3ee", // cyan-400
          foreground: "#083344", // cyan-950
        },
        destructive: {
          DEFAULT: "#ef4444", // red-500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#18181b", // zinc-900
          foreground: "#a1a1aa", // zinc-400
        },
        card: {
          DEFAULT: "#09090b",
          border: "#27272a",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-grid": "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
      },
      animation: {
        "blob": "blob 7s infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
