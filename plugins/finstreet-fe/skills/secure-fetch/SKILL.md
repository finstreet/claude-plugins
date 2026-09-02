---
name: secure-fetch
description: "Complete guide to creating or updating type-safe server/client HTTP requests using the @finstreet/secure-fetch library. Use whenever creating or modifying backend requests. Supports interactive endpoint discovery — pass a search keyword and repo to browse available endpoints, configure each one, and implement them all."
---

# @finstreet/secure-fetch — Complete Guide

The `@finstreet/secure-fetch` library provides a fully type-safe approach to backend requests using Zod for schema validation of payloads, path variables, and responses.

## Path Resolution

Before creating any files, invoke the `finstreet-fe:path-resolver` skill with your input parameters (featureName, featureType, product, role) to resolve the correct paths. Use the returned **Feature Path** with `/backend` appended as `{featurePath}` in the file structure below.

## File Structure

Every feature's backend integration lives in exactly three files:

```
{featurePath}/
  ├── schema.ts    ← all Zod schemas and exported types
  ├── server.ts    ← server-side request functions (default)
  └── client.ts    ← client-side request functions (only when needed)
```

NEVER create additional files or directories. If these files already exist, update them.

## Interactive Discovery Workflow

When the user provides a **search keyword** (e.g. "inquiries") and a **repo** (e.g. `eco-scale-bfw` or `eco-scale-cb`), follow this interactive flow:

### Step 1 — Search for endpoints

Call the `search-swagger-documentation` MCP tool with the user's keyword and repo. Present the returned endpoints as a numbered list so the user can see what's available.

### Step 2 — Confirm endpoint selection

Ask the user which endpoints to implement. They might say "all of them", pick specific numbers, or exclude some. Keep asking until they're satisfied with the selection.

### Step 3 — Configure each endpoint

For each selected endpoint, ask the user:

1. **Protected?** (default: `true`) — whether the request requires authentication
2. **Server or client?** (default: `server`) — server.ts for SSR/actions, client.ts for polling/dynamic client-side calls
3. **Result schema needed?** (default: `yes` for GET, `no` for non-GET) — whether to generate a result schema

Present these as a table or list with defaults so the user can confirm quickly (e.g. "All look good" or "Change endpoint 3 to client").

### Step 4 — Fetch full documentation and implement

For each confirmed endpoint, call the `get-swagger-documentation` MCP tool with the repo and the specific path to get the full Swagger details. Then implement following the steps below:

1. Check the existing `schema.ts` for reusable schemas
2. Build the required schemas in `schema.ts`
3. Build the endpoint config and service export in the appropriate file (`server.ts` or `client.ts`)

### Direct usage

If the user already provides all the details upfront (repo, path, protected, server/client), skip the interactive flow and go straight to implementation.

## Key Imports

```typescript
// schema.ts
import * as z from "@/lib/zod"; // or from "zod"

// server.ts
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createServerFetchFunction } from "@/shared/backend/createServerFetchFunction";
import { createPaginatedServerFetchFunction } from "@/shared/backend/createServerFetchFunction";

// client.ts
import { EndpointConfig } from "@finstreet/secure-fetch";
import { createClientFetchFunction } from "@/shared/backend/createClientFetchFunction";
```

## Step-by-Step Reference

- For **building schemas** (pathVariables, result, payload, paginated), see [schema.md](schema.md)
- For **building endpoint configs** and service exports (server/client, paginated), see [endpoint-config.md](endpoint-config.md)

## Permissions Are Not a Normal Endpoint

`GET /permissions` is already wired and is **not** yours to add or call. It is fetched once per
login by `loadRailsPermissions` in `src/lib/railsAuthPlugin.ts` — a raw `fetch`, not a
secure-fetch function — and the result is stored on the better-auth session by `src/auth.ts`.

- **To read permissions**, call `authPermissions()` from `@/shared/auth/permissions`. It reads the
  session, costs no request, and is the right thing to use in a page, layout, or server action.
- **Never create or call a secure-fetch function for `/permissions`.** It would re-request on every
  render, and the session copy is what the app actually gates on. If you find one in `server.ts`,
  it is dead — leave it alone, don't wire it up.
- **When the backend adds a permission field**, the only change is `PermissionsSchema` in
  `src/shared/backend/models/auth/schema.ts`. No `server.ts` entry, and **no paired `mock-api`
  task** — the auth plugin's raw fetch never passes through the mock registry.

### Adding a permission field

A new field on `PermissionsSchema` MUST be declared optional, and read with optional chaining at
**every** hop:

```typescript
permissions?.comment?.create; // correct
permissions?.comment.create; // compiles, throws at runtime
```

The plugin casts rather than parses, so a required field type-checks as present while being
`undefined` at runtime, and `auth.ts` caches the session for 24h — live sessions lack a newly
shipped field for up to a day after the backend deploys. Optionality is permanent, not a launch
workaround.

### What Permissions Are and Are Not For

Permissions gate **entry** — whether an action is offered at all. They do NOT gate content. Reach
for one only when there is no request whose answer you could use instead:

- **Never gate a fetch on a permission.** Call the endpoint; the request is the answer. A backend
  that says no returns 403 and `fetchWithErrorHandling` deals with it.
- **Never let a permission decide whether a section renders.** An empty list renders as an empty
  list, not as a missing panel.
- **Per-item capability comes from the response.** If a list carries `editable` / `deletable` or
  similar per-entry flags, those are the source of truth for that entry's actions — do not add a
  parallel permission field for the same decision.
- **Do gate an action the user would otherwise complete before being refused.** Nothing tells you
  whether a user may create something until they submit, and finding out via 403 after they have
  written the comment is not acceptable. A `create` permission is the right gate for a create
  button; an `editable` flag the response already gave you is not something a permission should
  second-guess.

## Rules

1. The user MUST specify which repo to use (e.g. `eco-scale-bfw`, `eco-scale-cb`). If not provided, ask.
2. ALWAYS convert `snake_case` to `camelCase` in schemas AND in path templates
3. `protected: true` unless the user explicitly chooses otherwise during configuration
4. Only add a `resultSchema` for GET requests (or if explicitly required)
5. Only add a `payloadSchema` for non-GET requests
6. Use `server.ts` by default; only use `client.ts` for polling or dynamic client-side requests
7. Do NOT run any `tsc` or `pnpm` commands after implementation
8. NEVER create a secure-fetch function for `/permissions` — see "Permissions Are Not a Normal Endpoint"
