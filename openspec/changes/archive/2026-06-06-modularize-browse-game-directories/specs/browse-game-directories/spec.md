## ADDED Requirements

### Requirement: Browse Page Game Directory Separation

The browse page SHALL act as a game-directory shell, while each game-specific directory owns its own search and filter controls.

#### Scenario: Outer browse shell only selects game

- **GIVEN** a visitor opens `/browse`
- **WHEN** the directory shell is rendered
- **THEN** the outer shell SHALL provide game selection only
- **AND** it SHALL NOT render Overwatch-specific search, server, role, or voice filters outside the Overwatch directory

#### Scenario: Overwatch filters are isolated

- **GIVEN** the visitor selects Overwatch in `/browse`
- **WHEN** the Overwatch directory is shown
- **THEN** Overwatch search, server, role, and voice filters SHALL be rendered inside the Overwatch-specific directory
- **AND** future Valorant or League directory changes SHALL NOT require editing Overwatch-specific filter state

#### Scenario: Game-specific directory styling uses final theme language

- **GIVEN** a visitor opens the Overwatch directory
- **WHEN** filter controls, empty states, or load-more controls are rendered
- **THEN** those controls SHALL use the AFTER MIDNIGHT obsidian cosmic theme
- **AND** old paper-card or hand-drawn filter styling SHALL NOT appear
