# Project Instructions

## Model Usage

- **Opus**: Use for planning, architecture decisions, and complex reasoning (main conversation)
- **Sonnet**: Use for code implementation via subagents with `model: "sonnet"`

When delegating implementation tasks to subagents, always pass `model: "sonnet"` to the Task tool.

## Git Workflow

- Use small, focused commits with conventional commit format
- Commit messages should follow: `type: description`
- Types: feat, fix, docs, refactor, test, chore

## Windows Notes

- Never create files named `nul` (reserved Windows device name)
- Use Windows-style null redirection (`>nul`) not Unix-style (`>/dev/null`)
