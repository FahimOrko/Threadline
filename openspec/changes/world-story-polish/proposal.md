## Why

Review of the story game and Impact World found five problems: progress is lost when the reader visits `/world` and comes back, the world is open before the review is finished, the opening line is stiff, "trees saved" claims something nothing did (it is an equivalence), and much of the story copy reads like a spec, not like an account manager.

## What Changes

1. **Progress persistence.** The game mirrors its address (`scene`, `beat`, the four levers; so current beat, choices and the ending flag) into `sessionStorage`, keyed by view and customer. Opening the game with a bare address restores it; a refresh in the same tab keeps it. Start over clears it. Every storage access is in try/catch and falls back to a fresh game. New ADR 0033 (client-stored state; refines ADR 0014 and 0021, which keep the address as the source of truth).
2. **World gate in the customer view.** `/world` is locked until the ending is reached, with the report's "Finish the review to open" pattern. The sidebar Impact World item shows a locked state. The ending's "See your impact on the world" link carries `ended=1` and always opens it, so a failing or empty store cannot trap the reader. The KAM view is never gated.
3. **First slide wording** is replaced with the user's text, in both the KAM intro and `CUSTOMER_VIEW_INTRO`. Digit-scan rules stay.
4. **Trees framing.** Remove "trees saved" wording everywhere (hub, zone, "i" text, report note, gallery, accessible names). The Fact label becomes "Young trees equal to the emissions avoided" (ids stay, so no churn). The zone headline reads "The emissions you avoided equal what {{fact:trees_saved}} young trees absorb in 10 years." A three-step "How we got here" strip is added to the zone: garments washed, CO2e from washing (Lindström and the comparison, delivery included), and the difference divided by the per-tree factor (T011). Every number is a Fact token. When Lindström needs more trees the zone keeps the honest "no saving" wording and the strip shows the negative difference as extra.
5. **Copy pass** on all human-facing text in the story game and the story report, with a "Copy voice" section added to `docs/conventions.md`. The ten biggest rewrites are listed below for review.

## Ten biggest rewrites (for review)

Drafts. Tokens, banned words (`baseline`, `sensitivity`, `Fact`, ...) and the digit rules hold in every "After".

