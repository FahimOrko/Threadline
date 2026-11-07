import { ChoiceButton } from "@/components/choice-button";
import { CharacterStage } from "@/components/character-stage";
import { DialogueBox } from "@/components/dialogue-box";
import { factShowMath } from "@/components/fact-stat-card";
import { Notice } from "@/components/notice";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { PRIORITY_LABEL } from "@/components/story-chapter";
import { generatedSource } from "@/lib/data/generated";
import type { Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { resolveView } from "@/lib/selection";
import { storyFacts } from "@/lib/story/facts";
import {
  CUSTOMER_VIEW_CONFIRM,
  END_LINES,
  IMPACT_WORLD_HREF,
  SCENES,
  START_REVIEW_LABEL,
  STORY_PATH,
  beatsFor,
  beforeParams,
  changedFacts,
  clampBeat,
  exitHref,
  hasChoice,
  leadingChapter,
  optionsFor,
  renderLine,
  resolveBeat,
  resolveScene,
  resolveState,
  stepHref,
  type Beat,
  type Scene,
} from "@/lib/story/game";
import { STORY_PRINT_PATH } from "@/lib/story/print";
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

  const scope = (s: Pick<typeof st, "customer" | "baseline" | "sensitivity">) => storyFacts(data, { customerId: s.customer.customer_id, period: PERIOD }, s.baseline, s.sensitivity).facts;
  const facts = scope(st);
  const fact = (id: string): Fact => {
    const f = facts.find((x) => x.id === id);
    if (!f) throw new Error(`Game Fact ${id} is missing`);
    return f;
  };

  const lead = scene !== "end" && scene.id === "priority" && st.priorities.length > 0 ? leadingChapter(st.priorities[0]) : undefined;
  const words = { baseline: st.short, sensitivity: st.sensitivity, company: st.customer.customer_name, chapter: lead?.title, lead: lead?.lines[0] };
  const say = (text: string) => renderLine(text, facts, words);

  // The ops lead is "Customer ops lead" only while scene 1 has not chosen a customer.
  const customerUnset = scene !== "end" && scene.id === "customer" && view === "kam" && !hasChoice(scene, params);
  const opsTag = customerUnset ? "Customer ops lead" : `${st.customer.customer_name} ops lead`;
  const tag = (who: "kam" | "ops") => (who === "kam" ? "Lindström KAM" : opsTag);

  const sceneHref = scene === "end" ? "end" : (sceneNo as number);
  const next = (b: number) => stepHref(params, sceneHref, b);
  const exitState = { customer: st.customer.customer_id, baseline: st.baseline.baseline_id, sensitivity: st.sensitivity, priorities: st.priorities.slice(0, 1) };

  // Consequence: what the choice moved against the same address with this scene's lever at its default.
  let consequence: React.ReactNode = null;
  if (scene !== "end" && (beat.kind === "react" || beat.kind === "answer")) {
    if (lead) {
      consequence = <ConsequenceCard heading="Facts in the leading chapter" against="Priorities move no Fact, so these stand as they are." standing={lead.cards.slice(0, 4).map(fact)} emptyText="No Facts." />;
    } else if (scene.id !== "priority") {
      const before = resolveState(data, beforeParams(scene, params));
      const label = scene.id === "customer" ? before.customer.customer_name : scene.id === "baseline" ? before.short : `${before.sensitivity} sensitivity`;
      consequence = <ConsequenceCard heading="What changed" against={`Against ${label}`} changes={changedFacts(scope(before), facts, scene.cards)} emptyText={`No Fact changed against ${label}.`} />;
    }
  }

  const speaker = beat.kind === "line" ? beat.line.speaker : beat.kind === "react" ? "ops" : "kam";
  const co2e = fact("co2e_saved");
  const choiceLabels = SCENES.map((s) => {
    const chosen = hasChoice(s, params);
    const label = s.id === "customer" ? st.customer.customer_name : s.id === "baseline" ? st.short : s.id === "sensitivity" ? st.sensitivity : st.priorities[0] ? PRIORITY_LABEL[st.priorities[0]] : "None chosen";
    return { s, label, chosen };
  });

  let box: React.ReactNode;
  switch (beat.kind) {
    case "line":
      box = <DialogueBox key={`${sceneHref}-${index}`} speaker={beat.line.speaker} tag={tag(beat.line.speaker)} text={say(beat.line.text)} href={next(index + 1)} />;
      break;
    case "ask": {
      const s = scene as Scene;
      const locked = view === "customer" && s.id === "customer";
      box = (
        <DialogueBox key={`${sceneHref}-${index}`} speaker="kam" tag={tag("kam")} text={locked ? CUSTOMER_VIEW_CONFIRM : s.question}>
          {locked ? (
            <ChoiceButton primary href={stepHref(params, 2, 0)} label={START_REVIEW_LABEL} />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {optionsFor(s, data, PRIORITY_LABEL).map((o) => (
                <ChoiceButton key={o.value} href={stepHref(params, sceneHref, askIndex + 1, { [s.lever]: o.value })} label={o.label} hint={o.hint} />
              ))}
            </div>
          )}
        </DialogueBox>
      );
      break;
    }
    case "react":
      box = <DialogueBox key={`${sceneHref}-${index}`} speaker="ops" tag={tag("ops")} text={say((scene as Scene).react)} href={next(index + 1)} />;
      break;
    case "answer":
      box = <DialogueBox key={`${sceneHref}-${index}`} speaker="kam" tag={tag("kam")} text={say((scene as Scene).answer)} href={stepHref(params, sceneNo === SCENES.length ? "end" : (sceneNo as number) + 1, 0)} />;
      break;
    case "recap":
      box = (
        <DialogueBox key={`${sceneHref}-${index}`} speaker="kam" tag={tag("kam")} text={END_LINES.recap} href={next(index + 1)}>
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
        <DialogueBox key={`${sceneHref}-${index}`} speaker="kam" tag={tag("kam")} text={END_LINES.actions}>
          <div className="flex flex-wrap gap-2">
            <ChoiceButton primary newTab href={exitHref(STORY_PRINT_PATH, params, exitState)} label="Open PDF version" />
            <ChoiceButton href={exitHref(STORY_PATH, params, exitState)} label="Read the full story" />
            {/* Impact World slot: the Impact World change sets IMPACT_WORLD_HREF in game.ts and renders its button here. Empty on purpose until that route exists. */}
            {IMPACT_WORLD_HREF !== null && <ChoiceButton href={exitHref(IMPACT_WORLD_HREF, params, exitState)} label="Open Impact World" />}
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
      <Panel className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2" data-slot="path-strip">
        <ol aria-label="Your path" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {choiceLabels.map(({ s, label, chosen }) => (
            <li key={s.id}>
              <span className="text-muted-foreground">{s.name}: </span>
              {chosen ? label : <span className="text-muted-foreground">not chosen yet</span>}
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{co2e.label}</span>
          <span className={co2e.value === null ? "text-muted-foreground" : "num font-medium"}>{co2e.value === null ? "Needs input" : `${formatCardValue(co2e.value, co2e.unit)} ${co2e.unit}`}</span>
          <ProvenanceChip methods={co2e.methods} source={co2e.source} compact />
          <ShowMathPopover {...factShowMath(co2e)} align="end" />
        </div>
      </Panel>
      <CharacterStage setting={setting} speaker={speaker} opsPose={beat.kind === "react" ? "reacting" : "neutral"} opsLabel={opsTag} />
      <div className={consequence ? "grid grid-cols-[minmax(0,1fr)_26rem] items-start gap-3" : undefined}>
        {box}
        {consequence}
      </div>
    </div>
  );
}
