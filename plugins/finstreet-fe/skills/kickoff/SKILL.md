---
name: kickoff
description: "Decomposes a larger prompt into a structured, skill-annotated task plan. Pass it a description of the work you want done and it returns a step-by-step plan where each task is mapped to the right finstreet-fe skill. Use when starting a new feature, tackling a multi-step request, or when you want Claude Code to work through a complex prompt task by task with progress tracking. Trigger this whenever the user says 'kickoff', 'plan this', 'break this down', 'structure this', or passes a long multi-part prompt they want organized."
user-invocable: true
argument-hint: "<description of the work to be done>"
---

# Kickoff — Prompt Decomposition & Skill Mapping

You take a freeform description of work and turn it into a structured, trackable task plan. Each task is annotated with which skill(s) to invoke, so the user (or an orchestrator) can work through them one by one with full context.

## What You Do

1. **Read the user's prompt** — understand what they want built or changed
2. **Decompose into tasks** — break the work into discrete, ordered steps
3. **Map skills to tasks** — annotate each step with the skill(s) that apply
4. **Create a task list** — use Claude Code's task tools so progress is visible
5. **Present the plan** — show the user the structured plan for confirmation before starting

## How to Decompose

Think about the work in terms of **what needs to exist when it's done** and work backwards:

- Does it need a new API endpoint? → `secure-fetch` first
- Does it need a new page? → `page` (and probably `routes` before it)
- Does it need a form? → `form` (and `page` for the shell)
- Does it need a loading state? → `loading` (after the page exists)
- Does it need e2e tests? → `e2e-test` (after everything else)

Order tasks so that each step's output feeds the next step's input. Backend before frontend. Shell before content. Data before UI.

## Skill Catalog

Reference this catalog when mapping tasks to skills. Each entry describes what the skill does and when to reach for it. Not all tasks require a skill from this list. There might be some generic work like research or investigation. You are always free to do work on your own but ONLY and ONLY if the description is not included in the task list.

### Backend & Data

| Skill | What It Does | When to Use                                                                                                                                                                                                                                                                                                                    |
|-------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **secure-fetch** | Creates type-safe server/client HTTP request functions using `@finstreet/secure-fetch`. Covers schema, server.ts, and client.ts files. | Any time you need to call a backend API endpoint — GET, POST, PUT, DELETE. Always the first step when backend integration is needed. If you figure out that one of the described tasks interacts with any request make sure to invoke this skill for editing an existing endpoint and of course call it for all new endpoints  |
| **mock-api** | Creates mock API endpoints that plug into the secure-fetch pattern. | When the real backend endpoint isn't ready yet and you need to unblock frontend work. Oftentimes it is mentioned that the backend implementation is not ready yet - if it's not make sure to update the mock endpoint and to use it in these cases so that the FE can work with it and afterwards just has to replace the mock |

### Pages & Routing

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **routes** | Resolves, adds, and edits entries in `routes.ts`. | When a new page needs a route, or you need to look up an existing route path. |
| **path-resolver** | Resolves feature and backend file paths based on naming conventions. | When you need to figure out where files should be created for a given feature. Invoke directly: `/path-resolver`. |
| **page** | Builds Next.js page shells — metadata, params, header selection, content wrappers. | When creating a new page. Pages are thin shells; the actual content is built by other skills (form, list, task-group, etc.). |
| **loading** | Builds `loading.tsx` skeleton pages that mirror page content structure. | After a page exists and you want a loading skeleton for it. |

### Forms & Input

| Skill | What It Does | When to Use                                                                                                                                                                                                                                        |
|-------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **form** | Full form implementation using `@finstreet/forms` — schema, fields, action, default values, config, and components. | Always use it when some kind of form is mentioned. Either creating new one or updating an existing form.                                                                                                                                           |
| **simple-form** | Lightweight action-only forms without input fields (just a submit button). | Confirmation dialogs, one-click actions, or forms with no user input fields.                                                                                                                                                                       |
| **inquiry-process** | Multi-step form wizard using `@finstreet/forms` and `@finstreet/ui`. | This is mostly needed when building a NEW inquiry process or updating the structure (not single fields) of an inquiry process. Updating (adding, removing, editing) fields should inside an inquiry process should still be done by the form skill |

### UI Components & Patterns

| Skill | What It Does | When to Use |
|-------|-------------|-------------|
| **ui** | Expert guide to PandaCSS layout primitives and `@finstreet/ui` components. | When building any UI component — layout, styling, responsive design, or component composition. |
| **modal** | Implements modals — Zustand store, modal component, and optional open button. | When you need a dialog/modal overlay. |
| **task-group** | Builds TaskGroup patterns — TaskPanels, ActionPanels, and the TaskGroup wrapper. | When displaying a set of tasks a user must complete before proceeding (e.g., checklist-style UI). |
| **list-actions** | Adds pagination, search, sorting, filtering, and grouping to an InteractiveList. | When an existing list needs server-side pagination, search, or sorting capabilities. |

## Task Plan Format

Present the plan to the user as a numbered list. Each task should have:

1. **Title** — short description of what to do
2. **Skill** — which skill to invoke (or "manual" if no skill applies)
3. **Details** — what specifically needs to happen in this step
4. **Depends on** — which prior tasks must be complete first

## Creating the Task List

After presenting the plan and getting user confirmation, create tasks using Claude Code's task tools:

```
TaskCreate: task 1 title — skill: X — details
TaskCreate: task 2 title — skill: Y — details (depends on: 1)
...
```

This gives the user a live progress tracker. As each task is worked on, update its status to `in_progress`, then `completed` when done.

## Rules

1. **Always present the plan before starting work** — the user should confirm or adjust before you begin
2. **Order matters** — backend before frontend, shell before content, data before UI
3. **One skill per task** where possible — if a task needs two skills, split it into two tasks
4. **Include git tasks** — if the `finstreet-dev` plugin is available, suggest `new-feature-branch` at the start and `commit`/`pr` at the end; otherwise leave them out or mark them manual
5. **Be specific** — don't just say "build the form", say what the form is for, what fields it needs, what the action does
6. **Preserve the user's intent** — the plan should accomplish everything the user asked for, not just the parts that map cleanly to skills
7. **Mark non-skill tasks as "manual"** — some work doesn't have a matching skill, and that's fine
8. **Use backend field names if available** - in our application we want the FE fields to have the same name as the BE fields. So if any fields are mentioned from BE side or in swagger make sure to **ALWAYS** use them. In some cases the field names might not be available. Go ahead and choose a reasonable fieldname but add a TODO comment so that it's easier for the agent to fix after we get the correct name from backend.
9. Reference the [examples][example.md] file before you create the plan to know what is expected of you 