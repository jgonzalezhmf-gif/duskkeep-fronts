---
name: Duskkeep Fronts
description: Dark medieval fantasy tactics UI for a visual-first game alpha.
colors:
  void-bg: "#070911"
  obsidian-panel: "#0a0b12"
  iron-panel: "#141824"
  slate-panel: "#1b2130"
  parchment-text: "#e8ecf4"
  muted-text: "#9aa4b5"
  command-gold: "#f5c451"
  warm-gold-light: "#ffe4a8"
  ember-red: "#f05f72"
  ember-orange: "#ff9f67"
  arcane-violet: "#c084fc"
  mana-blue: "#7aa2ff"
  sky-cyan: "#65d2c8"
  reward-green: "#5dd39e"
  danger-red: "#ff6b6b"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.65rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  title:
    fontFamily: "ui-sans-serif, system-ui, Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.1
  body:
    fontFamily: "ui-sans-serif, system-ui, Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.65
  label:
    fontFamily: "ui-sans-serif, system-ui, Inter, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  chip: "9999px"
  sm: "14px"
  md: "20px"
  lg: "28px"
  xl: "38px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.command-gold}"
    textColor: "{colors.void-bg}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.obsidian-panel}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  panel:
    backgroundColor: "{colors.obsidian-panel}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.iron-panel}"
    textColor: "{colors.parchment-text}"
    rounded: "{rounded.chip}"
    padding: "6px 10px"
---

# Design System: Duskkeep Fronts

## 1. Overview

**Creative North Star: "The Living War Table"**

Duskkeep Fronts should feel like a tactical fantasy command table where every screen is part of the same world. Home is the map room, Combat is the clash scene, Adventure is the campaign route, and secondary systems are game locations, not detached app pages.

The visual system is dark, material, icon-forward and reward-driven. Screens should favor silhouettes, standees, cards, resource icons, landmarks, glows and readable states over text blocks. Panels are allowed, but they should feel like carved UI surfaces or stage plates, not dashboard modules.

Key characteristics:
- Dark medieval fantasy base with warm gold, cyan, ember and violet accents.
- Large, readable PNG icons for resources, nav, combat, cards, shop, fortress and progression.
- Full-art placeholder cards, hero standees, enemy units, tokens and reward reveals.
- Mobile-first density with compact labels and strong visual grouping.
- Motion as feedback: quick, purposeful, readable and reduced-motion aware.

## 2. Colors

The palette is a warm dark fantasy palette: near-black backgrounds, gold command accents, cyan ally energy, ember enemy pressure, violet arcane rewards and green success.

