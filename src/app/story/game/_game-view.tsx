import { ChoiceButton } from "@/components/choice-button";
import { CharacterStage } from "@/components/character-stage";
import { DialogueBox } from "@/components/dialogue-box";
import { factShowMath } from "@/components/fact-stat-card";
import { Notice } from "@/components/notice";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { PRIORITY_LABEL } from "@/components/story-chapter";
import { generatedSource } from "@/lib/data/generated";
import { observations as observationsFor, type Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { SENSITIVITY_LABEL, resolveView } from "@/lib/selection";
import { storyFacts } from "@/lib/story/facts";
import {
  CUSTOMER_VIEW_ANSWER,
  CUSTOMER_VIEW_QUESTION,
  END_LINES,
  IMPACT_WORLD_HREF,
  SCENES,
  SETTING_LABEL,
  STORY_PATH,
  SUGGESTED_BADGE,
  SUGGESTION_WHY,
  beatsFor,
  beforeParams,
  changedFacts,
  chapterObservationCounts,
  clampBeat,
  comparisonPhrase,
  exitHref,
  hasChoice,
  leadingChapter,
  neutralLabel,
  optionsFor,
  pickLine,
  previousHref,
  renderLine,
  resolveBeat,
  resolveScene,
  resolveState,
  scriptContext,
  stepHref,
  suggest,
  type Beat,
  type Scene,
} from "@/lib/story/game";
import { PERIOD } from "../_story-document";
import { ConsequenceCard } from "./_consequence-card";

/** The story game page body: one beat of one scene, everything resolved from the address (ADR 0021). Reads runtime data, so the caller wraps it in Suspense. */
export async function GameView({ searchParams }: { searchParams: PageProps<"/story/game">["searchParams"] }) {
  const [data, params] = await Promise.all([generatedSource.load(), searchParams]);
  const view = resolveView(params.view);
  const st = resolveState(data, params);
  const { scene: sceneNo, rejected: badScene } = resolveScene(params.scene);
  const scene: Scene | "end" = sceneNo === "end" ? "end" : SCENES[sceneNo - 1];
  const beats = beatsFor(scene, view);
  const { beat: asked, rejected: badBeat } = resolveBeat(params.beat, beats.length);
  const choiceMade = scene === "end" || (hasChoice(scene, params) && (scene.lever !== "priorities" || st.priorities.length > 0));
  const index = clampBeat(beats, asked, choiceMade);
  const beat: Beat = beats[index];
  const askIndex = beats.findIndex((b) => b.kind === "ask");
  const notices = [
    ...st.notices,
    ...(badScene !== null ? [`"${badScene}" is not a scene, so the first scene is shown instead.`] : []),
    ...(badBeat !== null ? [`"${badBeat}" is not a step of this scene, so its first step is shown instead.`] : []),
  ];

  const stored = storyFacts(data, { customerId: st.customer.customer_id, period: PERIOD }, st.baseline, st.sensitivity);
  const facts = stored.facts;
  const scope = (s: Pick<typeof st, "customer" | "baseline" | "sensitivity">) => storyFacts(data, { customerId: s.customer.customer_id, period: PERIOD }, s.baseline, s.sensitivity).facts;
  const fact = (id: string): Fact => {
    const f = facts.find((x) => x.id === id);
    if (!f) throw new Error(`Game Fact ${id} is missing`);
    return f;
  };

  const estimate = SENSITIVITY_LABEL[st.sensitivity];
  const lead = scene !== "end" && scene.id === "priority" && st.priorities.length > 0 ? leadingChapter(st.priorities[0]) : undefined;
  const { ctx, words: siteWords } = scriptContext(data, st.customer.customer_id, st.baseline, st.sensitivity, facts, stored.observations, PERIOD);
  const words = { baseline: st.short, sensitivity: estimate, estimate, comparison: comparisonPhrase(st.baseline, st.short), company: st.customer.customer_name, chapter: lead?.title, lead: lead?.lines[0], ...siteWords };
  const say = (text: string) => renderLine(text, facts, words);

  // The ops lead is "Customer ops lead" only while no customer is chosen (the address holds none), in either view.
  const customerChosen = hasChoice(SCENES[0], params);
  const customerUnset = scene !== "end" && scene.id === "customer" && !customerChosen;
  const opsTag = customerUnset ? "Customer ops lead" : `${st.customer.customer_name} ops lead`;
  const tag = (who: "kam" | "ops") => (who === "kam" ? "Lindström KAM" : opsTag);

  const sceneHref = scene === "end" ? "end" : (sceneNo as number);
  const next = (b: number) => stepHref(params, sceneHref, b);
  const exitState = { customer: st.customer.customer_id, baseline: st.baseline.baseline_id, sensitivity: st.sensitivity, priorities: st.priorities.slice(0, 1) };

  // Consequence: what the choice moved against the same address with this scene's lever at its default.
  let consequence: React.ReactNode = null;
  if (scene !== "end" && (beat.kind === "react" || beat.kind === "answer" || beat.kind === "meaning")) {
    if (lead) {
      consequence = <ConsequenceCard heading="Facts in the leading chapter" against={`Compared with ${st.short}, using the ${estimate}. Priorities move no figure, so these stand as they are.`} standing={lead.cards.slice(0, 4).map(fact)} emptyText="No figures." />;
    } else if (view === "customer" && scene.id === "customer") {
      // The customer view never shows another customer's figures, so there is no before value: the chosen company's figures stand as they are.
      consequence = <ConsequenceCard heading="Your year" against={`Compared with ${st.short}, using the ${estimate}.`} standing={(scene.cards ?? []).map(fact)} emptyText="No figures." />;
    } else if (scene.id !== "priority") {
      const before = resolveState(data, beforeParams(scene, params));
      const label = scene.id === "customer" ? before.customer.customer_name : scene.id === "baseline" ? before.short : SENSITIVITY_LABEL[before.sensitivity];
      consequence = <ConsequenceCard heading="What changed" against={`Against ${label}`} columns={{ before: before.short, after: st.short }} changes={changedFacts(scope(before), facts, scene.cards)} emptyText={`Nothing changed against ${label}.`} />;
    }
  }

  const speaker = beat.kind === "line" ? beat.line.speaker : beat.kind === "explain" || beat.kind === "meaning" ? beat.slot.speaker : beat.kind === "react" ? "ops" : "kam";
  const co2e = fact("co2e_saved");
  const choiceLabels = SCENES.map((s) => {
    const chosen = hasChoice(s, params);
    const label = s.id === "customer" ? st.customer.customer_name : s.id === "baseline" ? st.short : s.id === "sensitivity" ? estimate : st.priorities[0] ? PRIORITY_LABEL[st.priorities[0]] : "None chosen";
    return { s, label, chosen };
  });

  // Suggestions: one pure function over data (ADR 0022). Counts come from the engine's observations; nothing is pre-selected.
  const suggestCtx = {
    customerIds: data.customers.map((c) => c.customer_id),
    customerObservationCounts: Object.fromEntries(data.customers.map((c) => [c.customer_id, observationsFor(data, { customerId: c.customer_id, period: PERIOD }).observations.length])),
    chapterCounts: chapterObservationCounts(stored.observations),
  };

  const key = `${sceneHref}-${index}`;
  const previous = previousHref(params, view, sceneHref, index);
  const customerView = view === "customer";
  let box: React.ReactNode;
  switch (beat.kind) {
    case "line":
      box = <DialogueBox key={key} speaker={beat.line.speaker} tag={tag(beat.line.speaker)} text={say(beat.line.text)} href={next(index + 1)} previousHref={previous} />;
      break;
    case "explain": {
      const line = pickLine(beat.slot, ctx);
      box = <DialogueBox key={key} speaker={line.speaker} tag={tag(line.speaker)} text={say(line.text)} href={next(index + 1)} previousHref={previous} />;
      break;
    }
    case "ask": {
      const s = scene as Scene;
      const suggested = suggest(s, view, suggestCtx);
      const chosen = s.id === "customer" ? st.customer.customer_id : s.id === "baseline" ? st.baseline.baseline_id : s.id === "sensitivity" ? st.sensitivity : st.priorities[0];
      box = (
        <DialogueBox key={key} speaker="kam" tag={tag("kam")} text={customerView && s.id === "customer" ? CUSTOMER_VIEW_QUESTION : s.question} previousHref={previous}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {optionsFor(s, data, PRIORITY_LABEL).map((o) => (
              <ChoiceButton key={o.value} href={stepHref(params, sceneHref, askIndex + 1, { [s.lever]: o.value })} label={o.label} hint={o.hint} selected={hasChoice(s, params) && o.value === chosen} suggested={o.value === suggested ? { badge: SUGGESTED_BADGE, why: SUGGESTION_WHY[s.id] } : undefined} />
            ))}
          </div>
        </DialogueBox>
      );
      break;
    }
    case "react":
      box = <DialogueBox key={key} speaker="ops" tag={tag("ops")} text={say((scene as Scene).react)} href={next(index + 1)} previousHref={previous} />;
      break;
    case "answer":
      box = <DialogueBox key={key} speaker="kam" tag={tag("kam")} text={say(customerView && (scene as Scene).id === "customer" ? CUSTOMER_VIEW_ANSWER : (scene as Scene).answer)} href={next(index + 1)} previousHref={previous} />;
      break;
    case "meaning": {
      const line = pickLine(beat.slot, ctx);
      const last = beats.findLastIndex((b) => b.kind === "meaning") === index;
      box = <DialogueBox key={key} speaker={line.speaker} tag={tag(line.speaker)} text={say(line.text)} href={last ? stepHref(params, sceneNo === SCENES.length ? "end" : (sceneNo as number) + 1, 0) : next(index + 1)} previousHref={previous} />;
      break;
    }
    case "recap":
      box = (
        <DialogueBox key={key} speaker="kam" tag={tag("kam")} text={END_LINES.recap} href={next(index + 1)} previousHref={previous}>
          <ol className="space-y-1 text-sm">
            {choiceLabels.map(({ s, label, chosen }) => (
              <li key={s.id}>
                <span className="text-muted-foreground">{s.name}: </span>
                {label}
                {!chosen && !(view === "customer" && s.id === "customer") && <span className="text-muted-foreground"> (default)</span>}
              </li>
            ))}
          </ol>
        </DialogueBox>
      );
      break;
    case "actions":
      box = (
        <DialogueBox key={key} speaker="kam" tag={tag("kam")} text={END_LINES.actions} previousHref={previous}>
          <div className="flex flex-wrap gap-2">
            <ChoiceButton primary href={exitHref(IMPACT_WORLD_HREF, params, exitState)} label="See your impact on the world" />
            <ChoiceButton href={`${exitHref(STORY_PATH, params, exitState)}#export`} label="Download the data" />
            <ChoiceButton href={exitHref(STORY_PATH, params, exitState)} label="Read the full report" />
          </div>
        </DialogueBox>
      );
      break;
  }

  // The ending and the recap beat show a title-less scene; the stage setting of the end scene is the meeting room.
  const setting = scene === "end" ? "meeting-room" : scene.setting;
  return (
    <div className="space-y-3">
      {notices.map((n) => (
        <Notice key={n}>{n}</Notice>
      ))}
      {/* One grid so the panel can span the stage and the dialogue box: its top is the stage's top (below the setting label) and its bottom is the dialogue box's bottom. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_auto_auto]" data-slot="game-grid">
        <p className="-mb-1.5 text-sm text-muted-foreground lg:col-start-1 lg:row-start-1" data-slot="game-setting">
          {SETTING_LABEL[setting]}
        </p>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2" data-slot="game-stage">
          <CharacterStage setting={setting} speaker={speaker} opsPose={beat.kind === "react" ? "reacting" : "neutral"} opsLabel={opsTag} caption={false} />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-3" data-slot="game-dialogue">
          {box}
        </div>
        {/* The panel is out of flow inside its cell, so it never sets the row heights: the path strip stays on top and the cards scroll inside it. */}
        <aside aria-label="Your path and figures" className="rounded-lg border bg-card text-card-foreground lg:relative lg:col-start-2 lg:row-span-2 lg:row-start-2" data-slot="game-side-column">
          <div className="space-y-3 p-4 lg:absolute lg:inset-0 lg:overflow-y-auto">
            <div className="space-y-2 border-b pb-3" data-slot="path-strip">
              <ol aria-label="Your path" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {choiceLabels.map(({ s, label, chosen }) => (
                  <li key={s.id}>
                    <span className="text-muted-foreground">{s.name}: </span>
                    {chosen ? label : <span className="text-muted-foreground">not chosen yet</span>}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">{neutralLabel(co2e)}</span>
                {customerChosen ? (
                  <>
                    <span className={co2e.value === null ? "text-muted-foreground" : "num font-medium"}>{co2e.value === null ? "Needs input" : `${formatCardValue(co2e.value, co2e.unit)} ${co2e.unit}`}</span>
                    <ProvenanceChip methods={co2e.methods} source={co2e.source} compact />
                    <ShowMathPopover {...factShowMath(co2e)} align="end" />
                  </>
                ) : (
                  <span className="text-muted-foreground">Choose a customer to see this</span>
                )}
              </div>
            </div>
            {consequence}
          </div>
        </aside>
      </div>
    </div>
  );
}
