// Every Fact the story can cite, from the same engine calls the dashboard makes. Signal Facts are built directly, because an observation only carries its Fact when the rule fires.
import type { AppData, Baseline } from "@/lib/data/schemas";
import { dormantSignal, footprintFacts, observations, operationalFacts, overAllocationSignal, percentageFacts, repairSpikeSignal, valueFacts, type Fact, type OperationalScope, type Sensitivity } from "@/lib/engine";

export function storyFacts(data: AppData, scope: Omit<OperationalScope, "siteId">, baseline: Baseline, sensitivity: Sensitivity) {
  const obs = observations(data, scope);
  const signals = [dormantSignal(data, scope).fact, overAllocationSignal(data, scope).fact, repairSpikeSignal(data, scope).fact];
  const all: Fact[] = [...operationalFacts(data, scope), ...valueFacts(data, scope), ...percentageFacts(data, scope), ...footprintFacts(data, scope, baseline, sensitivity), ...signals, ...obs.facts];
  return { facts: [...new Map(all.map((f) => [f.id, f])).values()], observations: obs.observations, observationFacts: obs.facts };
}
