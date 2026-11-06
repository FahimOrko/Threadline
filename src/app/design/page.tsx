import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/badge";
import { Panel } from "@/components/panel";
import { ProvenanceChip } from "@/components/provenance-chip";
import { SectionHeader } from "@/components/section-header";
import { ShowMath } from "@/components/show-math";
import { StatCard } from "@/components/stat-card";
import { EmptyState, ErrorState, StatCardSkeleton } from "@/components/states";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip } from "@/components/tooltip";
import { METHODS, SOURCES } from "@/lib/provenance";
import { SAMPLE_LABEL, sampleMath, sampleStats, stressChip } from "./_sample/data";

const sections = ["Tokens", "Provenance", "Data display", "Controls", "States", "Effects"];
const tokenNames = [
  "background", "card", "muted", "primary", "certain", "uncertain", "border", "destructive",
];

function SampleLabel() {
  return <Badge>{SAMPLE_LABEL}</Badge>;
}

export default function DesignPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Design</h1>
        <p className="max-w-[65ch] text-sm text-muted-foreground">
          Every reusable component in all its states. Rules and tokens are in docs/design.md.
        </p>
        <nav aria-label="Sections" className="flex flex-wrap gap-2 text-sm">
          {sections.map((s) => (
            <a key={s} href={`#${s.toLowerCase().replace(" ", "-")}`} className="text-primary hover:underline">
              {s}
            </a>
          ))}
        </nav>
      </header>

      <section id="tokens" className="space-y-4">
        <SectionHeader title="Tokens" description="Colours come from CSS variables and switch with the theme." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokenNames.map((t) => (
            <div key={t} className="space-y-1">
              <div className="h-10 rounded-md border" style={{ background: `var(--${t})` }} />
              <p className="num text-xs text-muted-foreground">--{t}</p>
            </div>
          ))}
        </div>
        <Panel className="space-y-1">
          <p className="text-sm">Geist for UI text.</p>
          <p className="num text-sm">Geist Mono, tabular: 1 111.11 / 8 888.88</p>
        </Panel>
      </section>

      <Separator />

      <section id="provenance" className="space-y-4">
        <SectionHeader title="Provenance" description="Neutral chips are certain, amber chips are less certain. The least certain method sets the tint." />
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <ProvenanceChip key={m} methods={[m]} source="SYNTHETIC" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <ProvenanceChip key={s} methods={["CALCULATED"]} source={s} />
          ))}
          <ProvenanceChip methods={["ALLOCATED", "ESTIMATED"]} source="SYNTHETIC_TEAM" />
        </div>
        <Panel className="space-y-2">
          <SampleLabel />
          <ShowMath {...sampleMath} />
        </Panel>
      </section>

      <Separator />

      <section id="data-display" className="space-y-4">
        <SectionHeader title="Data display" actions={<SampleLabel />} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sampleStats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              unit={s.unit}
              provenance={<ProvenanceChip methods={[...s.methods]} source={s.source} />}
            />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Stress test</h3>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            Longest method combination and longest source. Left: the narrowest supported StatCard (11rem). Right: a 320px phone-width frame. The chip stays inside the card and labels never break.
          </p>
          <div className="flex flex-wrap items-start gap-4">
            <div className="w-44">
              <StatCard
                label="Worst-case chip"
                value="1 140"
                unit="m³"
                provenance={<ProvenanceChip methods={[...stressChip.methods]} source={stressChip.source} />}
              />
            </div>
            <div className="w-[320px] max-w-full rounded-lg border border-dashed p-2">
              <div className="grid grid-cols-1 gap-2">
                {sampleStats.slice(2, 3).map((s) => (
                  <StatCard
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    unit={s.unit}
                    provenance={<ProvenanceChip methods={[...s.methods]} source={s.source} />}
                  />
                ))}
                <StatCard
                  label="Worst-case chip"
                  value="1 140"
                  unit="m³"
                  provenance={<ProvenanceChip methods={[...stressChip.methods]} source={stressChip.source} />}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
        </div>
      </section>

      <Separator />

      <section id="controls" className="space-y-4">
        <SectionHeader title="Controls" />
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <ThemeToggle />
          <Tooltip label="Short hint on hover and focus">
            <Button variant="outline">Tooltip</Button>
          </Tooltip>
        </div>
        <ToggleGroup aria-label="Example toggle" variant="outline" spacing={0} defaultValue={["a"]}>
          <ToggleGroupItem value="a">Option A</ToggleGroupItem>
          <ToggleGroupItem value="b">Option B</ToggleGroupItem>
        </ToggleGroup>
      </section>

      <Separator />

      <section id="states" className="space-y-4">
        <SectionHeader title="States" description="Loading matches the final layout, empty says what to do next, errors stay inline." />
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCardSkeleton />
          <EmptyState title="No sites selected" hint="Pick a customer in the header to see its sites." />
          <ErrorState title="Could not load data" detail="Check the data build and reload the page." />
        </div>
      </section>

      <Separator />

      <section id="effects" className="space-y-4">
        <SectionHeader title="Effects" />
        <EmptyState
          title="Reserved for Story and Impact World"
          hint="Motion, glow and scene art appear only in those two views. Data-view components carry no effects."
        />
      </section>
    </div>
  );
}
