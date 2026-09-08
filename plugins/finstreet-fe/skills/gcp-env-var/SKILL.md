---
name: gcp-env-var
description: "Add a new environment variable to a Finstreet Next.js app so it actually reaches the app running on GCP — wires it through the Dockerfile and cloudbuild.yaml, and flags the Cloud Build trigger substitution that lives outside the repo. Use whenever adding a new env var, or debugging why one set by DevOps isn't showing up on staging/production (especially a NEXT_PUBLIC_* one that's silently missing in the browser)."
---

# GCP Environment Variable

Adding an env var to a Finstreet Next.js app deployed via `cloudbuild.yaml` touches up to
three places, and it's easy to do only one or two and end up with a variable that's set
"somewhere" but never reaches the running app. Two of the three live in this repo; the third
does not.

## Step 0: client or server?

This decision changes everything downstream — get it right first.

- **`NEXT_PUBLIC_*` prefix** — read anywhere a `"use client"` component, or any code that ends
  up in the browser bundle, touches it. Next.js inlines these at `next build` time via
  webpack's `DefinePlugin`. A runtime env var set on the deployed container arrives **after**
  the bundle is already built and is invisible to client code — it must be present when
  `pnpm run build` runs inside the Docker image. That means **Dockerfile ARG/ENV +
  `cloudbuild.yaml` `--build-arg` are mandatory**, not optional.
- **No `NEXT_PUBLIC_` prefix, server-only** — read only in Server Components, Route Handlers,
  Server Actions, or middleware. These call `process.env.X` at request time in the already-running
  container, so a plain runtime env var on the deployment target is enough. **Skip the
  Dockerfile/cloudbuild.yaml changes below** — wire it directly on the Cloud Run service /
  Helm values / k8s secret instead, and stop reading here.

The rest of this skill is for the `NEXT_PUBLIC_*` case.

## Why this is easy to get silently wrong

If the build-arg is missing, `process.env.NEXT_PUBLIC_X` doesn't just evaluate to `undefined`
at runtime — it gets constant-folded to `undefined` **at build time**, and Next's minifier then
proves any code gated by `if (!x) return` is unreachable and deletes it. The result isn't a
console warning, it's the whole feature vanishing from the shipped bundle with no error anywhere.
This happened for real with `NEXT_PUBLIC_FRESHDESK_WIDGET_ID`: the Dockerfile declared the
`ARG`/`ENV`, DevOps set the var on the deployment, but `cloudbuild.yaml`'s `docker build` step
never forwarded it as `--build-arg` — so the entire Freshdesk widget bootstrap (script tag,
`fwSettings`, the launcher-hide call) was tree-shaken out of the client bundle, and the help
button silently did nothing. See the Verification section for how that was diagnosed.

## Task approach

1. Confirm it's a client var per Step 0.
2. Edit the project's `Dockerfile` — add the `ARG`/`ENV` pair in the `base` stage, alongside the
   existing `NEXT_PUBLIC_*` ones (before `FROM base AS builder`, so the `builder` stage — which
   runs `pnpm run build` — inherits it):

   ```dockerfile
   ARG NEXT_PUBLIC_API_FE_BASE_URL
   ENV NEXT_PUBLIC_API_FE_BASE_URL=$NEXT_PUBLIC_API_FE_BASE_URL

   ARG NEXT_PUBLIC_YOUR_NEW_VAR
   ENV NEXT_PUBLIC_YOUR_NEW_VAR=$NEXT_PUBLIC_YOUR_NEW_VAR
   ```

3. Edit `cloudbuild.yaml` — add a matching `--build-arg` to the `docker build` command (the step
   usually named `build-new-image`):

   ```yaml
   - 'docker build
      --build-arg NPM_AUTH_TOKEN=$$NPM_AUTH_TOKEN
      --build-arg NEXT_PUBLIC_API_FE_BASE_URL=$_NEXT_PUBLIC_API_FE_BASE_URL
      --build-arg NEXT_PUBLIC_YOUR_NEW_VAR=$_NEXT_PUBLIC_YOUR_NEW_VAR
      --tag ${_IMAGE}:$_TAG
      --tag ${_IMAGE}:latest
      -f Dockerfile .'
   ```

   Note the `$_` prefix (single `$`) for a Cloud Build substitution vs. `$$` for a var sourced
   from `secretEnv`/`availableSecrets` (like `NPM_AUTH_TOKEN`) — don't mix them up.

4. **Stop and tell the user explicitly**: the `_NEXT_PUBLIC_YOUR_NEW_VAR` substitution almost
   never has a default in `cloudbuild.yaml`'s `substitutions:` block (check — `_NEXT_PUBLIC_API_FE_BASE_URL`
   isn't declared there either). It's set per environment on the **Cloud Build trigger itself**,
   in the GCP console — outside this repo, and outside what this skill (or Claude) can do. Name
   the exact substitution variable and ask the user to have DevOps set it on every relevant
   trigger (staging, production, per client) with the real value. The code change alone will not
   make the variable appear until that's done.

## Verification

Don't just trust that it works — confirm the value actually landed in the shipped bundle:

```bash
curl -s https://<staging-host>/<some-page> -o page.html
grep -oE 'href="[^"]*\.js"|src="[^"]*\.js"' page.html | sed -E 's/^(href|src)="//; s/"$//' | sort -u
```

Fetch each of those chunk URLs and grep them for a string that only exists inside the code path
gated by the new var (e.g. a literal used only after `if (!widgetId)`). If the feature's other,
unconditional code is present but that literal is missing, the var didn't reach the build.

Two gotchas that will burn a naive check:
- A plain `/_next/static/chunks/[a-zA-Z0-9_.-]*\.js` regex **misses route-scoped chunks** like
  `/_next/static/chunks/app/(auth)/layout-<hash>.js` or `app/layout-<hash>.js` — these contain
  `/` and `()` and are usually where a root-layout component (something rendered from
  `app/layout.tsx`) actually lives. Match `href="[^"]*\.js"` / `src="[^"]*\.js"` broadly instead
  of trying to hand-roll the chunk-name shape.
- Absence of a literal proves the var was falsy at build time; it does **not** by itself prove
  which of the three wiring points is missing. Check the Dockerfile, `cloudbuild.yaml`, and the
  trigger substitution in that order.
