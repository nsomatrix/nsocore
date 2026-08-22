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
        pixel: ['"Press Start 2P"', 'monospace'],
        game: ['"Silkscreen"', 'monospace'],
        tech: ['"Chakra Petch"', 'sans-serif'],
      },
      colors: {
        supabase: {
          bg: "#090a0f",
          card: "#12141d",
          elevated: "#1a1d29",
          border: "#242838",
          borderHover: "#383e58",
          green: "#3ecf8e",
          greenHover: "#34b27b",
          greenMuted: "#3ecf8e1a",
          neon: "#00ffcc",
          gold: "#f59e0b",
          text: "#f1f5f9",
          muted: "#94a3b8",
          subtle: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
