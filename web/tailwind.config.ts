import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        supabase: {
          bg: "#000000",
          card: "#09090b",
          elevated: "#121215",
          border: "#1c1c21",
          borderHover: "#2d2d37",
          green: "#10b981",
          greenHover: "#059669",
          greenMuted: "#10b98115",
          text: "#f4f4f5",
          muted: "#a1a1aa",
          subtle: "#71717a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
