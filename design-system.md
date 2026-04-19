# Design System Analysis

Extracted from 10 reference images in `requriments/` folder.

---

## 1. Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#F59E0B` | Primary buttons, active nav items, accents, points badges |
| `--color-primary-hover` | `#D97706` | Button hover states |
| `--color-primary-light` | `#FEF3C7` | Light amber backgrounds, highlight areas |

### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-page` | `#F3F4F6` | Page background (light gray) |
| `--color-bg-card` | `#FFFFFF` | Card backgrounds, modal backgrounds |
| `--color-bg-sidebar` | `#FFFFFF` | Sidebar background |
| `--color-border` | `#E5E7EB` | Card borders, input borders, table borders |
| `--color-border-light` | `#F3F4F6` | Subtle dividers |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#111827` | Headings, primary text |
| `--color-text-secondary` | `#6B7280` | Secondary text, placeholders, timestamps |
| `--color-text-muted` | `#9CA3AF` | Disabled states, subtle labels |
| `--color-text-white` | `#FFFFFF` | Text on primary buttons, dark backgrounds |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10B981` | Success states, active status badges |
| `--color-success-light` | `#D1FAE5` | Success background tint |
| `--color-danger` | `#EF4444` | Delete buttons, danger actions, error states |
| `--color-danger-light` | `#FEE2E2` | Danger background tint |
| `--color-warning` | `#F59E0B` | Warning states (shares primary) |
| `--color-info` | `#3B82F6` | Info badges, links |

### Status Badge Colors
| Status | Background | Text |
|----------|------------|------|
| Active | `#D1FAE5` | `#059669` |
| Inactive | `#F3F4F6` | `#6B7280` |
| Pending | `#FEF3C7` | `#D97706` |

---

## 2. Typography

### Font Family
- **Primary**: System UI stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Page Title) | 24px | 700 (Bold) | 1.2 | -0.02em |
| H2 (Section Title) | 20px | 600 (Semibold) | 1.3 | -0.01em |
| H3 (Card Title) | 18px | 600 (Semibold) | 1.4 | 0 |
| H4 (Subtitle) | 16px | 600 (Semibold) | 1.4 | 0 |
| Body Large | 16px | 400 (Regular) | 1.5 | 0 |
| Body | 14px | 400 (Regular) | 1.5 | 0 |
| Body Small | 13px | 400 (Regular) | 1.5 | 0 |
| Caption | 12px | 400 (Regular) | 1.4 | 0.01em |
| Label | 12px | 500 (Medium) | 1.4 | 0.02em |
| Button | 14px | 500 (Medium) | 1 | 0.01em |
| Nav Item | 14px | 500 (Medium) | 1 | 0 |

### Typography Patterns
- **Page titles**: 24px bold, dark text (`#111827`)
- **Card titles**: 16px semibold
- **Labels**: 12px medium, uppercase, muted color
- **Stats numbers**: 32px bold for large metrics

---

## 3. Card Styles

### Standard Card
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

### Card Variants
| Variant | Differences |
|---------|-------------|
| `.card-flat` | No shadow, border only |
| `.card-hover` | Adds `shadow: 0 4px 6px rgba(0,0,0,0.1)` on hover |
| `.card-highlight` | Border-left: 4px solid `#F59E0B` |

### Stat Card (Dashboard)
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 12px
Padding: 20px
Icon Container: 48px × 48px, border-radius 12px, bg #FEF3C7
Icon Color: #F59E0B
Label: 14px, #6B7280
Value: 32px bold, #111827
```

### User Card (List Items)
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 10px
Padding: 16px
Avatar: 40px × 40px, border-radius 50%
Layout: Flex row, space-between
```

---

## 4. Button Styles

### Primary Button
```
Background: #F59E0B
Text: #FFFFFF
Border Radius: 8px
Padding: 10px 20px
Font: 14px medium
Hover: Background #D97706
Active: Transform scale(0.98)
```

### Secondary Button
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Text: #374151
Border Radius: 8px
Padding: 10px 20px
Hover: Background #F9FAFB
```

### Danger Button
```
Background: #EF4444
Text: #FFFFFF
Border Radius: 8px
Padding: 10px 20px
Hover: Background #DC2626
```

### Ghost Button
```
Background: transparent
Text: #6B7280
Border Radius: 6px
Padding: 8px
Hover: Background #F3F4F6
```

### Icon Button
```
Size: 36px × 36px
Border Radius: 8px
Background: transparent or #F3F4F6
Icon Size: 18px
Hover: Background #E5E7EB
```

### Button Sizes
| Size | Padding | Font Size |
|------|---------|-----------|
| Small | 6px 12px | 12px |
| Medium | 10px 20px | 14px |
| Large | 14px 28px | 16px |

---

## 5. Input Styles

### Text Input
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 8px
Padding: 10px 14px
Font Size: 14px
Height: 44px

Focus State:
- Border: #F59E0B
- Box Shadow: 0 0 0 3px rgba(245, 158, 11, 0.1)
- Outline: none

Placeholder: #9CA3AF
```

### Search Input
```
Includes search icon (left side)
Padding-left: 40px (for icon)
Icon color: #9CA3AF
Same styling as text input
```

### Select/Dropdown
```
Same base as text input
Chevron icon on right side
Padding-right: 40px
Dropdown panel: bg #FFFFFF, border #E5E7EB, radius 8px, shadow
```

### Textarea
```
Min Height: 100px
Resize: vertical
Same border/focus styling
```

### Checkbox
```
Size: 18px × 18px
Border: 1px solid #D1D5DB
Border Radius: 4px
Checked: bg #F59E0B, border #F59E0B, white checkmark
```

