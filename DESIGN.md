---
name: AFTER MIDNIGHT
description: Product-first multi-theme design system for a general gaming social platform and player card exchange hub. The theme switcher compares distinct UI directions, not simple recolors.
register: product
theme_count: 4
active_themes:
  - original-baseline
  - soft-midnight-lounge
  - paper-card-social
  - cyber-matchmaking-hub
core_rule: "Theme switching is not color switching. Each theme must change component language, card anatomy, interaction states, spacing rhythm, and surface treatment while preserving the same product skeleton."
---

# Design System: AFTER MIDNIGHT

## 1. Design Intent

AFTER MIDNIGHT is a general gaming social platform for player cards, teammate discovery, lobby events, and lightweight social interaction.

The design system must support product clarity first. Visual atmosphere should make the platform feel memorable, warm, and discussion-worthy, but it must not reduce usability.

This system exists to prevent a common AI failure mode: creating four theme buttons that only change color. Four themes must mean four interface directions.

## 2. Non-Negotiable Product Skeleton

The following sections and functions must remain available in every theme:

- Top navigation
- Player Plaza
- Name Card / Directory Plaza
- Profile / Player Card Editor
- Player cards
- Lucky Ally
- Admin Notes
- Lobby Events
- Search and filters
- Contact modal
- Copy/toast feedback
- Theme switcher
- Empty, loading, error, hover, active, focus, and disabled states

Do not delete, hide, or replace these with a pure landing page.

## 3. Theme Architecture

The current interface has four theme buttons. They should map to four different product UI prototypes.

### Theme 1: Original / Baseline

Purpose:
Keep the existing AFTER MIDNIGHT look as the control group. This theme is used for comparison.

Design behavior:
- Preserve the current layout, spacing, and card language.
- Only clean obvious inconsistencies.
- Do not over-polish into one of the experimental styles.
- This is the reference point for evaluating whether the other themes are genuinely different.

### Theme 2: Soft Midnight Lounge

Concept:
A late-night gaming lounge for calm teammate discovery. Mature, quiet, dark, soft, social, and atmospheric.

User feeling:
"I am entering a calm after-hours gaming lounge where I can find people who match my rhythm."

Surface language:
- Deep tinted background, not pure black.
- Large soft panels with subtle inner light.
- Lounge-like cards that feel like invitation cards or member cards.
- Soft bloom or ambient glow used sparingly.
- Low contrast decoration, high contrast text.

Card anatomy:
- Player cards should feel like premium lounge passes.
- Avatar/identity marker can sit in a soft lit capsule or circular badge.
- Player name and current intent should be prominent.
- Game tags should feel like quiet chips, not loud stickers.
- Contact CTA should feel calm but clearly clickable.

Buttons:
- Rounded pill buttons.
- Primary buttons use strong contrast against the dark surface.
- Secondary buttons use translucent fills and clear borders.
- Hover: slight lift and surface brightening.
- Active: pressed depth.
- Disabled: visible but subdued.

Forms:
- Dark elevated fields with visible labels.
- Focus state should use a clear ring or illuminated border.
- Helper and error text must be readable.

Navigation:
- Active tab should feel like a lit lounge sign or subtle underline glow.
- Hover should be calm and readable, not neon.

Background:
- One or two ambient gradients are acceptable.
- Do not use many floating bubbles.
- No RGB gamer lighting.

Motion:
- Smooth, slow, soft.
- Avoid bounce-heavy or flashy motion.

### Theme 3: Paper Card Social

Concept:
A player card exchange board. Warm paper, stickers, notes, tags, soft physical layering, and friendly social discovery.

User feeling:
"I am browsing a cozy board of player cards, like exchanging handmade game profile cards."

Surface language:
- Warm light background.
- Paper sheets, card stacks, note-like sections.
- Soft physical shadows.
- Slightly irregular or layered surfaces may be used, but keep alignment clean.
- Stickers and labels may appear as tags or badges.

Card anatomy:
- Player cards should feel like collectible social cards or profile notes.
- Use clear zones: identity, games, play style, message, tags, CTA.
- Tags may feel like stickers or label tape.
- Quotes can feel like handwritten note blocks, but text must remain readable.

Buttons:
- Soft pill or rounded rectangle.
- Primary CTA can feel like a paper label or stamp.
- Secondary buttons can be outlined tabs.
- Hover: slight paper lift.
- Active: pressed paper effect.
- Disabled: faded paper surface.

Forms:
- Fields may feel like paper input strips or form labels.
- Labels must be explicit.
- Error states can use a small red note or border, not aggressive alerts.
- Focus state should be obvious.

