# Reach PHASE_1: Roadmap Overview

**12 tasks across 3 milestones.** Files: `.claude/roadmaps.json` (machine-readable), `docs/roadmaps/PHASE_1.md` (full task list with Mermaid dependency diagram).

---

## What we're building

The port from `reach-of-surrentum.jsx` to Svelte 5 / SvelteKit 2 is finished, verified and themed. PHASE_1 is the first phase of new work on top of that baseline: it treats Reach as what it is, an educational toy about the negotiated, wind-and-season-dependent nature of distance in the Roman world, and asks how to make that negotiation more legible and more shareable without inventing history the model can't defend.

Three threads run through the phase. The first is infrastructure: getting the project onto a public GitHub repository and a live Vercel deployment early, so every feature that follows ships the moment it lands rather than waiting for a batch release. The second, and the bulk of the phase, is narrative depth: teaching the chart to describe a journey in prose that sounds like the traveller who took it, built on a fallback ladder that degrades gracefully from hand-authored fragments down to deterministic generated prose, so the tool is never caught with only one persona worth listening to. The third is a piece of honest historical modelling: finding out whether the current seasonal cost model can be stretched into something continuous across a year, or whether the truthful answer is a stepped control that respects the real, hard boundaries of the Roman sailing calendar.

The milestone structure is deliberately not split further than this. Model depth and narrative depth were kept as one milestone rather than two, because splitting them before the persona-roster and fragment-model questions were answered would have been premature: the shape of one directly determines the shape of the other.

## Milestone sequence and the reasoning behind it

**M1: Deploy Infrastructure** comes first and stays small: two tasks, a public repository and a linked production deployment. Nothing else in the phase formally depends on it, but it's threaded through the rest of the roadmap as soft dependencies on the three build tasks that most benefit from shipping the moment they're done, reflecting the instruction that publishing should happen incrementally rather than as a late milestone of its own.

**M2: Model & Narrative** is the largest and most sequenced milestone. It opens with two design spikes that must run in strict order: first, which personas the narrative layer actually covers (a decision that could change the fundamental roster, not just refine the existing one), then the data model and specificity-ladder algorithm that decides how an authored, situated fragment beats a generic, stitched one. Only once both are settled does the fragment store get built, followed by whole-journey narration with leg-level drill-down. Full-coverage authoring across every persona in the confirmed roster is a hard floor, not a stretch task, because a comparison feature is meaningless if one side of the comparison has nothing to say. The comparison surface itself is a third spike, deliberately gated behind that floor, followed by its implementation.

**M3: Exploration & Close** holds the year-continuity question and the phase's closing act. The research spike here is allowed to conclude that full continuity isn't defensible and that a stepped control snapped to real calendar moments (the opening of the sailing season, the harvest, the closure) is the honest choice; that's a valid, planned outcome, not a failure of the spike. The write-up sits in this milestone too, combining the historical argument with the build story in one document, deliberately placed close to final but blocking nothing, since it's a reflection on the phase rather than a gate within it.

## Decisions that shaped the structure

Several structural choices came directly out of the roadmap interview and are worth recording, since they're not obvious from the task list alone:

- **No Publish milestone.** Publishing was originally proposed as a fifth milestone; it was corrected to a small early infrastructure task chain (M1) plus one late write-up task (3EX.3), on the basis that a toy like this should ship continuously as features land, not accumulate behind a release gate.
- **Model and Narrative stayed one milestone.** An early proposal split routing-model depth from narrative work into separate milestones; this was rejected as premature before the persona and fragment-model spikes had actually decided what either piece looks like.
- **The persona-roster spike precedes fragment authoring, which precedes comparison.** This ordering exists specifically because a spike that could change which personas exist must resolve before any persona-specific content gets written, and comparison is void without every persona having at least floor-level coverage.
- **Mobile layout and UI polish were deferred out of this phase entirely**, on the explicit basis that they can wait for a later phase while the model and narrative work is more urgent.

## External blockers (flag early)

None. Every task in this phase is actionable without waiting on an external party, dataset or decision; the git status confirmed there's no existing remote or Vercel link yet, so 1DP.1 and 1DP.2 are genuine starting tasks rather than already-satisfied prerequisites.