### Form Label
```
Font Size: 14px
Font Weight: 500
Color: #374151
Margin Bottom: 6px
```

### Form Group Spacing
```
Gap between fields: 16px
```

---

## 6. Spacing Patterns

### Base Unit: 4px

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Inline spacing, small gaps |
| `--space-3` | 12px | Component internal padding |
| `--space-4` | 16px | Standard spacing between elements |
| `--space-5` | 20px | Card padding, section gaps |
| `--space-6` | 24px | Larger component padding |
| `--space-8` | 32px | Section padding |
| `--space-10` | 40px | Page-level spacing |
| `--space-12` | 48px | Large section gaps |

### Common Patterns
- **Card padding**: 20px-24px
- **Form field gaps**: 16px
- **Button group gaps**: 8px-12px
- **List item gaps**: 12px
- **Section gaps**: 24px-32px
- **Page padding**: 24px

---

## 7. Layout Patterns

### Page Layout
```
Background: #F3F4F6
Min Height: 100vh
Padding: 24px
```

### Sidebar Layout
```
Width: 260px
Background: #FFFFFF
Border Right: 1px solid #E5E7EB
Padding: 20px 0

Nav Item:
- Padding: 12px 20px
- Margin: 2px 12px
- Border Radius: 8px
- Active: bg #FEF3C7, text #D97706
- Inactive: text #6B7280
```

### Main Content Area
```
Margin Left: 260px (when sidebar present)
Padding: 24px
Max Width: calc(100% - 260px)
```

### Grid Patterns
| Pattern | Columns | Gap |
|---------|---------|-----|
| Stats Row | 4 equal | 24px |
| Card Grid | 3 columns | 24px |
| User Cards | 1 column (stacked) | 12px |
| Form 2-col | 2 columns | 16px |

### Container Widths
| Container | Max Width |
|-----------|-----------|
| Full | 100% |
| Large | 1200px |
| Medium | 800px |
| Small | 480px (modals, login) |

---

## 8. Modal/Dialog Styles

### Modal Overlay
```
Background: rgba(0, 0, 0, 0.5)
Backdrop Filter: blur(2px)
Z-index: 50
```

### Modal Container
```
Background: #FFFFFF
Border Radius: 12px
Max Width: 480px (standard), 640px (large)
Width: 90% (mobile)
Box Shadow: 0 20px 25px -5px rgba(0,0,0,0.1)
```

### Modal Header
```
Padding: 20px 24px
Border Bottom: 1px solid #E5E7EB
Title: 18px semibold
Close Button: Top right, ghost style
```

### Modal Body
```
Padding: 24px
```

### Modal Footer
```
Padding: 16px 24px
Border Top: 1px solid #E5E7EB
Layout: Flex, justify-end, gap 12px
```

### Confirmation Modal (Delete)
```
Icon: Alert triangle, 48px, color #EF4444
Icon Container: 80px × 80px, bg #FEE2E2, rounded-full
Title: "Are you sure?" centered
Text: Centered, muted color
Buttons: Side by side, cancel left, danger right
```

---

## 9. Table Styles

### Table Container
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 12px
Overflow: hidden
```

### Table Header
```
Background: #F9FAFB
Border Bottom: 1px solid #E5E7EB
Padding: 12px 20px
Font: 12px medium, uppercase, #6B7280, letter-spacing 0.05em
```

### Table Row
```
Border Bottom: 1px solid #E5E7EB
Padding: 16px 20px
Hover: Background #F9FAFB
```

### Table Cell
```
Vertical Align: middle
Text: 14px, #111827
```

### Status Badge (in table)
```
Padding: 4px 10px
Border Radius: 9999px (pill)
Font Size: 12px
Font Weight: 500
```

### Table Actions
```
Button Group: Flex row, gap 8px
Edit Button: Ghost with pencil icon
Delete Button: Ghost with trash icon, red on hover
```

---

## 10. Component-Specific Patterns

### Points Badge
```
Background: #FEF3C7
Text: #D97706
Padding: 4px 10px
Border Radius: 6px
Font: 14px semibold
Display: Inline-flex with icon
```

### Avatar
```
Sizes:
- Small: 32px (table rows)
- Medium: 40px (cards)
- Large: 64px (profile header)
- XL: 96px (profile page)

Border Radius: 50%
Background: #E5E7EB (placeholder)
Border: 2px solid #FFFFFF (with shadow)
```

### Medal/Rank Badges (Leaderboard)
```
Rank 1: Gold circle, crown icon
Rank 2: Silver circle
Rank 3: Bronze circle
Size: 32px diameter
Font: 14px bold
```

### Empty State
```
Icon: 64px, muted color
Title: 16px semibold, centered
Text: 14px, muted, centered
Padding: 48px
```

### Loading State
```
Skeleton: Animated pulse, bg #E5E7EB
Border Radius: 4px (text), 8px (cards)
```

---

## 11. Chart Styles

### Line Chart
```
Line Color: #F59E0B
Line Width: 2px
Area Fill: rgba(245, 158, 11, 0.1)
Grid Lines: #E5E7EB, dashed
Axis Text: 12px, #6B7280
```

### Chart Container
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border Radius: 12px
Padding: 20px
Height: 300px (standard)
```

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, sidebar becomes drawer |
| Tablet | 640px - 1024px | 2-column grids, reduced sidebar |
| Desktop | > 1024px | Full layout, all features |

---

## Summary

**Primary Theme**: Clean, modern admin dashboard with amber/orange accent color

**Key Characteristics**:
- Rounded corners (8px-12px) throughout
- Subtle shadows for depth
- Consistent 4px spacing grid
- Card-based content organization
- Clear visual hierarchy with typography scale
- Status-driven color coding
- Accessible focus states with amber ring
