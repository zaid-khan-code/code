# Design System Strategy: The Digital Sanctuary

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ethereal Archive."** 

We are moving away from the "SaaS-standard" look—characterized by rigid grids and heavy outlines—to create a space that feels like a high-end digital library or a curated editorial experience. This design system treats the interface as a physical sanctuary: quiet, spacious, and intellectually grounding. 

We break the "template" look through **Intentional Asymmetry**. Instead of perfectly centered content, we utilize wide gutters, offset headings, and overlapping surfaces. The desktop-first approach allows us to treat white space as a luxury material, giving HelpHub AI a sense of authoritative calm.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of organic, grounded tones designed to reduce cognitive load.

### The Token Palette (Material Convention)
*   **Primary (`#006c49` / `#10B981`):** Use for high-intent actions and meaningful badges.
*   **Secondary (`#54615d` / `#23302C`):** Our "Forest Green." Use for large hero typography and grounding elements.
*   **Surface (`#fbf9f5`):** The "Warm Off-White" canvas. It should feel like high-quality paper, not a digital screen.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited.** To section content, you must use **Tonal Transitions**. For example, a sidebar should not be separated by a line, but by transitioning from `surface` to `surface-container-low`. Boundaries are felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested layers.
*   **Base:** `surface` (The background).
*   **Sections:** `surface-container-low` (Subtle grouping).
*   **Active Cards:** `surface-container-lowest` (The brightest layer, appearing to "lift" toward the user).
*   **Interactive Overlays:** `surface-bright` (For floating menus).

### Glass & Signature Textures
To provide visual "soul," use **Glassmorphism** for floating navigation and tooltips. Use a `surface` color at 70% opacity with a `24px` backdrop-blur. 
*   **Signature Gradient:** For primary CTAs, apply a subtle linear gradient from `primary` to `primary-container`. This adds a three-dimensional depth that flat colors lack.

---

## 3. Typography
Our typography pairing is a dialogue between geometric modernism and functional elegance.

*   **Display & Headlines (Plus Jakarta Sans):** These are your "Editorial" voices. Use `display-lg` and `headline-lg` with tight letter spacing and bold weights. These should feel authoritative and architectural.
*   **Body & Titles (Manrope):** These are your "Functional" voices. Manrope's open apertures ensure readability. Use `body-lg` for primary reading and `title-sm` for UI labels.
*   **Visual Hierarchy:** Don't be afraid of the "Scale Gap." Pairing a `display-lg` headline with a `label-md` caption creates a high-fashion editorial contrast that signals premium quality.

---

## 4. Elevation & Depth
We define hierarchy through **Tonal Layering** rather than traditional structural lines.

*   **The Layering Principle:** Depth is achieved by stacking tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a natural, soft lift without the clutter of drop shadows.
*   **Ambient Shadows:** If an element must float (e.g., a modal), use an ultra-diffused shadow. 
    *   *Specs:* `Y: 20px, Blur: 40px, Opacity: 6%`.
    *   *Tinting:* Use a tinted version of `on-surface` (dark green-grey) instead of pure black to ensure the shadow feels like natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline-variant` token at **15% opacity**. It should be a suggestion of a border, not a declaration.
*   **Glassmorphism:** Use semi-transparent surface tokens for "floating" utility bars. This allows the sanctuary’s background colors to bleed through, making the UI feel integrated into the environment.

---

## 5. Components

### Buttons & Chips
*   **Primary Button:** Pill-shaped (`full` roundness). Use the signature gradient (Primary to Primary-Container). No shadow on rest; a soft ambient shadow on hover.
*   **Secondary/Tertiary:** Use `surface-container-high` backgrounds. Avoid "Outline" buttons; use "Ghost" buttons with `on-surface` text and a subtle background shift on hover.
*   **Chips:** Selection chips must use `XL` (3rem) roundness. Active states use `secondary-fixed`, creating a "pressed into the surface" look.

### Cards & Lists
*   **Standard Cards:** Use `xl` (3rem) roundness. Never use dividers. 
*   **List Items:** Separation is achieved through **vertical white space** (32px+) or a `10% opacity` background shift on hover. 
*   **AI Interaction Cards:** Use a subtle `surface-variant` background to distinguish AI-generated content from the "Sanctuary" content.

### Input Fields
*   **Design:** Floating labels using `label-md`. The input container should be a `surface-container-low` pill. 
*   **Focus State:** Instead of a heavy border, use a `2px` glow of `primary-fixed` and a background shift to `surface-container-lowest`.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Offset your hero text to the left and leave the right side for organic, floating AI elements.
*   **Prioritize Breathing Room:** If a section feels "busy," double the padding. This system relies on space to convey luxury.
*   **Use Subtle Animation:** Layers should slide in with a "soft-spring" easing to reinforce the Sanctuary feel.

### Don't:
*   **No Pure Black:** Never use `#000000`. Use `on-surface` or `secondary-fixed-variant` for text.
*   **No Sharp Corners:** Avoid any radius below `md` (1.5rem). Even small checkboxes should have a `sm` (0.5rem) radius.
*   **No "Flat" Buttons:** Buttons should always have either a subtle gradient or a tonal background shift to feel tactile.
*   **No Grid-Rigidity:** Avoid the "three-column card row" look where possible. Vary card widths or use staggered offsets to keep the layout feeling "custom-built."