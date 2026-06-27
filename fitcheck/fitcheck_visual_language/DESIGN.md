---
name: FitCheck! Visual Language
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#47464c'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#78767d'
  outline-variant: '#c8c5cd'
  surface-tint: '#5e5c71'
  primary: '#5e5c71'
  on-primary: '#ffffff'
  primary-container: '#eae6ff'
  on-primary-container: '#68667b'
  inverse-primary: '#c7c4dc'
  secondary: '#52625b'
  on-secondary: '#ffffff'
  secondary-container: '#d5e7de'
  on-secondary-container: '#586861'
  tertiary: '#675c58'
  on-tertiary: '#ffffff'
  tertiary-container: '#f6e6e1'
  on-tertiary-container: '#716662'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3e0f8'
  primary-fixed-dim: '#c7c4dc'
  on-primary-fixed: '#1b1a2b'
  on-primary-fixed-variant: '#464558'
  secondary-fixed: '#d5e7de'
  secondary-fixed-dim: '#b9cbc2'
  on-secondary-fixed: '#0f1e19'
  on-secondary-fixed-variant: '#3a4a44'
  tertiary-fixed: '#efdfda'
  tertiary-fixed-dim: '#d2c3bf'
  on-tertiary-fixed: '#221a17'
  on-tertiary-fixed-variant: '#4f4541'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stroke-weight: 3px
  shadow-offset: 4px
---

## Brand & Style
The design system is built on **Neo-Brutalism** with a "Hipster Label" aesthetic, specifically tailored for Gen Z and Millennial fashion enthusiasts. The brand personality is high-energy, irreverent, and humorous, designed to feel like a high-end streetwear sticker or a curated Instagram story. 

The aesthetic is characterized by raw, structural honesty: bold 3px black strokes define every boundary, while 4px hard shadows (offset 4px down and 4px right) create a tactile, "popping" depth. The UI rejects subtle gradients and soft blurs in favor of "ink-on-paper" clarity and sticker-like layering. It is a "roasting" environment that remains visually premium through meticulous alignment and sophisticated pastel backdrops.

## Colors
This design system utilizes a high-contrast foundation paired with a soft, sophisticated pastel palette.

- **Primary (Lavender):** #EAE6FF — Used for main action areas and "Top Rated" highlights.
- **Secondary (Mint):** #E2F4EB — Used for "Safe" ratings and positive feedback loops.
- **Tertiary (Peach):** #FFEFEA — Used for "Risk" ratings and fashion-forward alerts.
- **Quaternary (Cream):** #FFF9E6 — Used for secondary cards and sticker-style labels.
- **Ink (Black):** #000000 — Used for all borders, shadows, and primary text to ensure maximum punch.

Backgrounds remain strictly white or extremely light gray to allow the pastel blocks and thick black strokes to dominate the visual hierarchy.

## Typography
The typography strategy contrasts heavy, impactful display faces with highly readable, accessible body text.

- **Headlines:** Montserrat in ExtraBold/Black weights. These should feel loud and authoritative. Use tight letter-spacing for large titles to mimic fashion magazine covers.
- **Body & Labels:** Lexend provides a clean, geometric counterpoint. Its inherent readability balances the "aggressive" Neo-Brutalist elements.
- **Stylistic Rule:** Use `label-bold` with all-caps for button text and UI tags to reinforce the "label" aesthetic.

## Layout & Spacing
The layout follows a strict **Fluid Grid** model with a "hard-edge" philosophy. 

- **The 4px Rhythm:** All spacing (padding, margins, gaps) must be multiples of 4px.
- **Containers:** Components do not use soft margins; they are contained within 3px black borders. 
- **Layout Model:** Use a 12-column grid for desktop and a 2-column grid for mobile. Content should "snap" to the grid lines.
- **Mobile Reflow:** On mobile, padding increases slightly to 20px to ensure the thick borders don't feel claustrophobic on small screens.

## Elevation & Depth
In this design system, depth is purely structural and graphic, not environmental. 

- **Hard Shadows:** Depth is conveyed through a 4px x 4px offset shadow with 100% opacity (Black). No blurs are permitted.
- **State Changes:** When an element is pressed or "active," the shadow should disappear (0px offset), and the element should translate 4px down and 4px right to simulate a physical button being pushed into the page.
- **Layering:** Use the pastel palette to define hierarchy. Background elements use White, while "floating" interactive cards use the Primary or Secondary pastel shades with the mandatory 3px border.

## Shapes
The shape language is strictly **Sharp (0px roundedness)**. 

Every button, card, and input field must have 90-degree corners. This reinforces the "label" and "sticker" aesthetic, making the UI feel like it was cut from a sheet of paper. Avoid all border-radius settings except for user avatars, which should remain perfectly circular to provide a singular point of organic contrast against the rigid UI.

## Components

### Buttons
- **Primary:** Lavender (#EAE6FF) background, 3px black border, 4px black hard shadow. Text is `label-bold`.
- **Ghost:** White background, 3px black border, no shadow until hovered.
- **Interaction:** On click, translate (4px, 4px) and remove shadow.

### Cards (The "Fit" Container)
- Background: White or Cream (#FFF9E6).
- Border: 3px solid Black.
- Header: A contrasting pastel "label" strip at the top with the rating or category.
- Shadow: 4px hard shadow.

### Chips & Tags
- Small rectangular boxes with 2px borders (slightly thinner than containers).
- Used for "Vibe" descriptors (e.g., "STREETWEAR", "MID", "DRIP").
- Use Quaternary (#FFF9E6) for neutral tags and Tertiary (#FFEFEA) for "Roast" tags.

### Input Fields
- White background, 3px black border.
- Placeholder text in a muted gray, but typed text in full Black `body-md`.
- No shadows on inactive inputs; use a 4px primary color shadow when focused.

### Rating Sliders
- Use a thick 4px black track.
- The "thumb" or handle is a large sharp square in a contrasting pastel color.

### Sticker Accents
- Randomly rotated "Price Tag" or "QC Passed" style labels used as decorative overlays on fashion photos to emphasize the "roasting" or "rating" narrative.