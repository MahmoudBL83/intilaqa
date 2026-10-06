---
name: Verdant Echo
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#404945'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#717975'
  outline-variant: '#c0c8c3'
  surface-tint: '#3a6758'
  primary: '#3a6758'
  on-primary: '#ffffff'
  primary-container: '#a7d7c5'
  on-primary-container: '#325f51'
  inverse-primary: '#a1d1bf'
  secondary: '#4c644f'
  on-secondary: '#ffffff'
  secondary-container: '#ceeacf'
  on-secondary-container: '#516a55'
  tertiary: '#4d6453'
  on-tertiary: '#ffffff'
  tertiary-container: '#bad3be'
  on-tertiary-container: '#465c4b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcedda'
  primary-fixed-dim: '#a1d1bf'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#214f41'
  secondary-fixed: '#ceeacf'
  secondary-fixed-dim: '#b2ceb4'
  on-secondary-fixed: '#092010'
  on-secondary-fixed-variant: '#344c39'
  tertiary-fixed: '#d0e9d4'
  tertiary-fixed-dim: '#b4cdb8'
  on-tertiary-fixed: '#0b2013'
  on-tertiary-fixed-variant: '#364c3c'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1200px
---

## Brand & Style

The design system is centered on a "Soft Botanical" aesthetic, blending the organic tranquility of nature with the high-end precision of modern technology. It is designed to evoke a sense of calm, growth, and clarity, making it ideal for wellness, lifestyle, or premium editorial platforms.

The visual style utilizes a sophisticated mix of **Minimalism** and **Glassmorphism**. Layouts are defined by expansive whitespace (parchment-toned), while interactive elements leverage frosted glass effects and subtle translucency to create depth without clutter. The interface feels light, breathable, and premium, taking heavy inspiration from Apple’s layered depth and smooth transitions.

## Colors

The palette is rooted in a naturalistic spectrum that prioritizes eye comfort and sophistication:

- **Primary (Soft Mint):** Used exclusively for high-priority actions, toggles, and active states. It provides a gentle but clear visual cue for interaction.
- **Secondary (Light Sage):** Employed for subtle accents, secondary iconography, and decorative UI elements that require a softer presence than the primary mint.
- **Tertiary (Deep Forest):** The anchor of the system, used for primary typography, borders, and high-contrast iconography to ensure maximum legibility against light backgrounds.
- **Neutral (Warm Parchment):** The foundation of the UI. This off-white, warm-toned neutral replaces harsh pure whites to create a tactile, paper-like feel that reduces screen glare.

## Typography

The design system uses **Manrope** across all levels to maintain a clean, modern, and highly legible appearance. Manrope’s geometric yet warm character perfectly bridges the gap between technical precision and organic friendliness.

Headlines utilize tighter letter spacing and heavier weights to command attention, while body text maintains a generous line height for long-form readability. For secondary information and metadata, a bold uppercase label style is used to provide structural hierarchy without requiring large font sizes.

## Layout & Spacing

This design system employs a **fluid grid** model based on an 8px spacing rhythm. This ensures all components scale proportionately and maintain visual harmony. 

The desktop layout follows a 12-column structure with a 24px gutter, allowing for diverse content arrangements ranging from wide editorial spans to compact data grids. On mobile devices, the system collapses to a single-column view with a 20px safety margin. Spacing between sections should be generous (typically 80px+) to reinforce the minimalist, "breathable" botanical theme.

## Elevation & Depth

Visual hierarchy is established through **Glassmorphism** and soft, tinted shadows rather than heavy borders.

1.  **Base Layer:** The Warm Parchment surface acts as the canvas.
2.  **Mid Layer (Glass):** Interactive panels and floating menus use a semi-transparent white fill (opacity 60-80%) with a 20px backdrop blur. This creates a "frosted" effect that lets the background colors bleed through softly.
3.  **Top Layer (Shadows):** Elements that require focus use an "Ambient Shadow" approach—wide-spread, low-opacity shadows (6-10%) tinted with a hint of Deep Forest green to maintain color harmony and prevent the shadows from looking "dirty" or gray.

## Shapes

The shape language is defined by extreme softness. Following an Apple-inspired aesthetic, the standard corner radius for primary containers and cards is **24px** (`rounded-xl`). 

Smaller elements like buttons and input fields utilize a **pill-shaped** (fully rounded) geometry to emphasize the approachable, organic nature of the brand. This lack of sharp corners removes visual tension and encourages a more fluid navigation experience.

## Components

- **Buttons:** Primary buttons are pill-shaped with a Soft Mint background and Deep Forest text. Secondary buttons use the glassmorphic style with a subtle 1px Deep Forest border at 10% opacity.
- **Cards:** Use a 24px corner radius. They should feature a very thin (0.5px) inner stroke of translucent Deep Forest to define the edges against the Parchment background.
- **Input Fields:** Softly recessed or glass-filled with pill-shaped corners. The focus state should be indicated by a Soft Mint outer glow.
- **Chips/Tags:** Small, fully rounded elements using the Light Sage color with a low opacity background to categorize content without overwhelming the page.
- **Lists:** Items are separated by generous padding and thin, fading dividers rather than heavy lines, maintaining the light and airy feel of the design system.