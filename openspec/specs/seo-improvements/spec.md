# seo-improvements Specification

## Purpose
TBD - created by archiving change seo-improvements. Update Purpose after archive.
## Requirements
### Requirement: Canonical URL Support
The system SHALL append a canonical URL tag to all pages in the document head.

#### Scenario: Server render layout
- **WHEN** user visits any page on the site
- **THEN** the HTML head contains a `<link rel="canonical" href="https://aftermidnight-gg.vercel.app..."/>` tag pointing to the current page's absolute URL path.

### Requirement: Independent Page Metadata Support
The system SHALL serve page-specific title and description tags for search engine bots.

#### Scenario: Restructure browse page
- **WHEN** search bot requests the `/browse` page
- **THEN** the initial HTML contains a title matching "玩家名片廣場 | After Midnight" and a description matching the browse directory description.

#### Scenario: Restructure profile page
- **WHEN** search bot requests the `/profile` page
- **THEN** the initial HTML contains a title matching "玩家個人工作室 | After Midnight".

### Requirement: Rebranded Player Card Metadata
The system SHALL dynamically resolve player profile page titles using the "After Midnight" brand.

#### Scenario: Request dynamic player page
- **WHEN** user requests a player page `/player/[id]`
- **THEN** the page title dynamically resolves to `<battle_tag> | After Midnight` instead of the legacy `OW Social` brand.

### Requirement: WebSite JSON-LD on Homepage
The system SHALL inject a structured WebSite JSON-LD script on the homepage for search engine indexing.

#### Scenario: Render homepage
- **WHEN** search bot requests the home page `/`
- **THEN** the initial HTML contains a `<script type="application/ld+json">` tag containing website details including name: "After Midnight" and url: "https://aftermidnight-gg.vercel.app".

