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
        vt323: ['VT323', 'monospace'],
        mono: ['Share Tech Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      colors: {
        bios: {
          bg: "#050807",
          panel: "#0b120f",
          border: "#1a382b",
          borderBright: "#00ff66",
          green: "#00ff66",
          greenDim: "#00b347",
          amber: "#ffb000",
          cyan: "#00f0ff",
          red: "#ff3366",
          muted: "#4a7a63",
          dark: "#08100c",
        },
      },
    },
  },
  plugins: [],
};
export default config;
