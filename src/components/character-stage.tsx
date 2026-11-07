import { SETTING_LABEL, type Setting } from "@/lib/story/game";

type Speaker = "kam" | "ops";
type Pose = "neutral" | "reacting";

const W = 1280;
const H = 400;
// The visible window of the 1280-wide scene: both figures (x 340 and 940, 136 wide) sit inside it with margin. The box keeps this aspect ratio and the art is fitted with `meet`, so it scales and is never cropped.
const X0 = 120;
const VW = 1040;

// Original flat art in theme tokens only (no skin tones, no faces). Settings are simple layered shapes: `back` sits behind the figures, `front` in front of their lower bodies.
function Backdrop({ setting, layer }: { setting: Setting; layer: "back" | "front" }) {
  if (layer === "back") {
    return (
      <g>
        <rect width={W} height={H} className="fill-muted" />
        {setting === "meeting-room" && (
          <g>
            <rect x="90" y="50" width="320" height="200" rx="6" className="fill-card stroke-border" strokeWidth="3" />
            <path d="M250 50V250M90 150H410" className="stroke-border" strokeWidth="3" />
            <rect x="880" y="70" width="260" height="140" rx="6" className="fill-card stroke-border" strokeWidth="3" />
            <path d="M910 110H1110M910 140H1060M910 170H1090" className="stroke-border" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {setting === "plant-floor" && (
          <g>
            <path d="M0 60H1280M0 90H1280" className="stroke-border" strokeWidth="3" />
            {[60, 300, 540, 780, 1020].map((x, i) => (
              <g key={x}>
                <rect x={x} y={150 - (i % 2) * 40} width="200" height={250 + (i % 2) * 40} rx="8" className="fill-card stroke-border" strokeWidth="3" />
                <circle cx={x + 40} cy={190 - (i % 2) * 40} r="10" className="fill-primary" />
                <rect x={x + 70} y={182 - (i % 2) * 40} width="100" height="16" rx="4" className="fill-border" />
                <rect x={x + 24} y={240 - (i % 2) * 40} width="152" height="70" rx="6" className="fill-muted stroke-border" strokeWidth="2" />
              </g>
            ))}
          </g>
        )}
        {setting === "sustainability-office" && (
          <g>
            <rect x="500" y="40" width="280" height="210" rx="6" className="fill-card stroke-border" strokeWidth="3" />
            <path d="M640 40V250M500 145H780" className="stroke-border" strokeWidth="3" />
            <path d="M80 250H330M80 150H330" className="stroke-border" strokeWidth="6" strokeLinecap="round" />
            {[130, 220, 290].map((x) => (
              <g key={x}>
                <rect x={x - 16} y="120" width="32" height="30" rx="4" className="fill-border" />
                <ellipse cx={x} cy="100" rx="22" ry="26" className="fill-primary/40" />
              </g>
            ))}
            <rect x="1010" y="110" width="150" height="140" rx="6" className="fill-card stroke-border" strokeWidth="3" />
            <path d="M1085 235V150" className="stroke-primary/60" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="1060" cy="150" rx="28" ry="14" className="fill-primary/40" transform="rotate(-25 1060 150)" />
            <ellipse cx="1110" cy="136" rx="28" ry="14" className="fill-primary/40" transform="rotate(25 1110 136)" />
          </g>
        )}
      </g>
    );
  }
  // front layer: the table, bench or desk the figures stand behind
  const top = H - 14; // a thin bench strip: no empty band under the figures
  return (
    <g>
      <rect y={top} width={W} height={H - top} className="fill-card" />
      <rect y={top} width={W} height="8" className="fill-border" />
      {setting === "plant-floor" && <rect y={top + 8} width={W} height="3" className="fill-primary/30" />}
      {setting === "meeting-room" && <rect x="520" y={top - 6} width="240" height="6" rx="3" className="fill-primary/40" />}
    </g>
  );
}

function Figure({ who, x, pose, speaking, dimmed }: { who: Speaker; x: number; pose: Pose; speaking: boolean; dimmed: boolean }) {
  const tilt = pose === "reacting" ? (who === "ops" ? -5 : 4) : 0;
  const lift = speaking ? -8 : 0;
  return (
    <g data-figure={who} transform={`translate(${x} ${H + lift}) rotate(${tilt})`} style={{ opacity: dimmed ? 0.6 : 1 }} className="transition-opacity duration-150 motion-reduce:transition-none">
      {who === "kam" ? (
        <>
          <path d="M-120 0V-60Q-120 -130 -56 -148H56Q120 -130 120 -60V0Z" className="fill-primary" />
          <path d="M-30 -148L0 -108L30 -148Z" className="fill-card" />
          <rect x="22" y="-96" width="36" height="22" rx="3" className="fill-card" />
        </>
      ) : (
        <>
          <path d="M-136 0V-56Q-136 -128 -64 -146H64Q136 -128 136 -56V0Z" className="fill-foreground/85" />
          <rect x="-96" y="-146" width="14" height="146" className="fill-card" />
          <rect x="82" y="-146" width="14" height="146" className="fill-card" />
          <path d="M-14 -146L0 -92L14 -146" className="stroke-card" strokeWidth="3" fill="none" />
          <rect x="-12" y="-94" width="24" height="16" rx="2" className="fill-card" />
        </>
      )}
      <rect x="-15" y="-176" width="30" height="34" className="fill-border" />
      <g transform={pose === "reacting" ? "rotate(-7 0 -176)" : undefined}>
        <ellipse cx="0" cy="-214" rx="42" ry="48" className="fill-muted stroke-border" strokeWidth="3" />
        {who === "kam" ? (
          <path d="M-44 -220Q-46 -268 0 -268Q48 -268 44 -216Q22 -244 -44 -220Z" className="fill-foreground" />
        ) : (
          <>
            <path d="M-48 -226Q-48 -276 0 -276Q48 -276 48 -226Z" className="fill-foreground" />
            <path d="M-6 -226H74V-218H-6Z" className="fill-foreground" />
          </>
        )}
      </g>
    </g>
  );
}

const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * The stage of a game scene: a labelled setting with the Lindström KAM on the left and the customer's ops lead on the right, in original flat art built from theme tokens.
 * The speaker is raised and the other figure dimmed; `pose` shows a reaction. `art="initials"` swaps the figures for two portrait cards with the same labels.
 */
export function CharacterStage({ setting, speaker, kamPose = "neutral", opsPose = "neutral", opsLabel, art = "figures", caption = true }: { setting: Setting; speaker: Speaker | null; kamPose?: Pose; opsPose?: Pose; opsLabel: string; art?: "figures" | "initials"; caption?: boolean }) {
  const label = SETTING_LABEL[setting];
  return (
    <figure data-slot="character-stage" data-setting={setting} className="space-y-1.5">
      {caption && <figcaption className="text-sm text-muted-foreground">{label}</figcaption>}
      <div className="relative aspect-[1040/400] max-h-[22rem] w-full overflow-hidden rounded-lg border bg-muted">
        <svg role="img" aria-label={`${label}. Lindström KAM on the left, ${opsLabel} on the right.`} viewBox={`${X0} 0 ${VW} ${H}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 size-full">
          <Backdrop setting={setting} layer="back" />
          {art === "figures" ? (
            <>
              <Figure who="kam" x={340} pose={kamPose} speaking={speaker === "kam"} dimmed={speaker === "ops"} />
              <Figure who="ops" x={940} pose={opsPose} speaking={speaker === "ops"} dimmed={speaker === "kam"} />
            </>
          ) : (
            [
              { who: "kam" as const, x: 340, text: "Lindström KAM" },
              { who: "ops" as const, x: 940, text: opsLabel },
            ].map((c) => (
              <g key={c.who} opacity={speaker !== null && speaker !== c.who ? 0.6 : 1}>
                <rect x={c.x - 130} y="110" width="260" height="190" rx="10" className="fill-card stroke-border" strokeWidth="3" />
                <circle cx={c.x} cy="190" r="46" className="fill-muted stroke-border" strokeWidth="3" />
                <text x={c.x} y="200" textAnchor="middle" fontSize="30" fontWeight="600" className="fill-foreground">
                  {initials(c.who === "kam" ? "Lindström KAM" : opsLabel)}
                </text>
                <text x={c.x} y="272" textAnchor="middle" fontSize="20" className="fill-muted-foreground">
                  {c.text}
                </text>
              </g>
            ))
          )}
          <Backdrop setting={setting} layer="front" />
        </svg>
      </div>
    </figure>
  );
}
