# 0030. The story leaves the app as a data export, not a PDF

- Status: accepted
- Date: 2026-11-08
- Supersedes: 0020

## Context

The PDF made by the browser print route (ADR 0020) cannot be read by an AI tool and cost a second layout: print CSS, inline Show math, a bare shell route. A reader who wants the data behind the report, or wants to give it to their own AI tool, needs text and structure, not pages.

## Decision

- `/story/print`, `PrintButton`, the print CSS and the print-only props are deleted.
- The report ends with an export card offering two downloads: Markdown (.md) to read and JSON (.json) for a tool. The header's Export control scrolls to it.
- Both files are serialised from one export model (`src/lib/story/export.ts`) that reads engine Facts and the closing data only. No number is computed outside the engine (ADR 0005). The .md uses display rounding; the .json holds full precision plus the rounded display value.
- The files carry what the report shows for the current customer, comparison, estimate level and priorities, plus team assumptions (unset is "Needs input" in the .md and null in the .json, never a number), data readiness and the open questions for Lindström. The open questions are removed from the on-screen report.
- Both files start with a note that the data is synthetic and the export is not audit-ready sustainability reporting.
- The server builds the two strings; a client component only downloads them as a Blob. No API route, no database. KAM and customer view both download. File names carry customer and period.
- The plain-wording ban (ADR 0028) and the digit rule apply to the .md template text; engine formulas, Show math inputs and assumption ids are quoted data.

## Consequences

No PDF is produced by the app; a reader can still print the page from the browser. A bookmarked `/story/print` returns the not-found page. The report loses its print-only code paths.
