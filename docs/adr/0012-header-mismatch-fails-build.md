# 0012. A column mismatch between a CSV and its sheet fails the data build

- Status: accepted
- Date: 2026-11-06
- Supersedes: none

## Context

The first copy of `data/raw/` came from a faulty manual export: every file held another sheet's data under its own name. Nothing in the app would have noticed, and every number built on it would have been wrong.

## Decision

`npm run data:build` compares each source file's header columns with its sheet in `data_dictionary.csv`, as a set. A missing expected column or an unknown extra column exits non-zero, names the file and the columns, and writes no output. Column order does not matter, because rows are read by column name. `readme.csv` and `data_dictionary.csv` are not data sheets and are not validated. Invalid rows inside a matching file are counted in the data-quality report, not fatal.

## Consequences

A re-exported pack is checked against its own dictionary before anything is built. A renamed column stops the build until the code or the pack is fixed. The check says nothing about values, so Zod row schemas and the report still matter.
