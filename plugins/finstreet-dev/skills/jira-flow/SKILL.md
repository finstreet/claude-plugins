---
name: jira-flow
description: End-to-end workflow that turns a Jira issue into a shipped PR. Pastes/links a Jira ticket and runs it through branch creation, plan decomposition, implementation, commit, and PR. Use whenever the user pastes a Jira URL, mentions a Jira ticket key (e.g. EB-1250), or says things like "implement this ticket", "let's work on this Jira issue", "kick off this story", or "take this from ticket to PR". Prefer this skill over invoking new-feature-branch / kickoff / commit / pr individually when the starting point is a Jira issue.
user-invocable: true
argument-hint: "<jira issue URL, key, or pasted ticket text>"
---

# Jira Flow — Ticket to PR

You are orchestrating an entire feature lifecycle for a single Jira issue: branch → plan → build → commit → PR. The user has given you a Jira issue as input. Your job is to drive the whole thing, delegating each phase to the existing skill that owns it. Do not reinvent any of those skills here — invoke them.

## Why this exists

The user already has good skills for the individual phases (`new-feature-branch`, `kickoff`, `commit`, `pr`) - these are all either skills from finstreet-dev or finstreet-fe plugins. What was missing was the glue: a single entry point that takes a Jira ticket, threads it through all of them in the right order, and keeps a coherent view of progress. That is what you provide. Stay thin — the value is in the orchestration, not in re-implementing steps that already live elsewhere.

## Inputs you might receive

The argument to this skill could be any of these shapes. Detect what you have and handle it:

- **A Jira URL** — e.g. `https://finstreet.atlassian.net/browse/EB-1250`
- **A bare ticket key** — e.g. `EB-1250`
- **Pasted ticket text** — title, description, acceptance criteria, etc., with or without a key
- **A mix** — a key plus extra notes the user wants you to factor into the plan

If the argument is empty, ask the user once for the issue and then proceed.

## Phase 0 — Understand the ticket

Pull together the facts you need before doing anything else:

1. **Extract the ticket key** from the input (URL path, plain key, or by scanning text for the `XX-NNNN` pattern). Keys are case-insensitive; preserve the user's casing for display but lowercase them for branch names.
2. **Get the full ticket content.** If the Atlassian MCP is available, fetch the issue with `mcp__claude_ai_Atlassian__getJiraIssue` (you may need `mcp__claude_ai_Atlassian__getAccessibleAtlassianResources` first to resolve the `cloudId`). If the MCP is not available, work from the pasted text. If you only have a key and no MCP, ask the user to paste the ticket content rather than guessing.
3. **Summarise back to the user** in two or three lines: ticket key, title, what it's asking for. This is your sanity check — if you misread the ticket, the user catches it now, not after a branch is created.

Capture two derived values you'll need throughout the run:

- **`ticket`** — the lowercased key, e.g. `eb-1250`. Use this for the branch name and the commit/PR prefix (which will uppercase it as `EB-1250`).
- **`description`** — a 2–5 word kebab-case slug derived from the ticket title. Drop filler words ("add", "the", "a"), keep the meaningful nouns. Example: title "Add user authentication flow" → `user-authentication`.

Afterwards move all subtasks with [FE] to `In Progress` if it's not already. This is a visual cue for the team that work has started.

## Phase 1 — Create the feature branch

Delegate to the `new-feature-branch` skill (same plugin). Read `plugins/finstreet-dev/skills/new-feature-branch/SKILL.md` and follow its workflow. Pass it the `ticket` and `description` you derived in Phase 0.

Default the branch **type** to `feature` unless the ticket is clearly a bug (issue type "Bug", title starts with "Fix"/"Bug:") in which case use `bugfix`, or clearly a hotfix in which case use `hotfix`. If you're unsure, ask the user once with your best guess pre-selected; don't stall.

After the branch is created and checked out, confirm to the user which branch you're on before moving on. The remaining phases will commit and push from this branch, so getting it right matters.

## Phase 2 — Decompose the work (kickoff)

