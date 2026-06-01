## ADDED Requirements

### Requirement: Save announcement changes to local file
The system SHALL provide a server-side action to save the updated list of 4 announcements into a local file at `src/data/announcements.json`.

#### Scenario: Save announcements from developer console
- **WHEN** user submits updated announcements form with valid data in developer console
- **THEN** the system SHALL write the content to `src/data/announcements.json` and return a success response

### Requirement: Load announcements on homepage dynamically
The `LotusWelcomeWidget` component SHALL fetch and load the announcements dynamically using a server action, falling back to the default built-in announcement array if the JSON file is empty or does not exist.

#### Scenario: Dynamic load announcements on widget mount
- **WHEN** the widget is mounted in client browser
- **THEN** it SHALL request announcements from the backend and populate the state to render updated values
