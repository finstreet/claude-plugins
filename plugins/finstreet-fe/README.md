# finstreet-fe

Skills for building Finstreet frontend features with `@finstreet/forms`, `@finstreet/ui`, `@finstreet/secure-fetch`, and the Next.js boilerplate. Most skills look up live documentation via the [Frontend MCP Server](https://github.com/finstreet/frontend-mcp).

## Install

First add the marketplace (once per machine — see the [root README](../../README.md) if you haven't):

```
/plugin marketplace add finstreet/claude-plugins
```

Then install the plugin:

```
/plugin install finstreet-fe@finstreet-plugins
```

## Required setup

The skills depend on the Frontend MCP Server for live documentation lookups. The MCP defaults to the hosted Fly.io deployment and requires a bearer token.

Add this to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export FINSTREET_MCP_TOKEN=<your-raw-token>
```

Get the token from the team password manager. If you don't have access yet, ask a maintainer to generate one (server-side: `node scripts/gen-token.mjs <your-label>` in `finstreet/frontend-mcp`, then `fly secrets set MCP_TOKENS=...`).

### Pointing at a local MCP server

If you're developing the MCP server itself, override the URL:

```bash
export FINSTREET_MCP_URL=http://localhost:4444/sse
# FINSTREET_MCP_TOKEN can be left unset against a local dev server
```

## Update

```
/plugin marketplace update finstreet-plugins
/plugin update finstreet-fe@finstreet-plugins
```

## Skills

Invoked as `/finstreet-fe:<name>`. Most also trigger automatically based on context.

### Orchestration
- `kickoff` — Decompose a freeform prompt into a skill-annotated task plan

### Composite features
- `inquiry-process` — Multi-step form wizard using `@finstreet/forms` + `@finstreet/ui`
- `list-actions` — Pagination, search, sort, group, archived toggle, and reset for `InteractiveList`; also covers authoring new action slots
- `e2e-test` — Playwright e2e tests (page objects, fixtures, form modules, dataTestIds)

### Building blocks
- `page` — Next.js page shells, metadata, header patterns, content wrappers
- `loading` — `loading.tsx` skeleton pages mirroring page content structure
- `ui` — PandaCSS layout primitives + `@finstreet/ui` component composition
- `modal` — Modal store, component, and open button
- `form` — Full `@finstreet/forms` flow: options, schema, useFormFields, formAction, defaults, config, FormFields, Form
- `simple-form` — Lightweight action-only forms without input fields
- `task-group` — `@finstreet/ui` TaskGroups with panels, actions, status
- `secure-fetch` — Type-safe server/client HTTP requests via `@finstreet/secure-fetch`
- `mock-api` — Mock endpoints that plug into the secure-fetch pattern
- `path-resolver` — Resolve feature/backend paths from naming conventions
- `routes` — Add or look up entries in `routes.ts`

## Changelog

### 1.0.0
- Renamed from `automation` (invocations change from `/automation:*` to `/finstreet-fe:*`).
- Moved under the renamed `finstreet-plugins` marketplace.
- Split git workflow skills (`new-feature-branch`, `commit`, `pr`) into the separate `finstreet-dev` plugin.
- Added explicit `plugin.json` manifest and per-plugin README.
