## ADDED Requirements

### Requirement: Client side developer state bypass in development mode
When running in local development mode (`process.env.NODE_ENV === "development"`), the `useDevMode` client hook SHALL immediately return `isDeveloper: true` and `loading: false` to allow display of the developer portal link without auth queries.

#### Scenario: Bypass client check in development
- **WHEN** the application is running in local development environment
- **THEN** the `isDeveloper` state returned by `useDevMode` SHALL be `true`

### Requirement: Server side redirect bypass in development mode
When running in local development mode, the server-side developer console page (`/developer/page.tsx`) SHALL NOT redirect users to the homepage (`/`) even if their Supabase user role is not configured as `developer` or if user is unauthorized.

#### Scenario: Bypass server redirect in development
- **WHEN** the developer page is visited in local development environment
- **THEN** the system SHALL NOT redirect the browser and SHALL render the Developer Console view
