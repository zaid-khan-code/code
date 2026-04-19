# Design System Document: The Digital Sanctuary

## 1. Overview & Creative North Star
The vision for this design system is **"The Digital Sanctuary."** In an era of cognitive overload, this system acts as a high-end editorial retreat—a space that prioritizes breathing room, organic flow, and tactile depth. We are moving away from the rigid, "boxed-in" layout of traditional SaaS platforms. 

Instead of using lines to contain information, we use **Tonal Architecture**. The experience should feel like a physical desk arranged with premium stationery: overlapping surfaces, soft shadows, and intentional asymmetry that guides the eye naturally. This is not a "grid of boxes"; it is a composition of elements.

### The Editorial Edge
To achieve a premium feel, designers must embrace:
*   **Aggressive White Space:** Treat negative space as a functional element, not "empty" space.
*   **Asymmetric Balance:** Align key CTA clusters off-center to break the "template" look.
*   **Layered Surfaces:** Elements should feel like they are resting on top of one another, never flat against the background.

---

## 2. Colors & Surface Philosophy

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   Use `surface-container-low` (#f5f3ef) to define a section against the `surface` (#fbf9f5) background.
*   Use `surface-container-highest` (#e4e2de) for the most interactive or prominent card elements.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To create depth without borders:
1.  **Base:** `surface` (#fbf9f5)
2.  **Sectioning:** `surface-container-low` (#f5f3ef)
3.  **Component Background:** `surface-container-highest` (#e4e2de)
4.  **Floating Elements:** Use `surface-container-lowest` (#ffffff) with a soft shadow to create a "lifted" paper effect.

### The Glass & Gradient Rule
To add "soul" to the digital sanctuary, apply these techniques:
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface` at 80% opacity with a `24px` backdrop-blur. This keeps the user connected to the "sanctuary" below.
*   **Signature Gradients:** For primary CTAs, use a subtle linear gradient from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle. This adds a gemstone-like depth that flat colors lack.

---

## 3. Typography
The typography scale is designed to feel authoritative yet welcoming.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Editorial Moments." Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) and bold weights to anchor the page.
*   **Body & Labels (Manrope):** Chosen for its crisp, modern legibility. `body-lg` (1rem) should be the standard for all conversational AI responses to ensure comfort during long reading sessions.
*   **Hierarchy Tip:** Pair a `display-md` headline with a `label-md` uppercase sub-header (spaced 0.1em) for a high-end boutique aesthetic.

---

## 4. Elevation & Depth

### The Layering Principle
Avoid "drop shadow" defaults. Instead, "stack" the surface-container tiers. Placing a `surface-container-lowest` card on a `surface-container-low` background creates a natural, soft lift that feels integrated rather than "pasted on."

### Ambient Shadows
When a physical lift is required (e.g., a floating search bar):
*   **Blur:** 40px to 60px.
*   **Opacity:** 4% to 8%.
*   **Color:** Use a tinted version of the `on-surface` color (#1b1c1a) rather than pure black to keep the shadows feeling warm and organic.

### The "Ghost Border" Fallback
If a border is strictly required for accessibility (e.g., in a high-contrast mode), use a **Ghost Border**: the `outline-variant` token at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`rounded-full`). Background: Emerald Gradient. Text: `on-primary` (#ffffff).
*   **Secondary:** Pill-shaped. Background: `secondary_container` (#d7e6e0). No border.
*   **States:** On hover, primary buttons should scale slightly (1.02x) and increase shadow diffusion. Avoid harsh color flashes.

### Cards & Sanctuary Containers
*   **Rounding:** Use `xl` (3rem) for large hero sections and `md` (1.5rem) for nested cards.
*   **Separation:** Forbid divider lines. Use vertical white space (32px, 48px, or 64px) to separate content blocks. 

### Input Fields
*   **Style:** Minimalist. Use `surface-container-high` as the fill. 
*   **Focus State:** Do not use a high-contrast border. Instead, use a subtle "glow" using a 2px spread shadow in the `primary_container` color.

### AI Chat Bubbles (Specialty Component)
*   **User Message:** `secondary_container` (#23302C) with `on-secondary` (#ffffff) text. High roundness.
*   **AI Response:** `surface-container-lowest` (#ffffff) with an ambient shadow. This makes the AI feel like it is "presenting" information on a clean sheet of paper.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a text block on the left with a floating card offset to the right).
*   **Do** prioritize the "Emerald" (#10B981) color for moments of success, action, and growth.
*   **Do** use extreme corner radius (3rem) to reinforce the "Organic" feel.

### Don’t:
*   **Don't** use 1px solid dividers or borders. This shatters the "Sanctuary" aesthetic.
*   **Don't** use standard "Web Blue" for links. Use the Emerald `primary` token.
*   **Don't** crowd the layout. If you feel like you need a border to separate elements, you probably need more white space instead.
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#1b1c1a) to maintain the warm, premium tone.