Navigation:
- Active tab can resemble a pinned label, folder tab, or selected note.
- Avoid hidden active states.

Background:
- Subtle paper grain or layered cards.
- Avoid decorative clutter behind text.

Motion:
- Gentle lift, small slide, soft fade.
- No excessive wobble.

### Theme 4: Cyber Matchmaking Hub

Concept:
A clean matchmaking interface for multi-game player discovery. Structured, technical, sharp, data-rich, but not cyberpunk neon.

User feeling:
"I am using a precise teammate matching system that helps me scan compatibility quickly."

Surface language:
- Structured panels.
- Sharper corners than other themes.
- Thin borders, grid lines, status lights, data rows.
- Controlled accent colors.
- No heavy neon, no RGB, no Blade Runner mood.

Card anatomy:
- Player cards should feel like compact profile data panels.
- Use rows, metadata chips, status indicators, compatibility cues.
- Game/platform/rank/playstyle should be scannable.
- CTA should be clear and system-like.

Buttons:
- More rectangular or lightly rounded.
- Primary buttons feel like action controls.
- Secondary buttons feel like interface tabs.
- Hover: border brightening or panel inversion.
- Active: selected system state.
- Disabled: reduced opacity with still-visible shape.

Forms:
- Structured labels and input rows.
- Focus state can use a technical outline or scanning border.
- Error state should be direct and precise.

Navigation:
- Active tab can use a segmented control, data tab, or selected panel state.
- Hover should show system affordance.

Background:
- Fine grid or subtle panel segmentation.
- Scanning lines are allowed only if very subtle.
- Avoid futuristic clutter that blocks reading.

Motion:
- Fast but controlled.
- Short transitions.
- Optional scan effect on loading, but must support reduced motion.

## 4. Theme Difference Matrix

Every theme must differ in at least these dimensions:

| Dimension | Original / Baseline | Soft Midnight Lounge | Paper Card Social | Cyber Matchmaking Hub |
|---|---|---|---|---|
| Background | Existing | Dark lounge atmosphere | Warm paper surface | Structured grid/panel surface |
| Card shape | Existing | Large soft lounge pass | Layered paper card | Data panel |
| Radius | Existing | Large rounded | Medium/organic rounded | Small/medium precise |
| Shadow | Existing | Soft glow/elevation | Paper lift/shadow | Minimal shadow, border hierarchy |
| Buttons | Existing | Calm pills | Label/stamp buttons | System controls |
| Tags | Existing | Muted chips | Stickers/labels | Data badges/status chips |
| Navigation | Existing | Soft lit active state | Folder/tab active state | Segmented/data active state |
| Forms | Existing | Dark illuminated fields | Paper form strips | Structured data inputs |
| Motion | Existing | Slow soft transitions | Gentle paper lift | Fast precise transitions |

If a proposed implementation cannot fill this matrix with visible differences, it is not a valid theme implementation.

## 5. Component System

### 5.1 Player Card

Required content:
- Avatar or identity marker
- Player name
- Current status or intent
- Game list
- Platform/playstyle/rank if available
- Short bio or quote
- Tags
- Contact/open action

Theme-specific expectations:
- Soft Midnight Lounge: lounge pass, premium profile card, soft glow.
- Paper Card Social: social note/card exchange, sticker tags.
- Cyber Matchmaking Hub: data panel, compact scanning, status indicators.

Do not simply reuse the same card with different color variables.

### 5.2 Lobby Event Card

Required content:
- Event title
- Game/category
- Date/time
- Participant count or availability
- Join action
- Status

Theme-specific expectations:
- Soft Midnight Lounge: evening event invitation.
- Paper Card Social: bulletin board event note.
- Cyber Matchmaking Hub: scheduled session row or mission card.

### 5.3 Profile / Card Editor

Required content:
- Clear sections
- Labels
- Helper text
- Inputs
- Save button
- Loading/success feedback
- Error state

Design requirements:
- Form labels must never disappear.
- Placeholder text is not a replacement for labels.
- Focus state must be visible.
- Field groups must be easier to scan than decorative backgrounds.
- Mobile layout must stack logically.

### 5.4 Search and Filters

Required behavior:
- Search input is visually prominent enough to find.
- Filter chips show selected/unselected states.
- Clear filter/reset action must be easy to locate.
- No-result state must explain what happened and suggest next steps.

### 5.5 Navigation

Required behavior:
- Current section must be obvious.
- Hover state must be visible.
- Active state must be distinct from hover.
- Mobile navigation must not feel like an afterthought.

