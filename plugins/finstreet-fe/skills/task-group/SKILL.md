---
name: task-group
description: "Complete guide to building TaskGroups with @finstreet/ui. A TaskGroup displays a set of tasks a user must complete before proceeding. Covers TaskPanels, TaskActions, and the TaskGroup wrapper. Use when building, modifying, or debugging any task group in the finstreet context."
---

# Task Group — Complete Guide

A `TaskGroup` shows users a set of tasks they need to complete. It consists of:

- **TaskPanels** — individual task cards with a status indicator, optional subtasks, and optional summary
- **ActionPanels** — optional action buttons co-located with their TaskPanel (modal triggers or links)
- **TaskGroup** — the outer wrapper that groups TaskPanels under a label

## Directory Structure

Each TaskPanel lives in its own folder. If the panel has actions, the ActionPanel is co-located inside that folder.

```
{featurePath}/taskGroups/{taskGroupName}/
  ├── {Product}{Role}{TaskGroupName}TaskGroup.tsx
  └── taskPanels/
      ├── {Product}{Role}{PanelName}TaskPanel/
      │   ├── index.tsx                                    ← the TaskPanel component
      │   └── {Product}{Role}{PanelName}ActionPanel.tsx    ← optional, only if panel has actions
      └── {Product}{Role}{PanelName2}TaskPanel/
          └── index.tsx
```

## File Creation Order

1. All TaskPanels (can be built independently of each other)
2. ActionPanels for panels that need them
3. TaskGroup (assembles everything)

## Key Imports

```typescript
// TaskPanel components
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
  TaskPanelContent,
  TaskPanelSummary,
} from "@finstreet/ui/components/patterns/TaskPanel";

// SubTask (for TaskPanelContent)
import { SubTask } from "@finstreet/ui/components/patterns/SubTask";

// ActionPanel components
import {
  ActionPanel,
  ActionPanelContent,
  ActionPanelAction,
} from "@finstreet/ui/components/patterns/ActionPanel";

// Layout — used INSIDE each TaskPanel, not at TaskGroup level
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";

// TaskGroup wrapper
import { TaskGroup } from "@finstreet/ui/components/patterns/TaskGroup";

// Common utilities
import { routes } from "@/routes";
import { useExtracted } from "next-intl";
import { VStack } from "@styled-system/jsx";
```

## Step-by-Step Reference

- For **TaskPanel** patterns (shell, status, subtasks, summary), see [task-panel.md](task-panel.md)
- For **ActionPanel** patterns (modal triggers, link actions), see [action-panel.md](action-panel.md)
- For **TaskGroup** assembly, see [task-group.md](task-group.md)

## Rules

1. Build all TaskPanels before the TaskGroup
2. `TasksAndActionsLayout` goes INSIDE each TaskPanel, not around the TaskGroup
3. Each TaskPanel always wraps itself in `TasksAndActionsLayout` with `tasks` and `actions` areas — even if there are no actions (use `<></>` as empty placeholder)
4. `prefetch={true}` and `scroll={true}` on `TaskPanel` and `SubTask` unless told otherwise
5. Use `done` / `todo` status (`completed ? "done" : "todo"`): `todo` is the empty ring, `active` draws a dot and is not used for unfinished tasks. Only use `inactive` or `warning` if explicitly required
6. ActionPanels always use `variant="invisible"`
7. ActionPanels are always `"use client"` components
8. Use `useExtracted` from `next-intl` (not `useTranslations`)
9. Use arrow function exports: `export const MyComponent = ({}: Props) => {}`
10. Props type is always named `Props`
