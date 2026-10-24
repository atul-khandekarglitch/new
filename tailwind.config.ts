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
        navy: {
          950: "#060D20",
          900: "#0A1733",
          850: "#0E214A",
          800: "#132C62",
          700: "#1D3F8A",
          600: "#2B56B3",
        },
        brand: {
          blue: "#0265FF",
          cyan: "#00C2FF",
          purple: "#7928CA",
          violet: "#6320EE",
          indigo: "#4F46E5",
        },
        industrial: {
          surface: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          muted: "#64748B",
          dark: "#0F172A",
        }
      },
      backgroundImage: {
        'grabcad-hero': 'linear-gradient(108deg, #07122A 0%, #0C235A 32%, #1449B8 68%, #5821BC 100%)',
        'grabcad-radial': 'radial-gradient(circle at top right, rgba(121, 40, 202, 0.35), transparent 70%), radial-gradient(circle at bottom left, rgba(2, 101, 255, 0.25), transparent 60%)',
      },
    },
  },
  plugins: [],
};
export default config;
