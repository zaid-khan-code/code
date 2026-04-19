# Design System Strategy: The Digital Sanctuary

## 1. Overview & Creative North Star: The Digital Sanctuary
This design system is built upon the philosophy of **"The Digital Sanctuary."** In an era of cluttered, high-frequency interfaces, this system acts as a high-end architectural retreat. It prioritizes cognitive ease, organic flow, and editorial confidence.

We move beyond the "template" look by rejecting rigid, boxy structures. Instead, we use **intentional asymmetry** and **tonal layering** to guide the eye. This is a "Desktop-First" experience that treats the browser window like a premium tactile magazine—generous with white space, bold in its typographic hierarchy, and soft in its physical presence.

## 2. Color & Surface Philosophy
The palette is rooted in a sophisticated tri-tone relationship: a warm, paper-like background (`#FDFBF7`), a deep, authoritative forest green (`#23302C`), and a vibrant, bioluminescent primary accent (`#10B981`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined through:
*   **Background Shifts:** Distinguishing a section by moving from `surface` (#fbf9f5) to `surface-container-low` (#f5f3ef).
*   **Tonal Transitions:** Using the depth of the `secondary` forest green to anchor large sections of the page.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. We use the Material surface-container tiers to create "nested" depth:
*   **Base:** `surface` (#fbf9f5) – The primary canvas.
*   **Secondary Content:** `surface-container-low` (#f5f3ef) – For subtle content grouping.
*   **Elevated Elements:** `surface-container-lowest` (#ffffff) – For cards that need to "pop" against the warm background.

### The "Glass & Gradient" Rule
To escape a flat, "out-of-the-box" feel, use **Glassmorphism** for floating elements (navbars, overlays).
*   **Formula:** Use `surface` colors at 70-80% opacity with a `backdrop-blur` of 20px–30px.
*   **Signature Textures:** Apply a subtle linear gradient to main CTAs, moving from `primary` (#006c49) to `primary-container` (#10b981) at a 135° angle. This adds "soul" and a sense of light source that flat hex codes lack.

## 3. Typography: The Editorial Voice
This system utilizes a high-contrast pairing to achieve an editorial, premium aesthetic.

*   **Headlines (Plus Jakarta Sans):** Geometric, bold, and authoritative. Use `display-lg` and `headline-lg` for hero sections. The tight kerning and bold weights of Plus Jakarta Sans convey modern confidence.
*   **Body (Manrope):** A crisp, high-legibility sans-serif. Manrope provides a humanistic touch that balances the geometry of the headlines.
*   **The Hierarchy Strategy:** Create "Focus Zones" by pairing an oversized `display-md` headline with a compact `body-md` description. Avoid "middle-ground" sizing; go either very large or very clear.

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines to define hierarchy. We use light and layering.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on top of a `surface-container-low` (#f5f3ef) section. This creates a natural, soft "lift" without the need for a shadow.
*   **Ambient Shadows:** When an element must float (e.g., a primary modal), use an "Ambient Shadow." 
    *   **Spec:** `0px 24px 48px rgba(35, 48, 44, 0.06)`. 
    *   The shadow is never grey; it is a low-opacity tint of our `secondary` (forest green) color to mimic natural light in a forest environment.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast mode), use the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`full` roundness). Gradient-filled (Primary to Primary-Container). High-contrast `on-primary` text.
*   **Secondary:** Pill-shaped. `secondary` forest green background with `on-secondary` text. Used for high-gravity hero actions.
*   **Tertiary:** No background. Text-only with a slightly bolder weight.

### Cards
*   **Radius:** Always use `xl` (3rem) or `lg` (2rem) for containers.
*   **Structure:** No divider lines. Separate header and body content using vertical white space (recommended: `2rem` to `3rem` padding).
*   **Hero Cards:** Large `secondary` (#23302C) cards with `on-secondary` typography to create a "Sanctuary" focal point.

### Input Fields
*   **Style:** Pill-shaped or `lg` rounded containers. 
*   **Background:** Use `surface-container-high` (#eae8e4) instead of a border. 
*   **Active State:** Transition to a "Ghost Border" (15% primary color) with a subtle ambient glow.

### Chips & Badges
*   **Style:** Pill-shaped. 
*   **Color:** Use `primary-container` (#10b981) for positive/active states and `surface-container-highest` for neutral filters.

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Allow text to breathe. Use larger padding on the top/bottom than on the sides for hero sections to create an editorial look.
*   **Overlap Elements:** Let images or cards slightly overlap background color shifts to break the "grid" feel.
*   **Prioritize Type:** Let the typography do the heavy lifting of the layout.

### Don't:
*   **No 1px Dividers:** Never use a line to separate two pieces of content. Use space or a color shift.
*   **No Sharp Corners:** Avoid `none`, `sm`, or `md` rounding for main containers. The Sanctuary is organic; it has no sharp edges.
*   **No Pure Black:** Never use #000000. Use `secondary` or `on-surface` for text to maintain the soft, organic tone.
*   **No Standard Shadows:** Avoid the default "Figma drop shadow." If it looks like a default, it’s wrong. It must be diffused and tinted.