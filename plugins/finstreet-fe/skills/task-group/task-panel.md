# Building a Task Panel

File: `{featurePath}/taskGroups/{taskGroupName}/taskPanels/{Product}{Role}{PanelName}TaskPanel/index.tsx`

There are two cases for TaskPanels:

1. **TaskPanel without actions** — The panel stands alone with no associated ActionPanel. No layout wrapper needed — just render the `TaskPanel` directly.
2. **TaskPanel with actions** — The panel has a co-located ActionPanel. Wrap everything in `TasksAndActionsLayout` to create a `tasks` area (the card) and an `actions` area (the ActionPanel).

Only add `TasksAndActionsLayout` when the panel has actions. Panels without actions render the `TaskPanel` on its own.

## Case 1: TaskPanel without actions

The panel links somewhere and shows a completion status. No `TasksAndActionsLayout` needed — render the `TaskPanel` directly.

```tsx
import { routes } from "@/routes";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import { useExtracted } from "next-intl";

type Props = {
  financingCaseId: string;
  completed: boolean;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  completed,
  financingCaseId,
}: Props) => {
  const t = useExtracted();

  return (
    <TaskPanel
      href={routes.{role}.{resource}.{action}(financingCaseId)}
      prefetch={true}
      scroll={true}
      name={t("title")}
    >
      <TaskPanelHeader>
        <TaskPanelStatus status={completed ? "done" : "todo"} />
        <TaskPanelTitle>{t("title")}</TaskPanelTitle>
      </TaskPanelHeader>
    </TaskPanel>
  );
};
```

## Case 2: TaskPanel with actions

When a panel has associated actions, import the co-located ActionPanel and render it in the `actions` area.

```tsx
import { routes } from "@/routes";
import {
  TaskPanel,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import {
  TasksAndActionsLayout,
  TasksAndActionsLayoutArea as Area,
} from "@finstreet/ui/components/pageLayout/Layout/TasksAndActionsLayout";
import { useExtracted } from "next-intl";
import { {Product}{Role}{PanelName}ActionPanel } from "./{Product}{Role}{PanelName}ActionPanel";

type Props = {
  financingCaseId: string;
  completed: boolean;
  flags: FlagsType;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  completed,
  flags,
}: Props) => {
  const t = useExtracted();

  return (
    <TasksAndActionsLayout>
      <Area gridArea={"tasks"}>
        <TaskPanel
          href={routes.{role}.{resource}.{action}(financingCaseId)}
          prefetch={true}
          scroll={true}
          name={t("title")}
        >
          <TaskPanelHeader>
            <TaskPanelStatus status={completed ? "done" : "todo"} />
            <TaskPanelTitle>{t("title")}</TaskPanelTitle>
          </TaskPanelHeader>
        </TaskPanel>
      </Area>
      <Area gridArea={"actions"}>
        <{Product}{Role}{PanelName}ActionPanel
          financingCaseId={financingCaseId}
          flags={flags}
        />
      </Area>
    </TasksAndActionsLayout>
  );
};
```

---

## TaskPanel Composition

A `TaskPanel` is composed of two main areas: the **header** and the optional **content**. The header is always present. The content area is used for collapsible panels with SubTasks or descriptions.

### TaskPanel modes

A `TaskPanel` operates in one of two modes:

- **Link mode** — provide `href` and `name`. The panel renders as a Next.js Link with an arrow-right icon. Use this when the panel navigates somewhere.
- **Collapsible mode** — set `collapsible={true}`. The panel expands/collapses with caret icons. Use this when the panel contains SubTasks or other content. Optionally set `startOpen={true}` to expand by default.

These modes are mutually exclusive.

### Header: TaskPanelHeader

`TaskPanelHeader` is the always-visible part of the panel. It accepts up to three children in order:

1. **`TaskPanelStatus`** (optional) — a status indicator dot
2. **`TaskPanelTitle`** (required) — the panel heading (renders as `<h3>`)
3. **`TaskPanelSummary`** (optional) — summary info aligned to the right

#### Header with Status and Title

The most common header — a status dot and a title.

```tsx
<TaskPanelHeader>
  <TaskPanelStatus status={completed ? "done" : "todo"} />
  <TaskPanelTitle>{t("title")}</TaskPanelTitle>
</TaskPanelHeader>
```

`TaskPanelStatus` accepts: `"todo"`, `"done"`, `"partiallyDone"`, `"active"`, `"inactive"`, `"warning"`.

