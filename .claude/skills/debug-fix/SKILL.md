---
name: debug-fix
description: Autonomously diagnose and fix a bug. Reads logs, traces errors, identifies root cause, and implements the fix. Use when given a bug report or error message.
argument-hint: [error-message-or-description]
---

Autonomously diagnose and fix the reported bug.

## Process

1. **Gather Evidence**: Read error messages, stack traces, relevant logs
2. **Locate Source**: Use Grep/Glob to find the problematic code
3. **Understand Context**: Read surrounding code and related files
4. **Identify Root Cause**: Don't fix symptoms — find the actual cause
5. **Implement Fix**: Make the minimal change that correctly resolves the issue
6. **Verify**: Ensure the fix works and doesn't introduce regressions

## Rules

- Do NOT ask the user for hand-holding — investigate independently
- Do NOT apply temporary workarounds — find and fix the root cause
- If the fix touches multiple files, explain the impact at each step
- If the root cause is ambiguous, present findings and ask the user to confirm before proceeding
- After fixing, update `tasks/lessons.md` if the bug reveals a recurring pattern

## Arguments

- `$ARGUMENTS`: Error message, bug description, or failing test name
