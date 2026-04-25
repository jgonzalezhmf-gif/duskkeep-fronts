---
name: duskkeep-skill-maintenance
description: "Use this skill whenever auditing, creating, updating, validating, or deciding whether Duskkeep Fronts needs new Codex skills or AGENTS.md guidance. It is also used periodically after repeated workflows, recurring bugs, new asset pipelines, new screens, or process friction to keep the agent workflow maintainable without creating unnecessary skills."
---

# Duskkeep Fronts Skill Maintenance

Use this skill to keep Duskkeep Fronts's local agent workflow useful and lean.

## Decision Rule

Create or update a skill only when at least one condition is true:
- The same workflow has repeated several times and Codex keeps rediscovering context.
- A task has fragile rules that should not rely on memory, such as asset manifests, no-404 rules, combat boundaries or browser validation.
- A screen/system now has enough stable product direction to deserve reusable guidance.
- A skill caused confusion, failed to trigger, duplicated another skill or had stale instructions.
- `AGENTS.md` needs a repo-wide rule that applies beyond one narrow skill.

Do not create a skill for one-off tasks, obvious coding practices or information already covered by an existing skill.

## Audit Workflow

1. Inspect `AGENTS.md`.
2. Inspect `docs/skills/*/SKILL.md` as the source-of-truth copies.
3. Inspect `.agents/skills/frontline-*` only to confirm installed copies match when needed.
4. Identify recurring work from the current conversation or recent repo changes.
5. Decide one of:
   - No change needed.
   - Update an existing skill.
   - Create one focused new skill.
   - Update `AGENTS.md`.
6. Keep the change small and procedural.
7. Copy changed skills from `docs/skills/<skill>` to `.agents/skills/<skill>` so future sessions can load them.

## Skill Quality Checklist

Each Duskkeep Fronts skill should:
- Have valid YAML frontmatter with only `name` and `description`.
- Put trigger conditions in `description`.
- Stay concise and action-oriented.
- Reference concrete repo paths when useful.
- Avoid duplicating broad rules already in `AGENTS.md`.
- Avoid creating README or changelog files inside the skill folder.

## AGENTS.md Guidance

Update `AGENTS.md` only for repo-wide operating rules:
- Required validation style.
- When to use skills.
- Persistent architectural boundaries.
- Cross-screen visual/product principles.
- Known environment limitations.

Do not put narrow screen-specific guidance in `AGENTS.md`; keep that in the relevant skill.

## Validation

After creating or updating a skill:
- Run the skill validator if available.
- If the validator is blocked by missing dependencies, manually check frontmatter shape and report the blocker.
- Confirm the skill exists in both `docs/skills` and `.agents/skills` when it should be auto-loaded.
- Do not run full app checks unless code outside skills/docs changed.

## Output

Report:
- Whether a new skill was created or not.
- Which existing skills were changed, if any.
- Whether `AGENTS.md` was changed.
- Validation performed and any validator limitations.
