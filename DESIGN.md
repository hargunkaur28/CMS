# Design System Strategy: The Architectural Content Engine

## 1. Overview & Creative North Star: "The Digital Curator"
This design system moves away from the rigid, boxed-in layouts of traditional CMS platforms toward a "Digital Curator" aesthetic. The goal is to blend the technical precision of high-end engineering tools (Linear) with the clean, editorial breathing room of modern document editors (Notion). 

**The North Star:** We don't just display data; we frame content. By utilizing intentional asymmetry, deep atmospheric gradients, and ultra-refined typography scales, we create an environment that feels authoritative yet effortless. The interface should feel like a series of layered obsidian and silk sheets—structured but fluid.

---

## 2. Colors & Surface Philosophy
We define depth through light and tone rather than lines.

*   **The "No-Line" Rule:** 1px solid borders are prohibited for sectioning. Structural boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f2f4f6) section should sit on a `surface` (#f7f9fb) background to create a "soft-edge" division.
*   **Surface Hierarchy & Nesting:** Use surface-container tiers (Lowest to Highest) to create physical layers.
    *   **Level 0 (Base):** `surface` (#f7f9fb)
    *   **Level 1 (Cards):** `surface-container-lowest` (#ffffff)
    *   **Level 2 (In-card UI):** `surface-container` (#eceef0)
*   **The Atmospheric Sidebar:** The primary navigation utilizes a deep vertical gradient (`#0F172A` to `#1E1B4B`). This provides a "weighted anchor" for the eyes, allowing the main content area to feel lighter and more expansive.
*   **Signature Textures:** Main CTAs and the Global Progress Bar must use the "Signature Indigo Gradient" (`#4F46E5` to `#6366F1`) to provide visual soul and a sense of forward momentum.

---

## 3. Typography: Editorial Authority
The type system creates a clear distinction between "The Brand" (Headings) and "The Tool" (Body).

*   **The Display Scale (DM Sans):** Used for Headlines (`headline-lg` to `headline-sm`). Set at **600 weight**. This geometric sans-serif provides a premium, "tech-forward" personality.
*   **The Utility Scale (Inter):** Used for Body and Titles. Inter’s high x-height ensures maximum readability for dense content management tasks.
*   **Navigation Labels:** 10px `label-sm` (Inter), Uppercase, with `0.05em` letter tracking. Color: `on-secondary-container` (#5c647a). These should feel like metadata—secondary to the content but impeccably organized.

---

## 4. Elevation & Depth
We reject the "flat" web. We use physics-based layering.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` sections. The contrast between these two tokens creates a natural "lift" without the need for heavy outlines.
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a custom shadow: `0 4px 24px rgba(79, 70, 229, 0.08)`. The indigo tint in the shadow ensures the element feels integrated with the primary brand color rather than looking like a generic grey smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#c7c4d8) at **20% opacity**. Never use 100% opaque lines.
*   **Glassmorphism:** For overlays, use `surface-container-lowest` at 80% opacity with a `12px` backdrop-blur. This allows the atmospheric sidebar colors to bleed through, maintaining a sense of place.

---

## 5. Components

### Buttons & Interaction
*   **Primary:** Indigo Gradient (`#4F46E5` to `#6366F1`) with an `8px` (md) radius. Must include a subtle `inner-shadow: inset 0 1px 0 rgba(255,255,255,0.2)` to create a tactile, "pressed" high-end feel.
*   **Secondary:** `surface-container-highest` background with `on-surface` text.
*   **Tertiary:** Ghost style; no background, `primary` text, underlined only on hover.

### Cards & Containers
*   **The Signature Card:** Background: `#ffffff`. Radius: `16px` (xl). Border-top: `3px solid #4F46E5` (Primary Indigo).
*   **Dividers:** Prohibited. Use `spacing-6` (1.5rem) or `spacing-8` (2rem) to separate content sections.

### Navigation Elements
*   **Active State:** Use a `#1E293B` (Surface-Dark) pill-shaped background with a `2px` Indigo left-border accent.
*   **Global Progress:** A fixed `2px` indigo gradient bar at the absolute top of the viewport (`top: 0`).

### Inputs & Fields
*   **Text Inputs:** Use `surface-container-lowest` with a `1px` ghost border (`outline-variant` at 20%). On focus, the border-bottom should animate to `primary` (#4F46E5).
*   **Chips:** Use `secondary-container` with `on-secondary-container` text. Radius: `full`. No border.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. A wider left margin for content creates a "notational" feel that reduces cognitive load.
*   **Do** use the Spacing Scale strictly. Gaps should be intentional—either tight (`spacing-2`) for related data or expansive (`spacing-12`) for new sections.
*   **Do** use "Surface Tones" to highlight different functional areas (e.g., a darker `surface-dim` for a code snippet block).

### Don't:
*   **Don't** use 1px solid black or dark grey borders. They break the "editorial" flow.
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1e) to maintain a soft, premium contrast.
*   **Don't** use standard "drop shadows" with 0,0,0 hex codes. Always tint shadows with the primary indigo or surface-variant colors.
*   **Don't** clutter the card headers. Use the 10px tracked uppercase labels for metadata to keep the interface feeling professional and sparse.