| # | Where | Before | After |
|---|-------|--------|-------|
| 1 | Scene 1 first line (KAM and customer view) | Welcome to the value review. It matters because you should see what the Lindström service did for your year, in plain figures you can check. We compare it with another way of washing the same garments. | Good to see you. Let's look back at your year with us: what our service saved you, and what it cost, compared with washing the same workwear another way. You can open the math behind any number. *(the user's text, verbatim)* |
| 2 | Scene 1 second line | We will make four choices together, and I will show what each one changes. Every figure comes from the data pack. Afterwards you will see how it impacts the world. | There are four short choices to make along the way, and after each one I'll show you what moved. Every figure comes from your data, and when we're done you can see what it means for the world around you. |
| 3 | Scene 1 explain (no site stands out) | The first step sets whose garments, sites and washing we look at, and everything after follows from it. I will look at the account as a whole. | First we decide whose year we're looking at. Everything that follows, the sites, the garments and the washing, depends on that. I'll look at your account as a whole. |
| 4 | Scene 1 answer | For {company}, {{fact:delivery_sites}} were served for {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation. The card shows what moved against the starting customer. | So for {company}: we served {{fact:delivery_sites}}, dressing {{fact:active_wearers}}, with {{fact:garments_in_circulation}} in circulation. The card on the right shows how this differs from where we started. |
| 5 | Scene 2 explain | This choice picks the laundry we compare the service with: a local laundry, washing at home or an in-house laundry, each washing the same garments. The savings are the difference between that laundry and the service, in litres (L) of water, kilowatt hours (kWh) of energy and kilograms of CO2e. | A saving only means something next to something else. So pick the way of washing you'd like us to compare against: a local laundry, washing at home, or your own in-house laundry, all washing the same garments. The saving is simply the gap between that and our service, counted in litres of water, kilowatt hours of energy and kilograms of CO2e (CO2e is carbon dioxide and other greenhouse gases, put on one scale). |
| 6 | Scene 2 answer | Compared with {comparison}, the service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. The factors for these comparison laundries are illustrative values in the data pack, not metered savings. | Compared with {comparison}, our service saved {{fact:water_saved}} of water, {{fact:energy_saved}} of energy and {{fact:co2e_saved}}. One honest note: the washing figures for those other laundries are typical values from the data pack, not measurements from your plants. |
| 7 | Scene 3 intro | The comparison laundries' factors were not measured at your plants, so the savings are an estimate. We can show a cautious, a standard and a generous version. / The team declared it as assumption T002. It is the team's estimate range, not a measurement. | Since nobody measured the other laundries at your plants, the savings are an estimate, and an estimate is better shown as a range. I can show you a cautious, a standard and a generous version. / The width of that range is our own team's call, recorded as T002. It's a sensible spread, not a measurement. |
| 8 | Scene 3 meaning (Cautious) | What this means: the Cautious estimate is the low end of the declared range, so these savings are the smallest of the three. If they still look worthwhile, the case holds on cautious assumptions. | Here's what that tells us: this is the careful end of the range, so these are the smallest savings of the three. If they still look worthwhile to you, the case holds even when we assume the least. |
| 9 | Scene 1 meaning (idle garments, missing fee) | The cost of unused allocation needs input from Lindström: the weekly rental fee per garment. Without it we cannot say what idle garments cost, so no figure is shown. | I can't put a price on the idle garments yet. That needs the weekly rental fee per garment, and only Lindström can supply it. Rather than guess, I've left the figure out. |
| 10 | Scene 4 meaning (fallback) and recap/ending lines | The figures behind every chapter stay the same. The order only decides what your team reads first. | None of the numbers change with this choice. It only decides which chapter your team reads first, so start with what matters most to them. |

The remaining dialogue, intros, "what this means" beats, report chapter lines, card labels and explainers get the same pass during implementation, against the Copy voice rules, and are listed in `tasks.md`.

## Capabilities

### New Capabilities
- `game-progress`: session persistence of the story game's progress and the ending flag, with the storage rules (keys, restore, clear, failure fallback).

### Modified Capabilities
- `app-shell`: the sidebar's Impact World item has a locked state in the customer view; the Story group's Start over clears progress.
- `impact-world`: the customer-view gate; "trees saved" removed; the zone headline and the "How we got here" strip; negative case.
- `story-choices-game`: first-slide wording, the ending link carries `ended=1`, Start over clears stored progress, copy-voice requirement on dialogue.
- `story-player`: copy-voice requirement on the report text and the "trees" note wording.
- `kpi-engine`: new `washed_kg` Fact (step 1 of the strip) and the relabelled `trees_saved` Fact.

## Impact

- Code: `src/lib/story/game.ts` (script text, `exitHref`, ending link), `src/lib/story/index.ts` and `closing.ts` (report copy and the trees note), `src/lib/world.ts`, `src/lib/explain.ts`, `src/lib/engine/equivalences.ts` and `footprint.ts` (label, `washed_kg`), `src/lib/nav.ts`, `src/components/app-sidebar.tsx`, `src/components/world-hub.tsx`, `src/components/trees-stage.tsx`, new client components for progress and the world gate, `src/app/story/game/_game-header.tsx`, `src/app/world/_world-view.tsx`, `src/app/design/*`.
- Docs: new ADR 0033 and index row; `docs/conventions.md` (Copy voice section; sessionStorage line); `docs/design.md` (the strip, the locked state).
- Tests: engine tests for `washed_kg` and the relabel; storage helper tests (failure, key, clear); gate and sidebar component tests; `tests/story-game.test.ts` digit scan and banned-word scan cover the new copy.
- No new dependencies. The gate is a UI convenience, not security: the data is synthetic and `ended=1` can be typed by hand.
- Out of scope: Water, Air, Energy, Circularity and Delivery zones; any change to `docs/product-spec.md`.
