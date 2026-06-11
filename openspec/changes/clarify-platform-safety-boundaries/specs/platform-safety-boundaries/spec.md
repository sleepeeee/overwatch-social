# platform-safety-boundaries Specification

## ADDED Requirements

### Requirement: Legal pages explain player-facing safety boundaries

The system SHALL provide player-facing privacy and terms pages that describe data handling, platform responsibility, prohibited conduct, and station-offsite interaction risk without exposing unnecessary backend service brand names.

#### Scenario: User opens privacy policy

- **WHEN** a user visits `/privacy`
- **THEN** the page SHALL explain what player profile data may be collected
- **AND** the page SHALL warn users not to submit information they do not want strangers to see
- **AND** the page SHALL explain that the message field is not a private contact-information field
- **AND** the page SHALL explain that the gallery primarily exposes game IDs and player-card content for in-game friend discovery
- **AND** the page SHALL NOT list unnecessary backend service brand names.

#### Scenario: User opens terms of service

- **WHEN** a user visits `/terms`
- **THEN** the page SHALL state that AFTER MIDNIGHT is a player card display and exploration space
- **AND** the page SHALL state that the platform is not a matchmaking service, chat room, transaction platform, official game service, or dispute arbitration service
- **AND** the page SHALL state that offsite contact, grouping, trading, and player behavior are user responsibility.

### Requirement: Terms prohibit abuse and unsafe commercial conduct

The system SHALL publish rules that prohibit abuse, impersonation, privacy violations, malicious links, scams, and improper transaction routing through player cards.

#### Scenario: User reads prohibited conduct

- **WHEN** a user reads `/terms`
- **THEN** the page SHALL prohibit harassment, threats, hate, sexual content, scams, phishing, malicious links, impersonation, and publishing other people's personal information
- **AND** the page SHALL prohibit boosting, account selling, game currency trading, paid companionship routing, cash transactions, and other improper transaction routing.

#### Scenario: User reads moderation rights

- **WHEN** a user reads `/terms`
- **THEN** the page SHALL state that the site may hide player cards, remove content, restrict accounts, and handle reports when content appears risky or violates rules.

### Requirement: Footer exposes support and legal routes

The system SHALL expose support and legal links from the site footer.

#### Scenario: User views site footer

- **WHEN** a user views the footer
- **THEN** the footer SHALL include links to `/report`, `/privacy`, and `/terms`
- **AND** the current footer route SHALL use `aria-current="page"` for the active legal or report link.
