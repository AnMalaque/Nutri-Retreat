import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fusion: {
          bg:         "#FFF0EC",
          card:       "#ffffff",
          sidebar:    "#ffffff",
          accent:     "#FF6B35",
          accentHov:  "#E85D2A",
          accentLight:"#FFF0EC",
          green:      "#4CAF82",
          greenLight: "#E8F7EF",
          text:       "#2D2D3A",
          muted:      "#9B9BAE",
          light:      "#C4C4D4",
          border:     "rgba(0,0,0,0.07)",
          carb:       "#F9A03F",
          prot:       "#5B9BD5",
          fat:        "#E85555",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card:  "18px",
        panel: "12px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(255,107,53,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
