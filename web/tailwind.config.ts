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
        supabase: {
          bg: "#121212",
          card: "#1c1c1c",
          elevated: "#242424",
          border: "#2e2e2e",
          borderHover: "#3e3e3e",
          green: "#3ecf8e",
          greenHover: "#34b27b",
          greenMuted: "#10b98120",
          text: "#ededed",
          muted: "#94a3b8",
          subtle: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
