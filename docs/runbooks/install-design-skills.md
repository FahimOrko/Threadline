# Install design skills

The design skills are large, so `.agents/` and the skill folders under `.claude/skills/` are gitignored. Install them once per clone:

```
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill-classics --skill "minimalist-ui"
```

- `minimalist-ui`: data views and structure.
- `design-taste-frontend`: palette, type tokens, anti-generic rules and its browser checker. Ignore its marketing-page structure (one section per screen, hero layouts, photographs, closing footer).
- Installer output says skills run with full agent permissions; skim them after installing.
