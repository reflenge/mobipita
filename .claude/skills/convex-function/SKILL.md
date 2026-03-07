---
name: convex-function
description: Scaffold a new Convex query, mutation, or action following project patterns (auth, validation, error handling). Use when creating backend functions.
argument-hint: <query|mutation|action> <table-name> <function-name>
---

Create a new Convex function following Mobipita's established patterns.

## Steps

1. Read `convex/schema.ts` to understand the target table schema
2. Read existing functions in the same domain file for pattern reference
3. Read `convex/lib/clerkAuth.ts` for auth helper usage

## Required Patterns

- **Auth**: Always use `requireClerkIdentity(ctx)` for queries, `requireClerkUserId(ctx)` for mutations
- **Role checks**: Use `requireMinRole(ctx, "staff")`, `requireAdmin(ctx)`, etc. as needed
- **Validation**: Use Convex validators (`v.string()`, `v.id("Table")`, etc.) in `args`
- **Errors**: Throw `ConvexError` with Japanese error messages
- **Naming**: Export name matches the function purpose (e.g., `getById`, `list`, `create`, `update`, `remove`)

## Template

```ts
import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";

export const functionName = query({
    args: { /* validators */ },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        // implementation
    },
});
```

## Arguments

- `$1`: Function type (query, mutation, or action)
- `$2`: Target table name
- `$3`: Function name

Generate the function based on these arguments. If arguments are missing, ask the user.
