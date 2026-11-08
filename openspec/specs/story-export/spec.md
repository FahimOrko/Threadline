# story-export Specification

## Purpose

Lets a reader take the data behind the story report out of the app as a Markdown or JSON file, with the same figures, provenance and assumptions as on screen, built in the browser from engine Facts only.

## Requirements

### Requirement: Export card at the end of the report
The Story page SHALL end with an export card (anchor `export`) saying in plain words that this is the data behind the report, to read or to give to the reader's own AI tool, with two downloads: Markdown (.md) and JSON (.json). It SHALL be shown in the KAM and the customer view.

#### Scenario: Card present
- **WHEN** the Story page loads in either view
- **THEN** the last element of the report is the export card with a Markdown and a JSON download

#### Scenario: Plain wording
- **WHEN** the card renders
- **THEN** its text contains no word from the dashboard's banned list and no digit

### Requirement: Export control in the report header
The report header SHALL replace "Export PDF" with an "Export" control, in the header's scenario-strip styling, that scrolls to the export card. It SHALL NOT change the address' query params.

#### Scenario: Scroll to the card
- **WHEN** the reader activates Export
- **THEN** the export card is brought into view and `customer`, `baseline`, `sensitivity`, `priorities` and `view` are unchanged

### Requirement: One export model from Facts
Both files SHALL be built from one export model that reads engine Facts and the closing-chapter data only. No number SHALL be computed outside `src/lib/engine`; the model SHALL NOT add, subtract or average values.

#### Scenario: Same content in both files
- **WHEN** the two files are produced for the same address
- **THEN** they contain the same figures, assumptions, findings, gaps and questions

### Requirement: Export describes the current selection
The export SHALL describe the report the viewer currently sees: the customer, the period, the comparison, the estimate level (Cautious, Standard or Generous) and the picked priorities from the address, in pick order.

#### Scenario: Two priorities
- **WHEN** the address holds `?priorities=cost,hygiene`
- **THEN** both files name Cost and Hygiene in that order

#### Scenario: No priorities
- **WHEN** the address has no `?priorities=`
- **THEN** both files say no priorities were chosen

### Requirement: Export content matches the report
The export SHALL list every figure shown in the report with its label, value, unit, status, source and Show math inputs (formula, inputs, assumption ids, comparison, range).

#### Scenario: Every figure present
- **WHEN** the export is built for a customer
- **THEN** every figure shown in the report's chapters, observations, charts and findings is in the model

### Requirement: Export content beyond figures
The export SHALL also list the team assumptions with their T ids, the data-readiness summary, findings and known data gaps, and the open questions for Lindström.

#### Scenario: Sections present
- **WHEN** either file is produced
- **THEN** it has the assumptions, readiness summary, findings, known gaps and open questions

### Requirement: Rounding and precision
The Markdown file SHALL show values with the display rounding rules used on screen. The JSON file SHALL hold each value at full precision and, beside it, the rounded display value.

#### Scenario: Full precision in JSON
- **WHEN** a figure's value is 12345.6789
- **THEN** the JSON holds 12345.6789 as its value and the rounded display string beside it, and the Markdown shows only the rounded string

### Requirement: Unset assumptions are never numbers
A team assumption or figure with no value SHALL read "Needs input" in the Markdown and be `null` in the JSON. No file SHALL contain 0, a blank or a placeholder number for it.

#### Scenario: Unset assumption
- **WHEN** T001 has no value
- **THEN** the Markdown lists T001 as "Needs input" and the JSON holds `null` for its value

### Requirement: Open questions only in the export
The open questions for Lindström SHALL NOT appear in the on-screen report. They SHALL appear in both exports.

#### Scenario: Report without questions
- **WHEN** the Story page renders
- **THEN** no open-questions section or question text is in the report

#### Scenario: Questions in files
- **WHEN** either file is produced
- **THEN** it lists every open question

### Requirement: Synthetic-data note
Both files SHALL begin with a short note that the data is synthetic and that the export is not audit-ready sustainability reporting. No file SHALL describe itself as audit-ready, audited or compliant.

#### Scenario: Note first
- **WHEN** either file is produced
- **THEN** the note is the first content of the file

### Requirement: Markdown wording
The Markdown template text (headings, notes, labels written by the template) SHALL contain no word from the dashboard's banned list and no digit outside values and ids. Quoted data (engine formulas, Show math inputs, T ids in the assumptions list and Show math) is exempt.

#### Scenario: Digit scan
- **WHEN** the template text is scanned
- **THEN** it holds no digit

#### Scenario: Banned words
- **WHEN** the template text is scanned for the banned list
- **THEN** no word matches

### Requirement: Client-side download
Both files SHALL be created in the browser and saved as file downloads. The system SHALL NOT add an API route, store the export, or send it to a service.

#### Scenario: Download
- **WHEN** the reader activates a download
- **THEN** the browser saves the file with no network request to an export endpoint

### Requirement: File names
Each file name SHALL include the customer and the period, in lower case with no spaces, and end in `.md` or `.json`.

#### Scenario: Name
- **WHEN** the reader downloads for NorthStar, January to December 2025
- **THEN** both files start with the customer and the period, for example `northstar-2025-01-to-2025-12-value-review.md`
