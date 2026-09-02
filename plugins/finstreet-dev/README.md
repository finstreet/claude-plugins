# finstreet-dev

Generic developer workflow skills — git branching, committing, and pull requests. No Finstreet-specific dependencies; works in any repo. Ticket numbers are optional so it's usable in projects that don't track tickets.

## Install

First add the marketplace (once per machine — see the [root README](../../README.md) if you haven't):

```
/plugin marketplace add finstreet/claude-plugins
```

Then install the plugin:

```
/plugin install finstreet-dev@finstreet-plugins
```

No other setup required.

## Update

```
/plugin marketplace update finstreet-plugins
/plugin update finstreet-dev@finstreet-plugins
```

## Skills

Invoked as `/finstreet-dev:<name>`. All user-invoked only — no automatic triggering.

- `new-feature-branch` — Create a branch using the [Conventional Branch](https://conventional-branch.github.io) naming convention. Auto-detects the trunk branch (`dev`, `main`, or `master`).
- `commit` — Review, stage, commit, and push current changes. Ticket prefix is optional; uses HEREDOC-safe multi-line messages.
- `pr` — Create a pull request against the repo's trunk branch (auto-detected). Pushes the current branch first if it isn't on the remote yet; checks for an existing PR to avoid duplicates.
- `jira-flow` — End-to-end orchestrator: takes a Jira issue (URL, key, or pasted text) and runs it through `new-feature-branch` → `finstreet-fe:kickoff` for planning → implementation → `commit` → `pr`. Use when you want to go from ticket to PR in one shot.

## Changelog

### 1.0.0
- Extracted from the `finstreet-fe` plugin (previously `automation`) into its own plugin so non-frontend projects can install just the workflow skills.
- Auto-detect the trunk branch (`dev` / `main` / `master`) in `new-feature-branch` and `pr`.
- Made the ticket prefix optional in all three skills.
- Hardened `commit` and `pr` with explicit-path staging, HEREDOC message bodies, and push-before-PR.
