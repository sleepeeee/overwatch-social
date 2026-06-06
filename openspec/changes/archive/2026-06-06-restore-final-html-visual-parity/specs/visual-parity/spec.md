## ADDED Requirements

### Requirement: Final HTML Visual Parity

The public AFTER MIDNIGHT surfaces SHALL treat the supplied final HTML file as the fixed visual target rather than optional inspiration, while preserving existing product actions and developer-only entry points.

#### Scenario: Global navigation remains visually aligned and fixed

- **GIVEN** a visitor opens `/`, `/browse`, `/profile`, or `/share/:id`
- **WHEN** the visitor scrolls the page
- **THEN** exactly one global top navigation bar SHALL remain visible at the top of the viewport
- **AND** the navigation background SHALL use the AFTER MIDNIGHT deep cosmic glass treatment rather than a pure black or orange warning surface

#### Scenario: Non-home pages do not show the old bottom dock block

- **GIVEN** a visitor opens `/browse`, `/profile`, or `/share/:id`
- **WHEN** the page reaches its bottom area
- **THEN** the old floating dock and non-home footer block SHALL NOT appear
- **AND** the cosmic background SHALL remain visually continuous

#### Scenario: Studio locked state uses controlled theme iconography

- **GIVEN** a visitor opens `/profile` while not authenticated
- **WHEN** the locked studio prompt is rendered
- **THEN** the lock indicator SHALL be centered in a fixed-size theme container
- **AND** it SHALL NOT rely on an emoji glyph that can shift position between systems

#### Scenario: Overwatch directory filters match the active theme

- **GIVEN** a visitor opens `/browse` with Overwatch selected
- **WHEN** the Overwatch filter panel is shown
- **THEN** the panel SHALL label the inner filters as exploration frequency controls
- **AND** select arrows SHALL have consistent spacing from the right edge
- **AND** old hand-drawn decorative elements SHALL NOT appear in the Overwatch filter labels
