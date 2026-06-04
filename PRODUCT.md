# Product: AFTER MIDNIGHT

## Register

product

AFTER MIDNIGHT must be treated as a product surface first and a brand surface second. The interface is an application for browsing, matching, editing, and contacting players. Brand atmosphere is important, but it must never override product clarity, form usability, card scanning, or interaction states.

## Product Summary

AFTER MIDNIGHT is a general gaming social platform and player card exchange hub. It helps players create personal gaming cards, browse other players, discover compatible teammates, join lightweight lobby events, and start low-pressure social interaction.

This is not:
- a portfolio site
- a pure landing page
- an Overwatch-only fan site
- a visual moodboard
- a color theme demo

## Core Product Jobs

Users should be able to complete these jobs quickly:

1. Understand what AFTER MIDNIGHT is.
2. Browse the player plaza.
3. Scan player cards and identify compatibility.
4. Search or filter by game, platform, play style, communication preference, rank, and availability.
5. Open or inspect a player card.
6. Create or edit their own player profile/card.
7. View lobby events or lightweight team-up opportunities.
8. Copy or reveal contact information through a clear modal/toast flow.
9. Switch between visual themes to compare style directions without losing product context.

## Users

Primary users are general gamers across FPS, MOBA, RPG, co-op, indie, party, casual, and competitive games.

Common user groups:
- Casual players looking for friendly teammates.
- Competitive players looking for stable partners without toxic pressure.
- Social players who want companionship and voice/chat compatibility.
- Multi-game players who do not want the platform to feel locked to one title.
- Mobile users who want quick scanning and lightweight interaction.
- Desktop users who want deeper browsing, filtering, and profile editing.

## Pain Points

Mainstream gaming communities often feel noisy, toxic, overly competitive, or too focused on rank. AFTER MIDNIGHT should create a calmer alternative where players can show personality, preferences, boundaries, play rhythm, and compatibility.

## Product Principles

### 1. Product-first, atmosphere-enhanced

The product must remain easy to use. Visual style should strengthen trust, warmth, and identity, but never hide information, weaken contrast, or make forms harder to complete.

### 2. Preserve the existing product skeleton

Do not remove current sections, pages, data, or flows. The current structure is the product skeleton.

Must preserve:
- Top navigation
- Player Plaza
- Card Directory / Name Card Plaza
- Profile / Card Editor
- Player cards
- Lucky Ally
- Admin Notes
- Lobby Events
- Search and filters
- Modals
- Toasts
- Theme switcher
- Empty, loading, error, hover, active, focus, disabled states

### 3. Visual theme switcher is not a color switcher

The theme switcher is for comparing different product UI directions. Each theme must have a distinct component language, not merely a different palette.

A valid theme changes:
- card anatomy
- border radius strategy
- elevation and shadow system
- button shape and hierarchy
- form field treatment
- navigation active state
- tag and badge style
- background material
- icon language
- spacing density
- hover/focus/active/loading behavior
- mobile card layout

An invalid theme only changes:
- background color
- text color
- accent color
- gradient
- a few floating bubbles
- decorative effects without component changes

### 4. Same content, different interface language

Every theme must preserve the same information and functions, but present them through a different visual system.

For example, a player card must always contain:
- avatar or identity marker
- player name
- games
- platform or play style
- rank/level if available
- short bio or quote
- tags
- contact action

But each theme should arrange and style those parts differently.

### 5. General gaming, not single-game branding

The platform should feel welcoming to multi-game players. Avoid visual systems that imply a specific game franchise, especially Overwatch. Do not use Blizzard-style orange/blue/black metal UI, sci-fi hero-shooter HUDs, or game-specific branding as the main identity.

### 6. Calm social space, not generic SaaS

Avoid both extremes:
- not loud RGB esports
- not sterile corporate SaaS

The desired feeling is a low-pressure late-night gaming community with clear product utility.

## Brand Personality

Tone:
- calm
- warm
- sincere
- safe
- lightly playful
- late-night
- human
- non-aggressive
- non-toxic

Three-word personality:
- Warm
- Safe
- Genuine

Emotional goal:
Players should feel that this is a place to find people who match their rhythm, not a place that pressures them to perform.

## Anti-References

Do not use:
- Overwatch-specific orange/blue/black/white metal styling
- Blizzard-style sci-fi panels
- high-saturation RGB esports visuals
- generic purple/blue SaaS gradients
- cold B2B dashboard aesthetics
- meaningless cards inside cards
- decorative bubbles as the only difference between themes
- unreadable glassmorphism
- excessive glow, particles, or motion
- portfolio/landing-page hero patterns that replace product function
- single-game fan-site framing

## Style Exploration Goal

The team is still deciding the final visual direction. The current task is to create multiple theme prototypes for discussion.

The purpose of the prototypes is comparison, not final branding.

Each prototype should answer:
- How does the player card feel?
- How does the profile editor feel?
- How does browsing feel?
- How does the theme communicate gaming/social identity?
- Is the product still easy to use?
- Does it feel clearly different from the other themes?

## Active Theme Set

The interface currently has four theme buttons. Use them as four product UI prototypes:

1. Original / Baseline
2. Soft Midnight Lounge
3. Paper Card Social
4. Cyber Matchmaking Hub

Do not turn buttons 2-4 into simple recolors of the same layout.

## Functional Acceptance Criteria

A theme implementation is successful only if:

- Cards look structurally different between themes.
- Buttons have theme-specific shape, density, and state treatment.
- Forms feel intentionally designed, not merely recolored.
- Navigation active/hover/focus states are theme-specific.
- Tags and badges have distinct visual systems.
- Background treatment changes the spatial feeling without harming readability.
- Mobile layout remains clean and usable.
- Accessibility is not sacrificed for atmosphere.
- The product skeleton remains intact.

## Accessibility and Inclusion

- Text contrast should target WCAG AA.
- Focus-visible states must be clear.
- Interactive elements must have obvious hover, active, disabled, and loading states.
- Motion must support `prefers-reduced-motion`.
- Mobile layout must avoid text overflow, tiny tap targets, and cramped card stacks.
- Empty states and error states must be friendly, explicit, and actionable.

## Implementation Guidance for AI Agents

Before coding, inspect existing sections and components. Identify the product skeleton first.

When modifying UI:
1. Preserve data and flows.
2. Create or refine design tokens per theme.
3. Refactor repeated UI patterns into reusable themeable component rules where possible.
4. Apply distinct component anatomy per theme.
5. Verify interaction states.
6. Verify responsive behavior.
7. Run accessibility and contrast checks.

Do not claim the theme system is complete if the themes only differ by color tokens.
