# Design System Specification: The Digital Sanctuary

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Digital Sanctuary."** In an era of high-friction, cluttered interfaces, this system acts as a high-end editorial retreat—organic, calm, and rooted in high-trust interactions. 

We move beyond the "template" look by rejecting traditional grid-bound constraints. Instead, we use **intentional asymmetry, expansive breathing room, and architectural layering**. The experience should feel less like software and more like a curated physical space where information is discovered, not forced.

### The Editorial Edge
To achieve a signature look, designers must prioritize "Spatial Breathing." Use the white space as a functional element to guide the eye. Overlap elements—such as a pill-shaped badge breaking the boundary of a container—to create a sense of bespoke craftsmanship rather than rigid, automated layouts.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated interplay between deep forest tones and vibrant botanical teals, grounded by a warm, paper-like neutral.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning or containment. 
Boundaries must be defined exclusively through:
1.  **Tonal Shifts:** Moving from `surface` (#fbf9f5) to `surface-container-low` (#f5f3ef).
2.  **Shadow Depth:** Utilizing ambient light to lift a surface.
3.  **Negative Space:** Using the spacing scale to create distinct visual groupings.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
*   **Base Layer:** `surface` (#fbf9f5).
*   **Sectioning:** `surface-container-low` (#f5f3ef) for subtle background shifts in large blocks.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) to provide a "lifted" feel against darker backgrounds.
*   **Signature Hero Sections:** Use `on_secondary_fixed` (#111e1a) for high-contrast, immersive headers.

### The Glass & Gradient Rule
For floating elements (modals, navigation bars, or dropdowns), utilize **Glassmorphism**. Use a semi-transparent `surface` color with a `backdrop-blur` (20px–40px). This allows the organic colors of the background to bleed through, softening the edges and making the UI feel integrated into the environment.

---

## 3. Typography
Our typography is a study in contrast: the geometric authority of **Plus Jakarta Sans** paired with the precision of **Inter**.

*   **Display & Headlines (Plus Jakarta Sans):** These are your architectural anchors. Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create a bold, editorial presence. This font conveys trust and modern intelligence.
*   **Body & Labels (Inter):** Inter provides the "crispness" required for AI-driven data. Use `body-md` as the standard for readability. 
*   **The Label Signature:** For `label-md` and `label-sm`, consider using uppercase with increased letter-spacing (0.05em) to denote "Metadata" or "Badges," creating a premium, categorized look.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "digital." We use **Ambient Shadowing** and **Tonal Stacking**.

### The Layering Principle
Depth is achieved by stacking surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. The minute difference in hex code creates a soft, natural lift that mimics fine stationery.

### Ambient Shadows
When a component must float (e.g., a primary CTA or a floating action button):
*   **Blur:** Use large values (30px to 60px).
*   **Opacity:** Keep it between 4% and 8%.
*   **Color:** Never use pure black. Use a tinted version of `on_surface` (#1b1c1a) to mimic natural light filtered through the forest canopy.

### The "Ghost Border" Fallback
If a border is legally or accessibility-required, use the **Ghost Border**: the `outline-variant` token at 15% opacity. Never use a 100% opaque border.

---

## 5. Components

### Buttons
All buttons follow a strict **Pill-Shape** (`rounded-full`).
*   **Primary:** `primary_container` (#10b981) background with `on_primary_container` (#00422b) text. Use a subtle linear gradient (Top: #10B981, Bottom: #059669) for a "soulful" polish.
*   **Secondary:** `surface_container_highest` background with `on_surface` text.
*   **Tertiary:** No background; use `primary` (#006c49) text with a bold weight.

### Cards & Containers
*   **Roundness:** Use `xl` (3rem) for primary landing page cards and `lg` (2rem) for internal dashboard cards.
*   **Separation:** **Forbid divider lines.** Separate list items using `surface-container` shifts or 24px–32px of vertical whitespace.

### Input Fields
*   **Style:** Use a soft-filled style rather than an outlined style.
*   **Background:** `surface-container-high` (#eae8e4).
*   **Focus State:** Transition to `surface-container-lowest` with a subtle 2px soft "glow" (ambient shadow) in the `primary` teal hue.

### Signature Component: The Sanctuary Badge
A small, pill-shaped chip used for AI status or categories. Use `primary_container` at 10% opacity with a solid `primary` text color. It should feel like a soft glow on the page.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace extreme whitespace. High-end design requires room to breathe.
*   **Do** use asymmetrical layouts (e.g., a left-aligned headline with a right-aligned floating image).
*   **Do** use "surface-on-surface" layering to define hierarchy.

### Don’t:
*   **Don’t** use 1px solid borders. It shatters the "Sanctuary" feeling.
*   **Don’t** use pure black (#000000). Use `secondary` (#23302C) for high-contrast text.
*   **Don’t** use standard "Material Design" shadows. Keep them wide, soft, and barely visible.
*   **Don’t** crowd components. If it feels tight, double the padding.