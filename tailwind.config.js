/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Codecademy-inspired light theme
        // Kept semantic names from prior build; values now map to the new palette.
        forest: {
          900: "#FFF5EE", // page background (warm peach)
          800: "#FFFFFF", // card surfaces
          700: "#F8F8F8", // secondary surfaces / inputs
          600: "#FFFFFF", // metric cards
          500: "#F3F4F6", // hover states
          400: "#E5E7EB", // borders
        },
        sage: {
          400: "#E5E7EB", // borders
          300: "#9CA3AF", // muted icons / borders
          200: "#6B7280", // secondary text
        },
        cream: {
          100: "#10162F", // primary text (dark navy)
          200: "#374151", // secondary text
          300: "#6B7280", // muted text
        },
        gold: {
          400: "#FFE066", // lighter accent
          500: "#F7C948", // accent / CTA
          600: "#E6B000", // darker accent
        },
        // Semantic aliases
        stock: {
          400: "#22c55e",
          500: "#16a34a",
          600: "#15803d",
        },
        expiry: {
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
        },
        risk: {
          400: "#ef4444",
          500: "#dc2626",
          600: "#b91c1c",
        },
        // New Codecademy accent
        codecademy: {
          navy: "#10162F",
          yellow: "#F7C948",
          sky: "#E6F7FF",
          peach: "#FFF5EE",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(16, 22, 47, 0.08)",
        glow: "0 0 40px -10px rgba(247, 201, 72, 0.35)",
        pop: "0 2px 4px rgba(16, 22, 47, 0.04), 0 12px 24px -4px rgba(16, 22, 47, 0.12)",
        lift: "0 8px 16px -4px rgba(247, 201, 72, 0.25), 0 4px 8px -2px rgba(16, 22, 47, 0.08)",
        premium: "0 20px 50px -12px rgba(217, 70, 239, 0.25)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse at 50% 0%, rgba(247, 201, 72, 0.18) 0%, transparent 50%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
