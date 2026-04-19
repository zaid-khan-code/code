# Design System Strategy: The Curated Ecosystem

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Greenhouse"**

This design system moves away from the sterile, cold aesthetics of traditional AI and toward a "Digital Greenhouse"—a space that feels organic, nurturing, and high-end. We achieve this through **Organic Modernism**: combining the precision of AI with the warmth of a community-powered ecosystem. 

To break the "template" look, we reject the rigid grid in favor of **Intentional Asymmetry**. Elements should feel like they are floating on a warm, tactile canvas. We utilize oversized typography scales, overlapping card structures, and generous negative space to create an editorial feel that suggests every pixel was placed by a curator, not an algorithm.

---

## 2. Colors & Surface Philosophy

The palette is anchored in forest depths and botanical vibrance, set against a warm, high-end paper background.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning or containment. 
Boundaries must be defined exclusively through **Tonal Shifting**. To separate a section, transition from `surface` (#fbf9f5) to `surface-container-low` (#f5f3ef). This creates a "soft-edge" layout that feels premium and architectural rather than "webby."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use "Nested Depth" to guide the eye:
*   **Level 0 (Base):** `surface` (#fbf9f5) - The main canvas.
*   **Level 1 (Sectioning):** `surface-container-low` (#f5f3ef) - Large background blocks.
*   **Level 2 (Interaction):** `surface-container-highest` (#e4e2de) - Cards or containers that require focus.
*   **Level 3 (Floating):** `surface-container-lowest` (#ffffff) - Used for cards that sit atop darker sections to create a high-contrast pop.

### Glass & Gradient Rule
To provide "soul," the `primary` (#006c49) should rarely be a flat block. Use subtle radial gradients transitioning from `primary` to `primary_container` (#10b981) to simulate organic light. 
*   **Glassmorphism:** For floating navigation or over-image labels, use `surface` at 70% opacity with a `24px` backdrop-blur.

---

## 3. Typography: The Editorial Voice

We utilize a high-contrast pairing to balance authority with readability.

*   **The Display Voice (Plus Jakarta Sans):** Our headlines are geometric and bold. Use `display-lg` and `display-md` with slight negative letter-spacing (-0.02em) to create a "locked-in" editorial look. This font conveys the "Modern AI" aspect—sharp, precise, and forward-thinking.
*   **The Narrative Voice (Inter):** All body and utility text uses Inter. It is chosen for its "invisible" quality, allowing the community content to breathe. 
*   **Hierarchy Tip:** Always skip a size in the scale when placing a subhead near a headline (e.g., a `display-md` headline followed by a `title-sm` subhead) to ensure a dramatic, intentional contrast.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are "dirty." We create lift through light and tone.

*   **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f5f3ef) background. The 4% difference in luminance is enough for the human eye to perceive depth without visual clutter.
*   **Ambient Shadows:** Where floating is required (e.g., a primary CTA or a Modal), use an **"Environment Shadow"**:
    *   `box-shadow: 0 20px 40px rgba(35, 48, 44, 0.06);`
    *   The shadow is tinted with our `on-secondary` color, making it feel like a natural obstruction of light in the "greenhouse."
*   **The Ghost Border Fallback:** If a container sits on a background of identical color (for accessibility), use a `1px` stroke of `outline-variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`rounded-full`). Background: Gradient from `primary` to `primary_container`. Text: `on-primary` (White). No shadow on rest; soft ambient shadow on hover.
*   **Secondary:** Pill-shaped. Background: `secondary` (#54615d). Text: `surface`.
*   **Tertiary:** No background. Bold `primary` text with an arrow icon that shifts 4px on hover.

### Cards (The Signature Element)
*   **Hero Cards:** Use `secondary` (#23302C) backgrounds with `primary_container` (#10B981) accents. 
*   **Radius:** Always use `xl` (3rem/48px) for outer container corners and `lg` (2rem/32px) for internal nested elements. This "nested rounding" creates a sophisticated, custom-molded look.
*   **Content Separation:** Forbid divider lines. Use `32px` or `48px` vertical spacing to separate content blocks within a card.

### Chips & Badges
*   **Status Badges:** `primary_container` background with `on_primary_fixed` text. Pill-shaped only.
*   **Filter Chips:** `surface-container-high` background. On selection, morph to `secondary` with a slight bounce animation.

### Input Fields
*   **Soft Focus:** Fields use `surface-container-low` with no border. On focus, they do not gain a border; instead, they shift to `surface-container-lowest` (pure white) with a soft `primary` ambient glow.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use "Overlapping Layouts." Allow an image or a card to partially bleed over the edge of a section background to create depth.
*   **DO** use `secondary_container` for subtle call-out boxes within long-form text.
*   **DO** embrace white space. If you think there is enough space, add 16px more.

### Don't:
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#1b1c1a) to maintain the organic warmth.
*   **DON'T** use sharp corners. Anything smaller than `md` (1.5rem) should be reserved for the smallest utility icons.
*   **DON'T** use 1px dividers. If you need to separate content, use a tonal background shift or a "Ghost Border" at ultra-low opacity.