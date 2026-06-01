# APC Homepage Layout Aligner Spec

## Requirement: Segmented buttons switcher in APC Tools Homepage Aligner
The homepage alignment editor interface in APC Tools SHALL render a segmented buttons selector to switch between announcements 01, 02, 03, and 04.

### Scenario: Switching announcements in editor
- **WHEN** user clicks on the "公告 02" segmented button
- **THEN** the editor form below SHALL switch to display configurations and alignment fields of announcement 02

## Requirement: Save X Y offsets, scale, and font sizes parameters
The system SHALL provide Server Actions to save all alignment parameters (including X/Y offsets, scale, and font sizes) of the announcements into `src/data/announcements.json`.

### Scenario: Save alignment parameters
- **WHEN** user inputs custom offsets or font sizes and submits the form
- **THEN** the system SHALL update `src/data/announcements.json` file on the server and reload client paths

## Requirement: Render dynamic positioning and typography on home widget
The `LotusWelcomeWidget` component SHALL apply the alignments parameters (translate offsets, scale, and font-size) read from database/JSON dynamically via inline styles.

### Scenario: Applying alignment styles to home widget
- **WHEN** the user visits the home page and widget mounts
- **THEN** it SHALL apply the corresponding translate transform to icon, title, message text, and button group based on active announcement configurations

## Requirement: Custom image icon upload
The APC homepage aligner interface SHALL provide a file uploader to allow uploading custom icon images which replaces the default lotus SVG.

### Scenario: Uploading custom image icon
- **WHEN** user uploads a PNG image for announcement 01 and saves it
- **THEN** the home widget SHALL render an `<img>` tag with the uploaded image URL instead of the default lotus SVG when showing announcement 01

## Requirement: Block-based calibration controls with lock, reset, and alignment
The APC homepage aligner SHALL organize all alignment controls into independent section cards per element type (icon, tag, title, message, buttons).

### Scenario: Locking a section card
- **WHEN** user clicks the lock button on a section card
- **THEN** all sliders and numeric inputs within that card SHALL become disabled and visually dim to prevent accidental edits

### Scenario: Resetting a section card to defaults
- **WHEN** user clicks the reset button on a section card
- **THEN** all alignment values for that section SHALL revert to their defaults (e.g. icon_scale=100, font sizes to original, offsets to 0)

### Scenario: One-click horizontal alignment
- **WHEN** user clicks the left/center/right alignment button on a section card
- **THEN** the X offset for that section SHALL be set to -30px, 0px, or +30px respectively
