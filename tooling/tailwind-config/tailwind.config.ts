import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          200: "rgb(var(--color-primary-200) / <alpha-value>)",
          300: "rgb(var(--color-primary-300) / <alpha-value>)",
          400: "rgb(var(--color-primary-400) / <alpha-value>)",
          500: "rgb(var(--color-primary) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
          800: "rgb(var(--color-primary-800) / <alpha-value>)",
          900: "rgb(var(--color-primary-900) / <alpha-value>)",
          950: "rgb(var(--color-primary-950) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          dim: "rgb(var(--color-surface-dim) / <alpha-value>)",
          bright: "rgb(var(--color-surface-bright) / <alpha-value>)",
          container: "rgb(var(--color-surface-container) / <alpha-value>)",
          "container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
          "container-lowest": "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
          "container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
          "container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        },
        "on-surface": {
          DEFAULT: "rgb(var(--color-on-surface) / <alpha-value>)",
          variant: "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        },
        error: {
          DEFAULT: "rgb(var(--color-error) / <alpha-value>)",
          container: "rgb(var(--color-error-container) / <alpha-value>)",
          "on-error": "rgb(var(--color-on-error) / <alpha-value>)",
          "on-container": "rgb(var(--color-on-error-container) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          50: "rgb(var(--color-success-50) / <alpha-value>)",
          100: "rgb(var(--color-success-100) / <alpha-value>)",
          500: "rgb(var(--color-success-500) / <alpha-value>)",
          600: "rgb(var(--color-success-600) / <alpha-value>)",
          700: "rgb(var(--color-success-700) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          50: "rgb(var(--color-warning-50) / <alpha-value>)",
          100: "rgb(var(--color-warning-100) / <alpha-value>)",
          500: "rgb(var(--color-warning-500) / <alpha-value>)",
          600: "rgb(var(--color-warning-600) / <alpha-value>)",
          700: "rgb(var(--color-warning-700) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          50: "rgb(var(--color-secondary-50) / <alpha-value>)",
          100: "rgb(var(--color-secondary-100) / <alpha-value>)",
          500: "rgb(var(--color-secondary-500) / <alpha-value>)",
          600: "rgb(var(--color-secondary-600) / <alpha-value>)",
          700: "rgb(var(--color-secondary-700) / <alpha-value>)",
        },
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        outline: {
          DEFAULT: "rgb(var(--color-outline) / <alpha-value>)",
          variant: "rgb(var(--color-outline-variant) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-default)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        heading: ["var(--font-manrope)", "sans-serif"],
        arabic: ["'IBM Plex Sans Arabic'", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      spacing: {
        "unit": "8px",
        "gutter": "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "container-max": "1200px",
      },
      boxShadow: {
        card: "0 4px 16px -1px rgba(28, 28, 24, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)",
        "card-hover": "0 12px 24px -2px rgba(28, 28, 24, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 1)",
        button: "0 4px 12px 0 rgba(58, 103, 88, 0.2)",
        "button-hover": "0 8px 20px 0 rgba(58, 103, 88, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
