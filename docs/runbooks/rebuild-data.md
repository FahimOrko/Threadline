# Rebuild data from CSVs

Status: the build script is a stub until the data-pipeline slice.

1. Put the source CSVs in `data/raw/`.
2. Run `npm run data:build`.
3. Check that JSON appears in `data/generated/`.
4. Run `npm test` and `npm run build`.
5. Commit the generated JSON if the project tracks it.
