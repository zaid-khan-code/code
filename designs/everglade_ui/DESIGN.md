# Design System Document: The Digital Greenhouse

## 1. Overview & Creative North Star
The design system is anchored by the Creative North Star: **"The Digital Greenhouse."** 

This concept rejects the cold, sterile nature of traditional AI interfaces in favor of an environment that feels organic, precise, and supportive. A greenhouse is a structured architecture that fosters growth; similarly, this system uses high-end editorial layouts to organize complex information into a breathable, premium experience.

To move beyond "template" design, we utilize **Intentional Asymmetry** and **Tonal Depth**. We avoid rigid, boxy grids. Instead, elements should feel like they are "planted" within a warm, expansive canvas, using overlapping layers and high-contrast typography scales to guide the eye. This is a sanctuary of productivity—precise enough for data, yet soft enough for human intuition.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a "Soil and Leaf" philosophy. The secondary dark forest green provides the grounding weight, while the primary emerald provides the life and action.

### The Palette
- **Primary (`#10B981`):** Used for "Growth" points—CTAs, badges, and active states. 
- **Secondary (`#23302C`):** The "Soil." Used for hero sections and strong typographic statements to provide gravity.
- **Background (`#FDFBF7`):** The "Canvas." A warm, off-white that prevents eye strain and feels more like fine paper than a screen.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts or subtle tonal transitions.
- To separate a sidebar from a main feed, transition from `surface` to `surface-container-low`.
- For card definitions, use `surface-container-highest` on a `surface` background.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Each inner container should use a slightly higher or lower tier to define importance:
- **Level 1 (Base):** `surface` (#fbf9f5)
- **Level 2 (Sectioning):** `surface_container_low` (#f5f3ef)
- **Level 3 (Interactive Cards):** `surface_container_lowest` (#ffffff) to provide a "lifted" feel.

### The "Glass & Gradient" Rule
To elevate the aesthetic, use **Glassmorphism** for floating elements (e.g., navigation bars or tooltips). Apply a semi-transparent `surface` color with a `backdrop-blur` of 20px. 
*Signature Texture:* Use a subtle linear gradient (Primary to Primary-Container) on main CTAs to add "soul" and depth.

---

## 3. Typography: The Editorial Voice
We use a high-contrast pairing to balance authority with utility.

### Headline & Display: Plus Jakarta Sans
- **Character:** Geometric, bold, and modern. 
- **Usage:** Used for `display-lg` (3.5rem) down to `headline-sm` (1.5rem). 
- **Editorial Note:** Use wide letter-spacing (-0.02em) on large displays to create a sophisticated, high-end magazine feel. Use `on_secondary` text on dark backgrounds for maximum authority.

### Body & Labels: Inter
- **Character:** Crisp, highly legible, and functional.
- **Usage:** All `body` and `label` roles. 
- **Editorial Note:** Set `body-lg` at 1rem with a generous line-height (1.6) to ensure the "Greenhouse" feels airy and readable.

---

## 4. Elevation & Depth
In this design system, depth is earned through light and tone, never through harsh outlines.

### Tonal Layering
Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f5f3ef) background. This creates a natural "paper on desk" effect.

### Ambient Shadows
When a card requires a "floating" state (e.g., on hover), use **Ambient Shadows**:
- **Color:** A tinted version of `on-surface` (e.g., `#1b1c1a` at 6% opacity).
- **Blur:** Large (30px - 60px) with 0 spread. This mimics natural sunlight rather than a digital drop shadow.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input focus), use a **Ghost Border**: `outline-variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
- **Shape:** Pill-shaped (`full` roundedness).
- **Primary:** Gradient fill (Primary to Primary-Container), `on-primary` text, no border.
- **Secondary:** `surface-container-high` fill with `on-surface` text.
- **Interaction:** On hover, increase the ambient shadow; do not change the background color drastically.

### Cards & Containers
- **Corner Radius:** Use `xl` (3rem) for large hero cards and `lg` (2rem) for standard content cards.
- **Structure:** Forbid divider lines. Separate content using `body-sm` labels or increased vertical whitespace (e.g., 24px/32px shifts).

### Input Fields
- **Style:** Use `surface-container-low` as the background fill. 
- **Shape:** `md` roundness (1.5rem) to distinguish from the "full" pill-shape of buttons.
- **States:** On focus, transition the background to `surface-container-lowest` and apply a Ghost Border.

### The Greenhouse "Pulse" (Unique Component)
A small, glowing badge using a `primary` radial gradient. Used to indicate AI "thought" or live status. It should feel organic, with a slow, eased opacity animation (4s duration).

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetric Margins:** Allow some elements to bleed off the grid or sit slightly offset to create a custom, editorial feel.
- **Embrace Whitespace:** If a section feels crowded, increase the padding rather than adding a border.
- **Tone-on-Tone:** Use `secondary_container` backgrounds with `on_secondary_container` text for supportive callouts.

### Don't:
- **Don't use 1px dividers:** It breaks the "organic" flow of the Greenhouse.
- **Don't use pure black (#000000):** It is too harsh for the warm `FDFBF7` canvas. Always use `on-surface` (#1b1c1a).
- **Don't use standard "card-shadows":** If the card doesn't need to float, let the background color shift do the work.
- **Don't use sharp corners:** Minimum roundness for any visible container should be `sm` (0.5rem), but aim for `lg`+ whenever possible.