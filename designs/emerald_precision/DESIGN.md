# Design System Documentation: Organic Precision

## 1. Overview & Creative North Star: "The Digital Sanctuary"
This design system is built to move away from the cold, mechanical nature of traditional AI interfaces. Our Creative North Star is **The Digital Sanctuary**. It represents a space where high-tech precision meets human-centric warmth. 

To achieve this, we reject the "standard grid" in favor of an **Editorial Layout** strategy. This means prioritizing generous negative space, intentional asymmetry, and overlapping elements that create a sense of three-dimensional depth. We are not building a dashboard; we are curating an experience that feels as intentional as a premium physical magazine.

## 2. Colors & Surface Architecture
The color strategy leverages a high-contrast relationship between deep botanical greens and a warm, paper-like background.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through:
1.  **Tonal Shifts:** Placing a `surface-container-low` (#f5f3ef) card on a `surface` (#fbf9f5) background.
2.  **Negative Space:** Using the spacing scale to let the eye define the edge.
3.  **Soft Shadows:** Ambient depth that implies a boundary without drawing a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered tactile sheets.
- **Base Layer:** `surface` (#fbf9f5) — The canvas.
- **Secondary Layer:** `surface-container-low` (#f5f3ef) — Used for large structural sections (e.g., a sidebar or a content grouping).
- **Elevated Layer:** `surface-container-lowest` (#ffffff) — Reserved for the highest-priority cards and interactive modules to provide "lift."

### Glass & Gradient Signature
To provide visual "soul," utilize the following:
- **Glassmorphism:** For floating navigation or modal overlays, use `surface` at 70% opacity with a `backdrop-blur` of 20px. 
- **Signature Glow:** Primary CTAs should use a subtle linear gradient from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle. This adds a "lithographic" quality that flat colors lack.

## 3. Typography: The Editorial Voice
Our typography creates a dialogue between geometric modernity and functional clarity.

- **Display & Headlines (Plus Jakarta Sans):** These are our "Statement" pieces. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. The geometric nature of Plus Jakarta Sans provides the "Precision" in "Organic Precision."
- **Body & Functional Text (Inter):** Inter is used for all long-form reading and UI labels. Its neutral, crisp personality ensures that the "Help" aspect of the brand feels trustworthy and legible.
- **Hierarchy Tip:** Always lean into high-contrast sizing. A `display-md` headline paired with a `label-md` category tag creates a sophisticated, high-end tension that feels custom-designed.

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines to separate ideas; we use light and shadow.

### The Layering Principle
Instead of a shadow, move an inner element from `surface-container` to `surface-container-highest`. This "step-up" in brightness mimics how light hits a physical object, creating a natural sense of hierarchy.

### Ambient Shadows
When an element must "float" (like a primary action button or a modal), use an **Ambient Tinted Shadow**:
- **Blur:** 40px to 60px.
- **Spread:** -10px.
- **Color:** Use `on-secondary-container` at 8% opacity. This introduces a hint of forest green into the shadow, making it feel integrated into the environment rather than a "dirty" grey spot.

### The Ghost Border Fallback
If accessibility requires a container edge (e.g., in high-glare environments), use a "Ghost Border": `outline-variant` (#bbcabf) at 15% opacity. It should be felt, not seen.

## 5. Components

### Buttons
- **Primary:** Pill-shaped (`full` roundedness). Background: `primary_container` (#10b981). Typography: `title-sm` (Inter, Bold). No border.
- **Secondary:** Pill-shaped. Background: `secondary` (#54615d). Text: `on_secondary` (#ffffff).
- **States:** On hover, do not use a stroke. Instead, increase the shadow spread and shift the background color 5% lighter.

### Cards
- **Radius:** `xl` (3rem/48px) for hero cards; `lg` (2rem/32px) for standard content cards.
- **Separation:** Absolutely no divider lines. Use `surface-container-low` backgrounds to group child elements within a card.

### Input Fields
- **Styling:** Soft `surface-container-highest` background with a `md` (1.5rem) corner radius. 
- **Focus State:** Instead of a blue ring, use a subtle "glow" effect—increase the ambient shadow and shift the background to `surface-container-lowest` (#ffffff).

### AI Interaction Modules (Specialty Component)
- **The Chat Surface:** Chat bubbles should not have tails. Use asymmetrical rounding (e.g., top-left, top-right, bottom-right at `xl`, bottom-left at `sm`) to indicate direction. 
- **The "Pulse" Badge:** When the AI is "thinking," use a `primary` (#006c49) pill badge with a soft, breathing shadow animation.

## 6. Do's and Don'ts

| Do | Don't |
| :--- | :--- |
| **Do** use asymmetrical margins to create an "Editorial" feel. | **Don't** align every single element to a rigid 12-column grid. |
| **Do** use `surface` shifts to separate the header from the body. | **Don't** use a 1px line to separate the header from the body. |
| **Do** use `xl` (3rem) corner radius for primary containers. | **Don't** mix sharp corners with rounded corners; keep it soft. |
| **Do** use high-opacity `on-surface` text for maximum legibility. | **Don't** use light grey text for body copy; it breaks "Trustworthiness." |
| **Do** allow elements to overlap (e.g., an image floating over two sections). | **Don't** trap elements in "boxes" that never touch or intersect. |