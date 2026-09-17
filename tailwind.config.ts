import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B22",
        paper: "#F7F3EC",
        paper2: "#EFE7D8",
        wine: "#7A1F3D",
        "wine-dark": "#5A1730",
        gold: "#B98A2E",
        teal: "#1F5C56"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-work-sans)", "sans-serif"]
      },
      maxWidth: {
        prose: "68ch"
      }
    }
  },
  plugins: []
};

export default config;
