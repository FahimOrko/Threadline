# landing-page Specification

## Purpose

TBD - created by archiving change landing-page. Update Purpose after archive.

## Requirements

### Requirement: Landing page at the root
The app SHALL show a landing page at `/` instead of redirecting. It SHALL render without the app sidebar, header or AI sidebar, SHALL be reachable in both views, and SHALL be designed for desktop widths only. It SHALL show no live figure and no engine value.

#### Scenario: Open the root
- **WHEN** `/` is opened with or without `?view=customer`
- **THEN** the landing page is shown, with no redirect and no app sidebar

#### Scenario: No figures
- **WHEN** the landing page is read in full
- **THEN** it contains no digit that stands for a data value

### Requirement: Logo returns to the root
The landing page SHALL show the Threadline logo at the top left, and the app sidebar's wordmark SHALL be the same link. Both SHALL link to `/` with no query string, dropping `view`, `customer`, `baseline`, `sensitivity` and `priorities`. This is the one link that does not carry params (ADR 0034 amends ADR 0023).

#### Scenario: From the customer view
- **WHEN** the user is on `/world?view=customer&customer=CUST002` and activates the wordmark
- **THEN** the address is `/` with no params

#### Scenario: From the dashboard
- **WHEN** the user is on `/dashboard/costs?baseline=home` and activates the wordmark
- **THEN** the address is `/`

### Requirement: Hero with two entries
The hero SHALL show the logo, a one-line headline, a short subline and two calls to action. "Step in as Lindström's account manager" SHALL open `/dashboard?view=kam`. "See it as a customer" SHALL open `/story/game?view=customer`. The copy SHALL follow the Copy voice rules and the banned on-screen words.

#### Scenario: Account manager entry
- **WHEN** the user activates "Step in as Lindström's account manager"
- **THEN** the dashboard Overview opens in the KAM view

#### Scenario: Customer entry
- **WHEN** the user activates "See it as a customer"
- **THEN** the story game opens on its company picker in the customer view

### Requirement: Feature bento
The page SHALL show five cards in a bento layout: Dashboard, Story review, Impact World, Export and AI guide. Each SHALL hold one line of copy and one small static visual. The AI guide card SHALL be marked "Coming later", SHALL say it explains what figures mean, how they are calculated and where to find things in the app, for the account manager and the customer, and SHALL say it does not state figures itself. It SHALL have no chat interface and no link.

#### Scenario: AI guide card
- **WHEN** the AI guide card is read
- **THEN** it shows "Coming later", the use case, and no link, button or input

#### Scenario: Other cards
- **WHEN** a Dashboard, Story, Impact World or Export card is read
- **THEN** it has one line of copy and no number

### Requirement: Navigation FAQ
The page SHALL show a FAQ as an accordion of eight questions: what the Dashboard is, what the Story is, what Impact World is, why Impact World opens after the review in the customer view, how to switch customer, how to switch between the account manager and customer views, how export works, and what the AI guide will do and that it is coming later. Questions and answers SHALL come from one static content module that holds no JSX, so another surface can reuse it. Answers SHALL carry no figures.

#### Scenario: Open an answer
- **WHEN** the user activates a question
- **THEN** its answer opens and is reachable with the keyboard

#### Scenario: Reuse
- **WHEN** the content module is imported by non-UI code
- **THEN** it exposes the question and answer text as plain strings

### Requirement: Footer note
The page SHALL end with the line "Synthetic data, not audit-ready".

#### Scenario: Footer
- **WHEN** the landing page is open
- **THEN** the footer shows "Synthetic data, not audit-ready"

### Requirement: Landing motion is optional
Landing motion SHALL be limited to entrance and hover effects and SHALL NOT move any text that carries meaning. Under `prefers-reduced-motion: reduce` the page SHALL be fully static and show its final state from the first render. Any third-party component SHALL carry a header comment naming it, its licence and its source.

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** no element animates and every card, heading and answer is visible
