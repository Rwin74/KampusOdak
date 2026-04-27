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
        background: "#0F172A", // Deep Navy (Dashboard)
        foreground: "#F8FAFC", // Ice White
        primary: {
          DEFAULT: "#F59E0B", // Brand Amber
          foreground: "#ffffff",
          hover: "#D97706", // Amber Hover
        },
        secondary: {
          DEFAULT: "#1E293B", // Surface Navy
          foreground: "#CBD5E1", // Soft Gray
          hover: "#334155", // Subtle Border
        },
        accent: {
          DEFAULT: "#6366F1", // Premium Indigo
          foreground: "#F8FAFC", // Ice White
        },
        destructive: {
          DEFAULT: "#EF4444", // Uyarı Kırmızısı
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10B981", // Odak Yeşili
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1E293B", // Surface Navy
          foreground: "#94A3B8", // Muted Gray
        },
        card: {
          DEFAULT: "#1E293B", // Surface Navy
          border: "#334155", // Subtle Border
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-grid": "linear-gradient(to right, #c8c8c8 1px, transparent 1px), linear-gradient(to bottom, #c8c8c8 1px, transparent 1px)",
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