Now that you are on the feature branch, delegate planning to the `kickoff` skill in the `finstreet-fe` plugin. Read `plugins/finstreet-fe/skills/kickoff/SKILL.md` and follow it. Feed it the ticket title + description + any acceptance criteria you have — basically everything you summarised in Phase 0, plus any extra user notes from the input.

Why pipe it through `kickoff` rather than just listing tasks yourself: `kickoff` is the source of truth for which finstreet-fe skill to reach for at each step. It maps form work to `form`, page work to `page`, list work to `list-actions`, and so on. Re-implementing that mapping here would drift the moment a new finstreet-fe skill is added.

The output of this phase is a **task plan** (presented to the user) plus a live task list created via `TaskCreate`. Get user confirmation on the plan before moving on. If they want changes, adjust the plan and re-confirm.

## Phase 3 — Execute the plan

Work through the task list one task at a time:

1. `TaskUpdate` the current task to `in_progress` before you start it.
2. Invoke the skill the task points to and follow its instructions. For tasks marked "manual", do the work directly.
3. When the task is done, `TaskUpdate` it to `completed` and move to the next one. **Don't batch completions** — mark each one immediately so the user sees real-time progress.
4. If a task uncovers new work, add it via `TaskCreate` rather than silently expanding the current task.

Stay on the feature branch the whole time. Do not commit incrementally between tasks unless the user explicitly asks for it — the `commit` skill in Phase 4 is where staging and committing happens. (You may run formatters, type-checks, or local test scripts during this phase; just don't commit yet.)

If you get blocked — missing credentials, an ambiguous requirement, a failing test you can't unblock — stop and surface the blocker. Do not skip ahead to commit/PR with half the work done.

## Phase 4 - Verify

Use the playwright mcp to verify your changes.

## Phase 4 — Commit

Once every task is `completed`, delegate to the `commit` skill (same plugin). Read `plugins/finstreet-dev/skills/commit/SKILL.md` and follow it. The commit skill will:

- Review `git status` / `git diff` for stray debug code, secrets, or out-of-scope files
- Stage explicit paths
- Write a ticket-prefixed message (it pulls `EB-1250` from the branch name automatically)
- Commit and push

If the commit skill flags something suspicious (debug logs, an accidentally-staged `.env`, etc.), pause and resolve it before continuing — that's the whole point of the safety pass.

## Phase 5 — Pull request

Finally, delegate to the `pr` skill (same plugin). Read `plugins/finstreet-dev/skills/pr/SKILL.md` and follow it. It auto-detects the trunk branch, builds a ticket-prefixed title and structured body from the commit history, and opens the PR via `gh pr create`.

If the user said "draft PR" anywhere in the original input, pass `--draft`.

Move all subtasks labeled with [FE] into `In CR`.

## Phase 6 — Confirm

Report a single tight summary to the user:

- The Jira ticket (key + title)
- The branch name
- The commit hash + summary
- The PR URL (and whether it's a draft)

That's the end of the flow.

## Jira Flow

I want you to move the ticket through it's different phases and assign the FE subtask to the correct person. The correct person will be mentioned in the projects CLAUDE.md file.

Here is an explanation of the JIRA issue flow that we have in our project:

`To Refine` --> `ToDo` --> `In Progress` --> `In CodeReview` --> `In QA` --> `Done`

Your task is it to move the ticket into `In Progress` as soon as you start working on it and `In CodeReview` after you created the PR.

## Behavioural notes

- **Be explicit about which phase you are in.** A short heading like `### Phase 2 — kickoff` before you start each phase keeps the user oriented during long runs.
- **Don't ask for the ticket key twice.** Phase 0 nails down `ticket` and `description`; every later phase reuses them. If you find yourself prompting again, you forgot to thread context.
- **Don't drift from the plan without saying so.** If during Phase 3 you realise a task isn't needed, or a new one is, update the task list visibly rather than silently doing something different.
- **Honour the existing skills' guardrails.** If `commit` asks before staging suspicious files, or `pr` refuses to run with uncommitted changes, respect that — don't paper over it from this skill.
- **Don't half-finish.** If you get to Phase 3 and run out of context, time, or clarity, stop and tell the user where you are. A clean handoff mid-flow is fine; a silent partial PR is not.
