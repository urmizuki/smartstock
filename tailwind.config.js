/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic names kept from the old build so existing utility classes
        // (bg-cream-100, text-forest-900, ...) re-map to the warm palette.
        paper: "#F6EEDD",
        ink: "#17110B",

        forest: {
          900: "#F6EEDD", // page
          800: "#FFFBF2", // panel
          700: "#F0E7D3", // secondary surface
          600: "#FFFBF2", // cards
          500: "#EADFC6", // hover
          400: "#D8C9AC", // dividers
        },
        sage: {
          400: "#17110B", // borders
          300: "#8A5A2B", // muted icons
          200: "#6B5A4A", // secondary text
        },
        cream: {
          100: "#17110B", // primary text
          200: "#3B2A1E", // secondary text
          300: "#6B5A4A", // muted text
        },
        // Gold was the CTA accent — now tomato.
        gold: {
          400: "#E85A48",
          500: "#DC3A26",
          600: "#C22F1D",
        },
        // Sky (context banners) — now warm sand.
        sky: {
          50: "#FFF6DE",
          100: "#FBE3A8",
          300: "#F0B429",
        },
        // Pro accents — now mustard / sauce brown.
        fuchsia: {
          50: "#FFFBF2",
          100: "#FBE3A8",
          200: "#F0B429",
          500: "#F0B429",
          600: "#C98A12",
          700: "#7A4A12",
        },
        violet: {
          500: "#8A5A2B",
        },
        tomato: { 400: "#E85A48", 500: "#DC3A26", 600: "#C22F1D" },
        mustard: { 400: "#F5C455", 500: "#F0B429", 600: "#C98A12" },
        avocado: { 400: "#5FB245", 500: "#4F9D3A", 600: "#3F7F2E" },
        brown: { 400: "#A87540", 500: "#8A5A2B", 600: "#6B4520" },

        stock: { 400: "#5FB245", 500: "#4F9D3A", 600: "#3F7F2E" },
        expiry: { 400: "#F0B429", 500: "#C98A12", 600: "#9A6A0C" },
        risk: { 400: "#E85A48", 500: "#DC3A26", 600: "#B21F12" },

        codecademy: { navy: "#17110B", yellow: "#F0B429", sky: "#FBE3A8", peach: "#F6EEDD" },
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
        display: ['"Archivo Black"', "Archivo", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      // Neo-brutalist: zero radius everywhere except explicit pills.
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        "4xl": "0px",
      },
      // Hard, solid, zero-blur offsets.
      boxShadow: {
        soft: "5px 5px 0 #17110B",
        pop: "6px 6px 0 #17110B",
        lift: "4px 4px 0 #17110B",
        premium: "8px 8px 0 #17110B",
        glow: "0 0 0 3px #DC3A26",
        flat: "0 0 0 #17110B",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.75" } },
      },
      animation: {
        "fade-in-up": "fadeInUp 220ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        spin: "spin 700ms linear infinite",
      },
    },
  },
  plugins: [],
};