### 5.6 Buttons

Button hierarchy:
- Primary: main next action
- Secondary: alternate action
- Ghost: low-emphasis action
- Danger: destructive or cautionary action
- Disabled: unavailable action
- Loading: action in progress

Every theme must define a different button feel. Do not only change fill color.

### 5.7 Tags and Badges

Use tags for:
- Games
- Platform
- Communication preference
- Play style
- Rank/level
- Availability
- Mood or social preference

Badges must be compact, readable, and theme-specific.

### 5.8 Modal and Toast

Modal:
- Must clearly show the player/contact context.
- Must preserve readability and focus management.
- Must have obvious close action.

Toast:
- Must confirm copy/save actions.
- Should be short and friendly.
- Must not block important content.

## 6. Typography

Use typography to support scanning.

Recommended hierarchy:
- Display: page/hero title
- Section title: plaza/editor/event blocks
- Card title: player name or event title
- Body: player intro, descriptions
- Label: field labels and compact UI text
- Mono: BattleTag, Discord handle, IDs, codes

Rules:
- Do not use decorative fonts for core data.
- Do not reduce body text below readable size.
- Labels should be compact but legible.
- Use line-height generously for bios and descriptions.

## 7. Spacing and Density

Each theme may use different density:

- Soft Midnight Lounge: more spacious, calm, larger panels.
- Paper Card Social: medium density, layered but readable.
- Cyber Matchmaking Hub: denser, more structured, optimized for scanning.

Do not let any theme become cramped on mobile.

## 8. Color and Contrast

Color is only one part of theme design.

Rules:
- Text contrast should target WCAG AA.
- Do not place low-opacity text on textured or glass backgrounds.
- Accent colors must identify actions or states, not decorate everything.
- Do not use color as the only indicator of selected/error/success states.

## 9. Motion and Interaction

All themes need interaction states:
- hover
- active
- focus-visible
- disabled
- loading
- selected
- empty
- error
- success

Motion rules:
- Use short transitions for usability.
- Use motion to confirm interaction, not to distract.
- Support `@media (prefers-reduced-motion: reduce)`.

Theme motion:
- Soft Midnight Lounge: slow fade, soft lift.
- Paper Card Social: paper lift, gentle slide.
- Cyber Matchmaking Hub: precise snap, scan/load micro-interaction.

## 10. Accessibility

Required:
- Visible focus rings.
- Keyboard navigability.
- Clear hit targets on mobile.
- No essential information conveyed by color alone.
- Readable text over all backgrounds.
- Reduced motion support.
- Empty/error states with clear wording.

## 11. Do

- Preserve product skeleton and all current flows.
- Build four visually distinct UI prototypes.
- Make theme differences visible in component anatomy.
- Improve card scanning and form usability.
- Keep the platform general gaming, not single-game.
- Use the current reference files as inspiration, not as layout replacements.
- Prefer reusable theme tokens and component variants.

## 12. Do Not

- Do not create three recolors of the same UI.
- Do not make floating bubbles the main theme difference.
- Do not only edit colors, shadows, and borders.
- Do not delete product sections.
- Do not replace the app with a portfolio or landing page.
- Do not make it Overwatch-only.
- Do not use loud RGB esports or cyberpunk neon.
- Do not hide labels or weaken contrast.
- Do not ignore mobile layout.
- Do not claim a theme is done before hover/focus/active/loading/empty/error states are handled.

## 13. AI Agent Workflow

Recommended workflow:

1. Read PRODUCT.md and DESIGN.md.
2. Identify the existing product skeleton.
3. Map the four theme buttons to the active themes.
4. Create or refine theme tokens.
5. Redesign core components per theme:
   - PlayerCard
   - EventCard
   - ProfileEditor
   - SearchFilter
   - Navigation
   - Button
   - Tag/Badge
   - Modal/Toast
6. Verify that themes differ beyond color.
7. Verify responsive behavior.
8. Run accessibility and contrast checks.

## 14. Acceptance Checklist

Before considering the work complete, verify:

- The four theme buttons switch between four visibly different UI systems.
- Removing color mentally, the themes still feel different.
- Player cards are structurally different across experimental themes.
- Forms are theme-specific and usable.
- Buttons and navigation states are theme-specific.
- Tags and badges are not identical recolors.
- Backgrounds support the theme without harming readability.
- Mobile layout is intentionally handled.
- WCAG contrast and focus states are checked.
- No product features were removed.

If these checks fail, continue with layout, component, and interaction changes before doing any more color work.
