# Add a design component

1. Read `docs/design.md` and check `src/components` for an existing component.
2. Build the component with theme tokens only, Phosphor icons and `.num` for numbers.
3. Add it to `/design` (`src/app/design/page.tsx`) in every state, under the right section. Sample values go in `src/app/design/_sample/` and carry the "sample data, not engine output" label.
4. Add it to the component table in `docs/design.md`.
5. Run `npm test`, `npm run lint`, `npm run build`, `npm run check:design-imports` and `npm run check:contrast`. If you added a colour token, add its pairs to `scripts/check-contrast.ts` first.
