---
name: review-changes
description: Review current git changes for quality, correctness, security, and accessibility. Use before committing or creating a PR.
---

Review all staged and unstaged changes in the current branch.

## Process

1. Run `git diff` and `git diff --cached` to see all changes
2. Run `git log --oneline -5` for recent commit context

## Review Checklist

### Correctness
- Does the logic match the intended behavior?
- Are edge cases handled?
- Are there any off-by-one errors or null/undefined risks?

### Security (OWASP)
- Input validation with Zod on both Convex and client side?
- Auth checks present in all Convex functions and API routes?
- No secrets or credentials in code?

### Accessibility
- Font sizes >= 16px body / 18px labels?
- Touch targets >= 44x44px?
- Appropriate aria-labels on interactive elements?
- WCAG AA contrast ratios?

### Code Quality
- Follows existing patterns (no new inventions)?
- No unnecessary comments (naming should be self-documenting)?
- JSDoc on exported functions?
- ESLint import order correct?
- No over-engineering or unused code?

### Output
Provide a summary with:
- **Issues found** (categorized by severity: critical / warning / suggestion)
- **Recommended fixes** for each issue
- **Overall assessment**: ready to commit or needs changes
