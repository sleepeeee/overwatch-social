## ADDED Requirements

### Requirement: Step button animation centering
The step buttons' background ripple animation (`animate-ping`) SHALL be centered exactly on the center of the active or hovered step button.

#### Scenario: Centering active animation
- **WHEN** step 1 is the active step
- **THEN** the `animate-ping` circle SHALL align perfectly with the border of the step 1 button, forming a concentric circle

### Requirement: Lotus icon alignment centering
The Lotus icon SVG SHALL be centered both horizontally and vertically inside its wrapper element without top offset.

#### Scenario: Rendering lotus icon
- **WHEN** the widget is rendered
- **THEN** the lotus SVG SHALL have equal padding/margin on all four sides inside its wrapper element

### Requirement: Layout vertical spacing and visual weight refinement
The announcement content (tag, title, message text) and the step buttons group SHALL be grouped into a single layout container that is visually pulled upward.

#### Scenario: Refined component spacing
- **WHEN** the widget displays announcement content and buttons
- **THEN** they SHALL be laid out compactly with uniform spacing, and the overall container SHALL have a negative margin top to pull it closer to the lotus icon, creating a lighter visual weight at the bottom of the card