An unfinished task is `"todo"` (an empty ring), not `"active"`: `"active"` draws a filled dot inside the ring. The same goes for `SubTask`'s `status`.

#### Header with Summary

`TaskPanelSummary` displays additional info (e.g. progress counts, conditions) to the right of the title. Wrap it in `<Box hideBelow={"lg"}>` so it hides on smaller screens.

```tsx
import { Typography } from "@finstreet/ui/components/base/Typography";
import { Box } from "@styled-system/jsx";

<TaskPanelHeader>
  <TaskPanelStatus status={completed ? "done" : "todo"} />
  <TaskPanelTitle>{t("title")}</TaskPanelTitle>
  <Box hideBelow={"lg"}>
    <TaskPanelSummary justifyContent={"flex-end"}>
      <Typography textAlign={"right"}>
        {t.rich("summary", {
          br: () => <br />,
          strong: (chunks) => <strong>{chunks}</strong>,
          current: () => completedCount,
          total: () => totalCount,
        })}
      </Typography>
    </TaskPanelSummary>
  </Box>
</TaskPanelHeader>
```

### Content: TaskPanelContent

`TaskPanelContent` is the expandable body of a collapsible panel. It holds SubTasks and/or a description. Only used with `collapsible={true}`.

#### TaskPanelDescription

An optional introductory text block rendered inside `TaskPanelContent` with bottom padding. Place it before any SubTasks.

```tsx
import { Typography } from "@finstreet/ui/components/base/Typography";

<TaskPanelContent>
  <TaskPanelDescription>
    <Typography as="p">{t("description")}</Typography>
  </TaskPanelDescription>
  {/* SubTasks go here */}
</TaskPanelContent>
```

### Full collapsible example with all components

```tsx
import { routes } from "@/routes";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { SubTask } from "@finstreet/ui/components/patterns/SubTask";
import {
  TaskPanel,
  TaskPanelContent,
  TaskPanelDescription,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelSummary,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import { Box } from "@styled-system/jsx";
import { useExtracted } from "next-intl";

type Props = {
  financingCaseId: string;
  contractDetails: ContractDetailsType;
  completedCount: number;
  totalCount: number;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  contractDetails,
  completedCount,
  totalCount,
}: Props) => {
  const t = useExtracted();

  return (
    <TaskPanel collapsible startOpen={!contractDetails.completed}>
      <TaskPanelHeader>
        <TaskPanelStatus
          status={contractDetails.completed ? "done" : "todo"}
        />
        <TaskPanelTitle>{t("title")}</TaskPanelTitle>
        <Box hideBelow={"lg"}>
          <TaskPanelSummary justifyContent={"flex-end"}>
            <Typography textAlign={"right"}>
              {t.rich("summary", {
                br: () => <br />,
                strong: (chunks) => <strong>{chunks}</strong>,
                current: () => completedCount,
                total: () => totalCount,
              })}
            </Typography>
          </TaskPanelSummary>
        </Box>
      </TaskPanelHeader>
      <TaskPanelContent>
        <TaskPanelDescription>
          <Typography as="p">{t("description")}</Typography>
        </TaskPanelDescription>
        <SubTask
          status={contractDetails.subtaskOne.completed ? "done" : "todo"}
          actionLabel={
            contractDetails.subtaskOne.completed
              ? t("subtasks.subtaskOne.actions.viewData")
              : t("subtasks.subtaskOne.actions.addData")
          }
          name={t("subtasks.subtaskOne.title")}
          href={routes.{role}.{resource}.subtaskOne(financingCaseId)}
          prefetch={true}
          scroll={true}
        >
          {t("subtasks.subtaskOne.title")}
        </SubTask>
      </TaskPanelContent>
    </TaskPanel>
  );
};
```

---

## SubTasks

SubTasks are the individual items inside a collapsible `TaskPanelContent`. They render as a vertical list with automatic dividers between them.

Import: `import { SubTask } from "@finstreet/ui/components/patterns/SubTask";`

A SubTask operates in one of two modes — **link mode** or **annotation mode**. These are mutually exclusive (discriminated union).

### Link mode

The SubTask navigates somewhere. Provide `href` and `name`. An arrow-right icon appears on the right side, with an optional `actionLabel` text next to it.

```tsx
<SubTask
  status={completed ? "done" : "todo"}
  href={routes.{role}.{resource}.{action}(financingCaseId)}
  name={t("subtasks.example.title")}
  actionLabel={
    completed
      ? t("subtasks.example.actions.viewData")
      : t("subtasks.example.actions.addData")
  }
  prefetch={true}
  scroll={true}
>
  {t("subtasks.example.title")}
</SubTask>
```

