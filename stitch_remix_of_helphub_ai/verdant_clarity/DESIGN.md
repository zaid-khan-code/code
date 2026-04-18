# Design System Specification

## 1. Overview & Creative North Star: "The Digital Sanctuary"
This design system is built to move beyond the cold, clinical nature of standard AI platforms. Our Creative North Star is **The Digital Sanctuary**. This aesthetic combines the high-status authority of an editorial magazine with the calming, organic flow of a premium physical space. 

We break the "template" look by rejecting rigid grid lines and boxy containers. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. Elements should feel like they are resting on a surface rather than being trapped in a cage. By utilizing extreme corner radii (XL/2XL) and a palette of warm, forest-inspired tones, we create a UI that feels curated, approachable, and intelligently calm.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a sophisticated dialogue between deep forest greens and a warm, paper-like off-white.

### The "No-Line" Rule
**Strict Mandate:** Solid 1px borders are prohibited for sectioning or containment. Boundaries must be defined exclusively through:
1.  **Background Shifts:** Placing a `surface-container-low` component on a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts between `secondary_container` and `surface_variant` to define logical groupings.

### Surface Hierarchy & Nesting
Think of the UI as a series of stacked, premium cardstock layers.
*   **Base:** `surface` (#fbf9f5) is your canvas.
*   **Level 1 (Subtle Lift):** `surface_container_low` (#f5f3ef) for large background sections or secondary content areas.
*   **Level 2 (Active Components):** `surface_container` (#efeeea) for cards and primary content blocks.
*   **Level 3 (Interactive/Floating):** `surface_container_highest` (#e4e2de) for elements that require the user's immediate attention.

### The Glass & Gradient Signature
To elevate the "out-of-the-box" feel, use **Backdrop Blurs** (20px–40px) on floating navigation bars or AI chat overlays using semi-transparent `surface` tokens. For primary CTAs, do not use flat colors alone; apply a subtle linear gradient from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle to provide a "gemstone" depth.

---

## 3. Typography: Editorial Authority
We utilize a high-contrast typographic scale to create a sense of hierarchy and premium "breathing room."

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Statement" fonts. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) and bold weights to anchor the page. This geometric clarity conveys modern intelligence.
*   **Body & Labels (Manrope):** Chosen for its crisp legibility and technical precision. `body-lg` (1rem) should be used for all instructional text to maintain a professional, accessible tone.
*   **The Editorial Gap:** Always pair a `display-md` headline with a `body-lg` subtext, ensuring a generous margin-bottom (at least 2rem) to prevent the layout from feeling "crowded."

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty" and gray. This design system uses **Ambient Light Physics**.

*   **Ambient Shadows:** When a floating effect is required (e.g., a "hero" AI card), use a shadow with a 48px–64px blur at 6% opacity. The shadow color must be derived from the `on_secondary_container` (#596762) to maintain a warm, natural feel rather than a synthetic gray.
*   **The Layering Principle:** Instead of shadows, prioritize stacking. Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f5f3ef) background. The 2% difference in luminosity creates a sophisticated, "soft-touch" lift.
*   **The Ghost Border:** If a boundary is required for accessibility in input fields, use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a border that disappears into the background, maintaining the "No-Line" rule.

---

## 5. Components

### Buttons & Interaction
*   **Primary CTA:** Must be pill-shaped (`full` roundedness). Use the Primary Gradient. No border. Text should be `on_primary` (#ffffff) in `label-md` bold.
*   **Secondary/Ghost:** Pill-shaped. Use `surface_container_high` as a background with no border. This makes the button feel like it was "carved out" of the surface.

### Cards & Content Grouping
*   **Hero Cards:** Use the `secondary` (#54615d) or a custom forest green (#23302C) background. Apply `xl` (3rem) corner radius. Use `on_secondary` (white) text for high-contrast impact.
*   **Information Cards:** Prohibit the use of divider lines. Separate content using `title-sm` headings and vertical spacing (32px/48px).

### Input Fields
*   **Stateful Design:** Inputs should use `surface_container_low` as a base. Upon focus, do not use a heavy stroke. Instead, transition the background color to `surface_container_lowest` and apply a soft `primary` tinted ambient shadow.

### AI Floating Elements
*   **Glassmorphism Bubbles:** For AI suggestions or chat interfaces, use semi-transparent `surface_container_lowest` with a 30px backdrop blur. This allows the lush background colors of the dashboard to bleed through, making the AI feel integrated into the environment.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Generous White Space:** Treat white space as a design element, not "empty" space.
*   **Embrace Roundedness:** Use the `xl` (3rem) and `lg` (2rem) tokens for almost all container elements to reinforce the "Sanctuary" feel.
*   **Tonal Shifts:** Separate the sidebar from the main content using only a shift from `surface` to `surface_container_low`.

### Don't:
*   **Don't Use 1px Solid Borders:** This is the quickest way to make this premium system look "standard."
*   **Don't Use Pure Black (#000000):** Always use `on_surface` (#1b1c1a) for text to maintain the warm, organic atmosphere.
*   **Don't Use Sharp Corners:** Even small components like checkboxes should have a minimum of `sm` (0.5rem) rounding.