### Primary
- **Command Gold** (#f5c451): Primary CTA, important highlights, selected states, rewards and valuable resources.
- **Warm Gold Light** (#ffe4a8): High-emphasis text on gold surfaces, reward glow, premium accents.

### Secondary
- **Sky Cyan** (#65d2c8): Ally identity, safe fronts, active friendly states and healing-adjacent highlights.
- **Ember Red** (#f05f72): Enemy identity, damage, risk, breach pressure and hostile states.

### Tertiary
- **Arcane Violet** (#c084fc): Dust, arcane systems, tactics, magical rewards and premium mystery.
- **Mana Blue** (#7aa2ff): Rare states, navigation accents, cool magic and secondary clarity.
- **Reward Green** (#5dd39e): Success, claim, ready and positive completion states.

### Neutral
- **Void Background** (#070911): Global app background and deepest scene shadows.
- **Obsidian Panel** (#0a0b12): Dense UI surfaces, overlays and dark cards.
- **Iron Panel** (#141824): Common panel body and inactive button surface.
- **Slate Panel** (#1b2130): Raised card body and layered surface.
- **Parchment Text** (#e8ecf4): Primary text on dark surfaces.
- **Muted Text** (#9aa4b5): Secondary text and non-critical labels.

### Named Rules

**The Gold Rarity Rule.** Gold should mark player value: CTAs, command, rewards, selection and premium stock. If everything glows gold, nothing is valuable.

**The Side Identity Rule.** Ally and enemy combat states should remain visually distinct: cyan/green for ally support, ember/red for enemy pressure and damage.

## 3. Typography

**Display Font:** ui-sans-serif, system-ui, Inter, sans-serif
**Body Font:** ui-sans-serif, system-ui, Inter, sans-serif
**Label Font:** ui-sans-serif, system-ui, Inter, sans-serif

**Character:** The current typography is heavy, compact and game-HUD oriented. It uses high weight, tight leading and uppercase labels to give screens a tactical command feel.

### Hierarchy
- **Display** (900, clamp around 2rem to 3.65rem, 0.92 line-height): Page titles, major screen statements and hero section claims.
- **Title** (900, 1.125rem to 1.5rem, tight line-height): Card names, panel titles, offer titles and combat entity names.
- **Body** (500, 0.8125rem to 0.9375rem, 1.6 line-height): Short explanatory copy only where visual UI cannot carry the information.
- **Label** (900, 0.5625rem to 0.6875rem, uppercase, 0.14em to 0.22em tracking): Chips, state tags, metric names, resource labels and compact HUD text.

### Named Rules

**The Short Label Rule.** Labels should be compact and scannable. Prefer "Ready", "Breach", "Claim", "Front", "Core", "Owned" over long explanatory fragments.

**The Visual Beats Text Rule.** If a card, hero, reward or icon can communicate the meaning, text should confirm it, not repeat it.

## 4. Elevation

Duskkeep Fronts uses layered darkness, borders, glow and atmospheric shadows. Elevation is not flat SaaS card stacking; it should feel like objects lit inside a dark fantasy scene. Most shadows are large and soft, with occasional inner highlights to create carved metal or lacquered surfaces.

### Shadow Vocabulary
- **Scene depth** (`0 34px 92px rgba(0,0,0,0.36)`): Large hero panels and major screen stages.
- **Card lift** (`0 18px 42px rgba(0,0,0,0.22)`): Offer cards, deck cards, visual tiles and reusable cards.
- **Combat weight** (`0 22px 44px rgba(0,0,0,0.46)`): Standees, hero pieces and battle objects.
- **Reward glow** (`0 0 24px rgba(245,196,81,0.22)`): Selected, premium or valuable states.
- **Inner rim** (`inset 0 1px 0 rgba(255,255,255,0.08)`): Panel bevels and tactile surfaces.

### Named Rules

**The Object Weight Rule.** Important game objects need a base shadow or glow. Heroes, cards, resources and rewards should feel physically present.

**The No Nested Dashboard Rule.** Do not solve hierarchy by adding more panels inside panels. Use scale, position, light, icon size and scene composition first.

## 5. Components

### Buttons

- **Shape:** Rounded fantasy buttons, usually 18px to 24px for CTAs and pill-shaped for compact actions.
- **Primary:** Gold or green gradient surface, high contrast text, subtle inner highlight and hover lift.
- **Hover / Focus:** Small transform lift, border/glow increase, no bounce.
- **Secondary:** Dark iron surface with thin border and white text at reduced opacity.

### Chips

- **Style:** Compact uppercase pills with icon plus label when possible.
- **State:** Selected chips use gold/cyan tint; risk chips use ember/red; neutral chips stay dark and low-contrast.
- **Rule:** Chips should not become paragraphs. One concept per chip.

### Cards / Containers

- **Corner Style:** 24px to 38px for major cards and panels.
- **Background:** Layered gradients over dark panels, often with radial light pools.
- **Shadow Strategy:** Large soft shadow plus thin border and inner rim.
- **Internal Padding:** 12px to 24px depending on density.
- **Rule:** Cards that represent actual cards should use dominant art. Cards that represent panels should not compete with game pieces.

### Inputs / Fields

- **Style:** Dark filled surfaces with thin border and strong focus ring.
- **Focus:** Gold/cyan outline or glow, never only a subtle color shift.
- **Disabled:** Lower opacity, reduced saturation and no speculative hidden affordance.

### Navigation

- **Home:** Main world hub with large nav icons and landmarks.
- **Non-combat screens:** Must provide a clear Home return path unless intentionally modal or combat-specific.
- **Combat:** Can use custom battle chrome, but should still respect resource, icon and localization systems.

### Icons and Assets

- **Resources:** Gold, gems, dust and other resources should be among the most visible UI elements where shown.
- **Nav:** PNG icons should be large enough to read and not trapped inside redundant circles.
- **Combat:** Combat icons reduce text and clarify states, but should not saturate the battlefield.
- **Fallbacks:** Only load assets registered in manifests. Missing optional art must fall back without 404.

### Motion

- **Timing:** 100-150ms for press feedback, 200-300ms for state changes, 300-500ms for larger reveals.
- **Easing:** Use natural ease-out curves. Avoid bounce and elastic.
- **Reduced Motion:** Respect `html[data-motion="reduced"]` and `prefers-reduced-motion`.
- **Purpose:** Feedback, guidance, impact or delight. No ambient motion that competes with core readability.

## 6. Do's and Don'ts

### Do

- Use shared components and manifests before creating one-off UI.
- Let art, icons, standees, rewards and landmarks carry meaning.
- Keep Home, Adventure, Deck, Heroes, Shop, Fortress, Arena, Events and Missions visually connected.
- Keep Combat more like a battle scene than a dashboard.
- Make player resources visually desirable and easy to notice.
- Validate visible UI with browser screenshots after visual changes.
- Keep localization in `lib/i18n/dictionaries.ts` and use stable ids for data-driven text.

### Don't

- Do not add dashboard-style panel stacks when a scene composition would work.
- Do not hardcode speculative asset paths that can 404.
- Do not bury game rules or progression logic in JSX.
- Do not make text the primary carrier of combat, rewards or navigation meaning.
- Do not use bounce/elastic easing or long blocking animations.
- Do not redesign gameplay, economy, backend or combat rules during visual polish unless explicitly requested.
- Do not let old screens keep legacy nav/icons when shared systems exist.