**Props (link mode):**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `"todo" \| "done" \| "partiallyDone" \| "active" \| "inactive" \| "warning"` | yes | Visual status indicator |
| `href` | `string` | yes | Navigation URL |
| `name` | `string` | yes | Accessible name for the link |
| `children` | `React.ReactNode` | yes | Display label |
| `actionLabel` | `string` | no | Text next to the arrow icon (e.g. "View data", "Add data") |
| `prefetch` | `LinkProps["prefetch"]` | no | Next.js Link prefetch |
| `scroll` | `boolean` | no | Next.js Link scroll |
| `replace` | `boolean` | no | Next.js Link replace |
| `data-testid` | `string` | no | Test identifier |

#### actionLabel pattern

Use `actionLabel` to give users context about what happens when they click. Typically toggle between two labels based on completion status:

```tsx
actionLabel={
  completed
    ? t("subtasks.example.actions.viewData")   // already done → "View data"
    : t("subtasks.example.actions.addData")    // not done → "Add data"
}
```

### Annotation mode

The SubTask is non-interactive and shows static information with a custom annotation on the right side instead of an arrow icon.

```tsx
<SubTask status="done" annotation={t("subtasks.example.annotation")}>
  {t("subtasks.example.title")}
</SubTask>
```

**Props (annotation mode):**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `"todo" \| "done" \| "partiallyDone" \| "active" \| "inactive" \| "warning"` | yes | Visual status indicator |
| `annotation` | `React.ReactNode` | yes | Custom content on the right side |
| `children` | `React.ReactNode` | yes | Display label |
| `data-testid` | `string` | no | Test identifier |

When `annotation` is provided, `href`, `name`, and `actionLabel` cannot be used.

### SubTask with description text

SubTask children can include a secondary description below the title:

```tsx
<SubTask
  status="todo"
  href={routes.{role}.{resource}.{action}(financingCaseId)}
  name={t("subtasks.payment.title")}
  actionLabel={t("subtasks.payment.actions.addData")}
  prefetch={true}
  scroll={true}
>
  {t("subtasks.payment.title")}
  <br />
  <Typography color="text.dark" fontSize="s">
    {t("subtasks.payment.description")}
  </Typography>
</SubTask>
```

### Full example: collapsible panel with mixed SubTask modes

```tsx
import { routes } from "@/routes";
import { Typography } from "@finstreet/ui/components/base/Typography";
import { SubTask } from "@finstreet/ui/components/patterns/SubTask";
import {
  TaskPanel,
  TaskPanelContent,
  TaskPanelHeader,
  TaskPanelStatus,
  TaskPanelTitle,
} from "@finstreet/ui/components/patterns/TaskPanel";
import { useExtracted } from "next-intl";

type Props = {
  financingCaseId: string;
  details: DetailsType;
};

export const {Product}{Role}{PanelName}TaskPanel = ({
  financingCaseId,
  details,
}: Props) => {
  const t = useExtracted();

  return (
    <TaskPanel collapsible startOpen={!details.completed}>
      <TaskPanelHeader>
        <TaskPanelStatus status={details.completed ? "done" : "todo"} />
        <TaskPanelTitle>{t("title")}</TaskPanelTitle>
      </TaskPanelHeader>
      <TaskPanelContent>
        {/* Link mode SubTask — navigates to a page */}
        <SubTask
          status={details.stepOne.completed ? "done" : "todo"}
          href={routes.{role}.{resource}.stepOne(financingCaseId)}
          name={t("subtasks.stepOne.title")}
          actionLabel={
            details.stepOne.completed
              ? t("subtasks.stepOne.actions.viewData")
              : t("subtasks.stepOne.actions.addData")
          }
          prefetch={true}
          scroll={true}
        >
          {t("subtasks.stepOne.title")}
        </SubTask>
        {/* Annotation mode SubTask — non-interactive, shows status text */}
        <SubTask
          status={details.stepTwo.completed ? "done" : "todo"}
          annotation={
            details.stepTwo.completed
              ? t("subtasks.stepTwo.annotation.completed")
              : t("subtasks.stepTwo.annotation.pending")
          }
        >
          {t("subtasks.stepTwo.title")}
        </SubTask>
      </TaskPanelContent>
    </TaskPanel>
  );
};