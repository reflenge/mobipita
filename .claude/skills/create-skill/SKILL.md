---
name: create-skill
description: Create a new custom Claude Code skill (slash command) for this project. Use when the user wants to add a new reusable skill.
argument-hint: <skill-name> [description]
---

Create a new custom skill for this project.

## Process

1. Ask the user for:
   - Skill name (lowercase, hyphens only)
   - Description (when should Claude auto-invoke this?)
   - What the skill should do (step-by-step)
   - Any argument hints
2. Create `.claude/skills/<skill-name>/SKILL.md` with proper YAML frontmatter
3. Follow the format of existing skills in this project

## Skill File Format

```yaml
---
name: skill-name
description: When to use this skill. Claude reads this to decide auto-invocation.
argument-hint: [optional-args]
---

Instructions for Claude when this skill is invoked.
```

## Key Frontmatter Fields

- `name`: Becomes the `/slash-command`
- `description`: Claude uses this for auto-invocation decisions
- `argument-hint`: Shown in autocomplete
- `disable-model-invocation: true`: Manual-only (no auto-invoke)
- `allowed-tools`: Restrict available tools (e.g., `Read, Grep`)
- `context: fork`: Run in isolated subagent

## Arguments

- `$1`: Skill name
- `$2`: Optional description
