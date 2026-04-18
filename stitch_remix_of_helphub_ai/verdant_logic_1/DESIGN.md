# Design System Strategy: The Digital Greenhouse

## 1. Overview & Creative North Star: "Organic Precision"
This design system is a departure from the sterile, rigid grids of traditional SaaS. Our Creative North Star is **Organic Precision**. We are building a "Digital Greenhouse"—a space that feels breathable, living, and curated, yet underpinned by high-trust logic and architectural stability.

To move beyond a "template" look, we utilize **intentional asymmetry** and **editorial pacing**. High-impact typography scales and generous negative space create a sense of luxury. We avoid the "boxed-in" feeling of the web by eschewing traditional borders in favor of tonal layering and soft, ambient depth. The result is a high-end interface that feels as much like a premium printed journal as it does a functional digital tool.

---

### 2. Colors & The Tonal Architecture
The palette is rooted in a deep, botanical spectrum designed to convey growth and stability.

*   **Primary (`#006C49` / `#10B981`):** Represents vitality. Use the `primary_container` (#10B981) for high-action CTAs and badges. It should feel like a burst of sunlight through glass.
*   **Secondary (`#54615D` / `#23302C`):** Represents the soil and structure. Use the deep Forest Green for hero cards and authoritative text to anchor the composition.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for structural sectioning. Boundaries are defined solely through:
    *   **Background Shifts:** Transitioning from `surface` (#fbf9f5) to `surface_container_low` (#f5f3ef).
    *   **Nesting:** A `surface_container_lowest` (#ffffff) card sitting on a `surface_container` (#efeeea) section.
*   **Signature Textures:** For hero backgrounds or primary buttons, use a subtle radial gradient transitioning from `primary` to `primary_container`. This adds a "soul" to the color that flat hex codes cannot achieve.
*   **The Glass Rule:** For floating navigation or overlays, use `surface_container_lowest` with 80% opacity and a `24px` backdrop blur. This allows the "greenery" of the content to bleed through, softening the UI.

---

### 3. Typography: Editorial Authority
We pair the geometric confidence of **Plus Jakarta Sans** with the functional clarity of **Inter**.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "statement" pieces. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, modern masthead feel. 
*   **Body & Labels (Inter):** Inter provides the "Logic" in our "Verdant Logic" approach. It should be typeset with generous line-height (1.6 for body-lg) to ensure the sophisticated feel remains legible and calm.
*   **The Contrast Rule:** Use `secondary` for headlines to provide weight, and `on_surface_variant` (#3c4a42) for body text to reduce eye strain and maintain a natural, "ink-on-paper" look.

---

### 4. Elevation & Depth: Tonal Layering
In this system, depth is a physical property, not a stylistic effect. We use **Tonal Layering** to convey hierarchy.

*   **The Layering Principle:** Treat the UI as stacked sheets of fine, heavy-weight paper.
    *   **Level 0 (Base):** `surface`
    *   **Level 1 (Sub-sections):** `surface_container_low`
    *   **Level 2 (Cards/Content):** `surface_container_lowest` (Pure White)
*   **Ambient Shadows:** When an element must "float" (e.g., a dropdown or a high-priority modal), use a custom shadow: `0px 24px 48px rgba(35, 48, 44, 0.06)`. Note the color: we use a tint of our Secondary Forest Green, never pure black, to keep the shadow feeling "natural" and ambient.
*   **The Ghost Border Fallback:** For accessibility in input fields, use a `1px` stroke of `outline_variant` at **20% opacity**. It should be felt, not seen.

---

### 5. Components: The Physicality of Interaction

#### Buttons
*   **Primary:** Pill-shaped (`rounded-full`), using the `primary_container` background. Internal padding: `12px 28px`.
*   **Secondary:** Pill-shaped, using `secondary_container` with `on_secondary_container` text.
*   **Interaction:** On hover, buttons should not get darker; they should "lift" via a subtle increase in ambient shadow blur and a slight scale (1.02x).

#### Cards & Container Blocks
*   **Rounding:** Use `xl` (3rem/48px) for major hero cards and `lg` (2rem/32px) for standard content cards.
*   **Structure:** No dividers. Use `spacing-8` (32px) or `spacing-12` (48px) to separate content groups. If a visual break is needed, use a background shift to `surface_container_high`.

#### Chips & Badges
*   Used for categorization. Use `rounded-full` with `primary_fixed` (#6ffbbe) for a soft, luminous highlight.

#### Input Fields
*   **Base:** `surface_container_low` with `xl` (3rem) corner radius for a pill-style look that matches our buttons.
*   **Focus State:** Shift background to `surface_container_lowest` and apply a `2px` "Ghost Border" of `primary` at 30% opacity.

#### Signature Component: The "Greenhouse" Blur Card
*   A large card (`xl` rounding) using the `secondary` color as a background, but with a subtle top-down gradient. Inside, use `surface_container_lowest` with 10% opacity and high blur for nested elements.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** use asymmetrical layouts (e.g., a large headline on the left with body text shifted to the right column).
*   **Do** prioritize "Breathing Room." If you think there’s enough white space, add 16px more.
*   **Do** use the `xl` and `lg` rounding scales consistently to maintain the "soft" organic feel.

#### Don’t:
*   **Don’t** use 1px solid borders to separate list items. Use vertical space or a `surface_container_low` background on every other item (zebra striping).
*   **Don’t** use pure black (#000000) for anything. Even our darkest text is the Secondary Forest Green.
*   **Don’t** use "Default" shadows. If the shadow looks like a standard "drop shadow," it is too heavy. It should look like an ambient glow.