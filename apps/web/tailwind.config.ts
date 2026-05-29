import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        archive: {
          black: "#03050b",
          navy: "#07111f",
          panel: "rgba(10, 19, 33, 0.72)",
          cyan: "#56f4ff",
          violet: "#9b5cff",
          ember: "#ffb65c",
          mint: "#7dffbf"
        }
      },
      boxShadow: {
        neon: "0 0 32px rgba(86, 244, 255, 0.22)",
        violet: "0 0 36px rgba(155, 92, 255, 0.24)"
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui"]
      },
      animation: {
        "slow-spin": "slow-spin 18s linear infinite",
        "pulse-ring": "pulse-ring 5s ease-in-out infinite",
        "scan": "scan 4s linear infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        "slow-spin": {
          to: { transform: "rotate(360deg)" }
        },
        "pulse-ring": {
          "0%, 100%": { transform: "scale(0.86)", opacity: "0.32" },
          "50%": { transform: "scale(1.08)", opacity: "0.72" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
