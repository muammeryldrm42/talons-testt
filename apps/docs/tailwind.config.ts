import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: "#0a0a0f", panel: "#0f0f15", border: "#1a1a25", accent: "#a855f7", accent2: "#22d3ee" } } },
} satisfies Config;
