# Examples

## Adding a new sub-page with a form and a task group

Given a prompt like: *"I need a new page where property managers can review and confirm the onboarding steps for a financing case. It needs a metadata form, a task group of steps to complete, and a loading skeleton. The API endpoint exists already."*

The plan would be:

```
## Task Plan

1. **Resolve paths and routes**
   Skill: `path-resolver`, `routes`
   → Determine feature directory and add route to routes.ts

2. **Create page shell**
   Skill: `page`
   → Build the Next.js page with metadata, params, and sub-page header
   Depends on: 1

3. **Build metadata form**
   Skill: `form`
   → Schema, fields, action, default values, config, and form components
   Depends on: 1

4. **Build the task group**
   Skill: `task-group`
   → TaskPanels with status indicators, plus any ActionPanels
   Depends on: 1

5. **Assemble page content**
   Skill: `ui`
   → Compose form and task group into the page content component
   Depends on: 2, 3, 4

6. **Create loading skeleton**
   Skill: `loading`
   → Build loading.tsx that mirrors the page structure
   Depends on: 5

7. **Write e2e tests**
   Skill: `e2e-test`
   → Happy path test covering form submission and task completion
   Depends on: 5
```

## Adding a field to a page of an inquiry process

Given a prompt like: *"Add a new number input field sum of loans (label: Anfragesumme) with currency EUR to the first page (Anfragedetails) of the inquiry process"*

```
## Task Plan

1. **Research information**
   Skill: no skill required
   → Determine the required files and places in the code that need editing

2. **Add new field to the form**
   Skill: `form`
   → Add the number input field to the page
   Depends on: 1
```