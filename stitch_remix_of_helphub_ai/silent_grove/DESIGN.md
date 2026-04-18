# Design System: The Digital Sanctuary

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Digital Sanctuary."** In an era of cluttered, high-frequency interfaces, this system acts as a serene, organic retreat. It rejects the rigid, boxy constraints of traditional web "templates" in favor of an editorial experience that feels curated and intentional. 

To achieve this, we move beyond standard grids. We utilize **intentional asymmetry**, where large hero elements may overlap containers, and **high-contrast typography scales** that guide the eye with authority. This is not just a utility; it is an environment designed to foster trust through breathing room, soft transitions, and a sophisticated color story.

---

## 2. Colors & Tonal Logic
Our palette is anchored by a warm, off-white canvas (`#fbf9f5`) and a deep forest-green secondary (`#23302c`). The primary emerald (`#10b981`) is used sparingly as a "pulse" of energy for actions.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through:
*   **Background Color Shifts:** Placing a `surface_container_low` section against a `surface` background.
*   **Tonal Transitions:** Using soft gradients or subtle shifts in value to indicate where one thought ends and another begins.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper. 
*   **Base:** `surface` (#fbf9f5) is your floor.
*   **Elevated Sections:** Use `surface_container_low` for large content areas.
*   **Floating Elements:** Use `surface_container_lowest` (pure white) for cards to create a natural, soft "lift" against the off-white background.

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat," use Glassmorphism for floating navigation or overlay modals. 
*   **Token:** Use semi-transparent `surface` colors with a `backdrop-blur` of 20px–40px. 
*   **Signature Textures:** For primary CTAs, do not use a flat fill. Apply a subtle linear gradient from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle to provide "soul" and depth.

---

## 3. Typography: Editorial Authority
We pair the geometric confidence of **Plus Jakarta Sans** with the crisp, humanistic clarity of **Manrope**.

*   **Display & Headlines (Plus Jakarta Sans):** These should be bold and oversized. Use `display-lg` (3.5rem) to create moments of impact. The tight tracking and geometric shapes convey modern stability.
*   **Body & Titles (Manrope):** All functional text uses Manrope. It provides a neutral, high-legibility counterpart to the headlines.
*   **Hierarchy as Navigation:** Use extreme scale differences. A `display-md` headline followed by `body-md` text creates a clear, sophisticated entry point for the user’s eyes without needing icons or arrows.

---

## 4. Elevation & Depth
In this system, depth is a feeling, not a structure. We use **Tonal Layering** instead of traditional shadows.

### The Layering Principle
Hierarchy is achieved by "stacking." A `surface_container_highest` element should never sit directly on a `surface_lowest` element without an intermediate layer. This creates a natural progression of depth that feels organic.

### Ambient Shadows
When an element must "float" (e.g., a primary card or dropdown):
*   **Blur:** 40px to 60px.
*   **Opacity:** 4%–8%.
*   **Color Tint:** Never use pure black. Use a tinted version of `on_secondary_container` (#596762). This mimics natural light passing through a forest canopy.

### The "Ghost Border" Fallback
If accessibility requirements (WCAG) demand a container edge, use a **Ghost Border**:
*   **Token:** `outline_variant` (#bbcabf) at 15% opacity. This provides a "hint" of an edge without breaking the serene flow of the sanctuary.

---

## 5. Components

### Buttons
*   **Primary:** Pill-shaped (`full` roundness). Gradient fill (Primary to Primary Container). High-contrast `on_primary` (White) text.
*   **Secondary:** Pill-shaped. `surface_container_high` background with `secondary` text. No border.
*   **Interaction:** On hover, increase the ambient shadow spread and subtly shift the gradient angle.

### Cards
*   **Radius:** Always `xl` (3rem) for large hero cards and `lg` (2rem) for standard content cards.
*   **Structure:** No dividers. Use `title-lg` and `body-md` with generous vertical spacing (at least 24px) to separate content.

### Input Fields
*   **Style:** Soft-filled `surface_container_low`. 
*   **Shape:** `md` roundness (1.5rem) to differentiate from the "pill" buttons. 
*   **States:** On focus, the background shifts to `surface_container_lowest` with a subtle `primary` "Ghost Border" at 20% opacity.

### Lists
*   **Forbidden:** 1px horizontal dividers.
*   **Alternative:** Use `surface_container_low` on alternating items or simply 32px of vertical whitespace. This maintains the "Sanctuary" feel of openness.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Whitespace:** If a section feels "busy," double the padding. The sanctuary requires room to breathe.
*   **Asymmetric Layouts:** Offset images and text blocks. Let a photo break the container's edge to create a high-end editorial feel.
*   **Tonal Consistency:** Always check that `on_surface` text sits on a `surface` variant for maximum readability.

### Don't:
*   **Don't use pure black (#000):** It is too harsh for the sanctuary. Use `secondary` (#23302C) for high-contrast text.
*   **Don't use sharp corners:** Even "small" components like checkboxes should have a `sm` (0.5rem) radius.
*   **Don't "Box" the Content:** Avoid headers that stretch 100% width with a solid background. Let the background flow behind the navigation.

### Accessibility Note:
While we avoid hard lines, always ensure our `primary` and `secondary` color combinations meet a minimum 4.5:1 contrast ratio against our `surface` tiers. High-end design should never be an obstacle to inclusivity.