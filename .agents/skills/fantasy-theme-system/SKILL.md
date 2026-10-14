---
name: fantasy-theme-system
description: Comprehensive design system, CSS token architecture, custom SVG iconography conventions, and aesthetic extension workflow for DnD-Soundscape.
---

# DnD-Soundscape Fantasy Design System & Theme Engine

This skill guides the design, tokenization, aesthetic styling, and extension of unique high-fantasy themes in **DnD-Soundscape**. It eliminates generic "boilerplate" UI aesthetics in favor of immersive, tactile, tabletop-grade visual experiences.

---

## 1. Core Principles

1. **Centralized Theming (Zero Hardcoding):**
   - Components (modals, buttons, drawers, cards, badges, sliders) reference semantic design tokens (`--theme-*`).
   - No component should hardcode colors, border styles, or fonts.
   - All theme variations are activated via `data-theme="<theme-id>"` on `document.documentElement` or `document.body`.

2. **Tactile Tabletop Immersion:**
   - Every theme must possess physical texture, material presence (wood, stone, iron, marble, brass, leaf), and reactive lighting (glow, sparks, runes, ambient illumination).
   - Use multi-layer borders, subtle noise/grain patterns, and corner filigree accents.

3. **Vector Fantasy Iconography (No Raw OS Emojis):**
   - Operating system emojis render inconsistently and look cartoonish.
   - All iconography must use vectorized SVG fantasy glyphs defined in `FantasyIcons.js`.
   - Icons adapt to the active theme through CSS `fill: currentColor`, `stroke`, and drop-shadow glow filters.

---

## 2. Design Token Catalog Specification

Every theme must implement the complete token interface in `css/themes/`:

| Token Category | Token Variable | Purpose |
| :--- | :--- | :--- |
| **Surfaces** | `--theme-bg-base` | Root application background |
| | `--theme-bg-surface` | Glassmorphic panel / HUD backdrop |
| | `--theme-bg-card` | Container, modal window, drawer surface |
| | `--theme-bg-card-hover`| Hover state for cards and list items |
| | `--theme-bg-input` | Form controls, select dropdowns, search bars |
| | `--theme-bg-pattern` | Background texture (radial gradient, noise) |
| **Borders** | `--theme-border-base` | Structural borders for containers |
| | `--theme-border-highlight`| Primary metallic or glowing edge border |
| | `--theme-border-accent` | Secondary detail border |
| | `--theme-border-glow` | Box-shadow / filter illumination |
| | `--theme-radius-sm/md/lg`| Corner roundness profile (e.g., sharp vs curved) |
| **Colors** | `--theme-primary` | Main signature hue (e.g. Amber / Cyan / Gold) |
| | `--theme-secondary` | Secondary accent (Brass / Purple / Jade) |
| | `--theme-text-main` | High-readability body copy |
| | `--theme-text-muted` | Descriptive subtexts and attribution lines |
| | `--theme-text-accent` | Highlights, badges, active states |
| **Typography** | `--theme-font-title` | Display titles (e.g., MedievalSharp, Uncial Antiqua) |
| | `--theme-font-display` | Headings & branding (e.g., Cinzel, Cinzel Decorative) |
| | `--theme-font-body` | Clean, legible UI text (e.g., Outfit, Cormorant Garamond) |
| **Interactive** | `--theme-button-bg` | Button face gradient or solid fill |
| | `--theme-button-border`| Button border style and color |
| | `--theme-button-text` | Button text and icon color |
| | `--theme-button-shadow`| Tactile elevation shadow |
| | `--theme-slider-thumb` | Custom range knob style & color |
| | `--theme-slider-track` | Range input track fill |

---

## 3. The Three Canonical Fantasy Themes

### 1. Tavern ("The Cozy Hearth / Prancing Tankard")
- **Palette:** Dark aged timber (`#1f140e`), warm ember glow (`#f59e0b`), forged brass (`#d97706`), parchment paper (`#2a1e17`).
- **Textures:** Deep oak planks, forged iron strapwork, warm candlelight.
- **Accents:** Riveted brass corner brackets, wooden tab buttons, ale & hearth dividers.
- **Typography:** `MedievalSharp` + `Cinzel`.

### 2. Dungeon ("Obsidian Crypt / Underdark Cavern")
- **Palette:** Deep basalt granite (`#0a0c12`), bioluminescent cyan (`#00f0ff`), eldritch violet (`#a855f7`), spiked iron (`#334155`).
- **Textures:** Cracked wet slate, carved runestone, cold subterranean mist.
- **Accents:** Spiked chiseled borders, glowing runic glyph dividers, pulsing crystal buttons.
- **Typography:** `Uncial Antiqua` + `Cinzel Decorative`.

### 3. Elven ("Lothlórien Canopy / Silverleaf Spire")
- **Palette:** Twilight forest jade (`#061a14`), sunlit ivory marble (`#0d281e` / `#f0fdf4`), solar leaf gold (`#fbbf24`), luminous emerald (`#10b981`).
- **Textures:** Organic flowing vines, pearlescent stone, celestial starlight.
- **Accents:** Delicate filigree corners, golden leaf & lotus dividers, sweeping botanical buttons.
- **Typography:** `Cinzel Decorative` + `Cormorant Garamond` + `Outfit`.

---

## 4. How to Add a New Theme

1. Create `css/themes/theme-<name>.css`.
2. Define `[data-theme="<name>"] { ... }` implementing all variables from `theme-tokens.css`.
3. Register the stylesheet in `index.html`.
4. Register the theme metadata in `js/ui/ThemeCatalog.js` (ID, label, subtitle, tags, colors, preview CSS).
5. The Settings Modal and Theme Catalog will automatically render the new theme card with preview swatches and equip buttons!
