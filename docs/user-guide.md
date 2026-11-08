# Threadline user guide

## What Threadline is

Threadline tells the story of a customer's year with Lindström's workwear service. It shows what the service saved, what it cost, and how each figure was worked out. It compares the service with how the customer might otherwise have washed the same garments.

It is for two people:

- The **account manager** (KAM), who prepares and runs the yearly value review.
- The **customer**, who wants to see their own year and what it means.

The data is made up. See [Limits](#limits).

## Two roles

The role is the `?view=` part of the address: `?view=kam` or `?view=customer`. With none, you get the account manager's view.

| | Account manager | Customer |
| --- | --- | --- |
| Dashboard | Yes, all six pages | No, hidden |
| Story review and report | Yes | Yes |
| Impact World | Any time | After the review is finished |
| Pick a customer | In the sidebar, any customer | Pick your company in the review |

Pick a role on the **landing page** (the logo takes you back there). You can also switch with the two links at the bottom of the left sidebar. The role, the customer and your choices stay in the address, so you can copy a link and share it.

## Account manager walkthrough

### 1. Prepare

1. On the landing page, choose **Step in as Lindström's account manager**.
2. Pick the customer in the menu at the top of the left sidebar.
3. Read the dashboard before you meet the customer. Open "Show math" or the "i" on any figure you might be asked about.

### 2. Read the dashboard

- **Overview**: whose year it is, what the service did, and a card for each other page.
- **Garments and utilization**: how many garments are in use, and how much of the stock gets used.
- **Costs**: what the service costs and what drives it.
- **Environmental footprint**: water, energy and CO2e (carbon dioxide and other greenhouse gases on one scale) against the comparison.
- **Signals**: where to look first. Garments that sit unused for long, sites with more garments than they use, and months with a sudden jump in repairs. Signals are about sites, never people.
- **Sites**: a table of every site and a heatmap by month. Click a site for its own page.

### 3. Set the comparison and the estimate

At the top of Overview and Environmental footprint, a strip sets two things:

- **Comparison**: what to compare against. Outsourced local laundry (the default), home washing, or in-house laundry.
- **Estimate**: Cautious, Standard or Generous. See [How the numbers work](#how-the-numbers-work).

Pick the one you can defend. Figures that depend on them update at once.

### 4. Run the review together

1. Open **Story** in the sidebar, then **Review**. This opens the story game.
2. Play it with the customer. It has four short choices: the customer, the comparison, the estimate and up to two priorities (water, cost, emissions, circularity, service, hygiene).
3. After each choice you see what moved and why.
4. At the end you reach the report.

### 5. Read the report and follow up

The report is built from your choices. It has a chapter per priority, a note on how we calculated, and a data-readiness note.

- **Export**: at the end of the report, save a Markdown (.md) or JSON (.json) file. The Export button in the report header jumps there.
- **Open questions**: the report ends with questions we still need Lindström to answer. Use them as your follow-up list.
- **Print**: the report is laid out for the browser's print.

### 6. Show Impact World

Open **Impact World** in the sidebar. It is a picture of the customer's impact. The account manager can open it at any time. It works well as the last step: "here is what that looks like."

## Customer walkthrough

1. On the landing page, choose **See it as a customer**.
2. Choose your company when the review asks "Which company are you from?".
3. Play the review. You make four short choices and see what each one changes.
4. Your progress is kept while this browser tab is open. If you leave and come back, you pick up where you were. **Start over** clears it, and it is gone when you close the tab.
5. Read the report. It ends with an export card (Markdown or JSON).
6. **Impact World** is locked until you finish the review. It then opens from the report and from the sidebar.

## Page by page

**Landing**: two buttons to pick a role, a short tour of the app, and answers to common questions.

**Dashboard pages** (account manager only): each opens with a short introduction. Cards show a figure with its source. Charts are titled with the question they answer and have a table version for screen readers.

**Story game**: a conversation between you and a Lindström account manager in four scenes. Click the dialogue (or press Enter or Space) to go on. Every line is fixed text. No AI writes it.

**Story report** (`/story`): the year as chapters, shaped by your priorities. It ends with methodology, data readiness, the assumptions table, open questions, and the export card.

**Impact World hub**: a circle of six zones: Trees, Water, Air, Energy, Circularity, Delivery. They are all the same size, in a fixed order. Only Trees is open now. The others read "Coming soon". The hub centre is marked "Illustration".

**Trees zone**: shows the emissions avoided as young trees, next to the trees for the comparison and for Lindström. One tree icon stands for a number of trees, shown in a legend.

## How the numbers work

**One engine.** Every number comes from one calculation engine. Pages never work out a figure themselves, so the same figure is the same everywhere.

**Provenance.** Each figure has a chip that says where it comes from: the data pack, a calculation, an estimate, or a team assumption. Amber and dashed lines mean estimated or illustrative.

**Show math.** Opens the formula, the inputs and the assumptions behind a figure.

**The "i".** A short plain-words explanation of what a figure or chart means.

**Needs input.** Some values only Lindström or our team can supply. Until they are set, the figure says "Needs input", never 0 or a made-up number. Hatched bars mean the same thing.

**Estimates.**

- *Cautious*: the old laundry is assumed more efficient than the data pack says, so savings come out smaller.
- *Standard*: the factors as the data pack gives them.
- *Generous*: the old laundry is assumed less efficient, so savings come out larger.

The gap between them is a modelling choice by our team, not a measurement. Only the water, energy and CO2e figures carry a range.

**Comparison.** The same garments washed by an outsourced local laundry, at home, or in the customer's own laundry. The comparison changes the savings.

**Impact World pictures are equivalences, not measurements.** The trees chain goes like this:

1. We work out the customer's CO2e with the comparison, and with Lindström's service (process and delivery).
2. The difference is the emissions the service avoided.
3. A published factor says one young tree takes in about 0.06 tonnes of CO2e in 10 years (US EPA).
4. Dividing gives a number of young trees that would absorb the same amount.

So "the emissions you avoided equal what that many young trees absorb in 10 years". No tree was planted or saved, and the factor is for CO2 applied to CO2e as an approximation. If Lindström needs more trees than the comparison, the zone says so plainly.

## Limits

- **Synthetic data.** Every row is made up. No figure is a real result or an approved sustainability claim.
- **Not audit-ready.** Threadline is a prototype for a conversation, not a report for auditors.
- **Desktop only.** Use a wide screen.
- **AI guide coming later.** It will explain figures and where to find things. It will never state a figure itself.
- **More Impact World zones coming.** Water, Air, Energy, Circularity and Delivery are not built yet.
- **Fixed year.** The period is the year 2025, with no period picker.
- **Open questions for Lindström.** Some inputs are still missing, such as a typical weekly rental fee per garment. The report lists them.
