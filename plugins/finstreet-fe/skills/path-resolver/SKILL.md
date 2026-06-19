---
name: path-resolver
description: Resolves feature and backend paths based on naming conventions and project structure rules. Use when you need to determine where files should be created for a given feature.
user-invocable: true
---

You resolve file paths for features based on the project's directory conventions. You NEVER search inside the project — you only apply the rules below.

## Top-Level Structure

```
src/
├── app/                                  ← Next.js App Router (routes, layouts, pages)
├── features/                             ← feature-scoped code (see below)
├── shared/                               ← cross-feature reusable code (see below)
├── layouts/                              ← top-level layout components
├── lib/                                  ← third-party integrations and wrappers
├── i18n/                                 ← translation setup
├── styles/                               ← global styles
├── auth.ts                               ← NextAuth config
├── middleware.ts                         ← Next.js middleware
└── routes.ts                             ← route constants
```

## Feature Directory Structure

```
src/features/{featureName}/
├── {product}/                         ← optional (e.g., hoaLoan, hoaAccount)
│   └── {role}/                        ← optional (e.g., pm, fsp)
│       ├── backend/                   ← schema.ts, server.ts, client.ts
│       ├── forms/
│       │   ├── common/               ← shared files when multiple related forms exist
│       │   └── {subFeatureName}/     ← e.g., createPropertyItems/
│       ├── modals/{subFeatureName}/
│       ├── interactiveLists/{subFeatureName}/
│       ├── components/
│       └── hooks/
├── common/                            ← shared across products/roles
└── backend/                           ← when no product/role segmentation
```

- **product** and **role** are optional — omit the segment entirely when not provided
- **forms**, **modals**, and **interactiveLists** append `{featureType}s/{subFeatureName}` to the path
- **inquiryProcess** and **request** use the base path directly — they do NOT append featureType or subFeatureName
- Always use `camelCase` in paths regardless of input casing (e.g., `hoa-loan` → `hoaLoan`)

### Form Naming Convention

Always use descriptive subFeatureNames: `{action}{FeatureName}` (e.g., `createPropertyItems`, `updateReferenceAccount`). Never use generic names like `create` or `update`. Since the path already sits inside `forms/`, the directory name doesn't need a `Form` suffix.

When multiple related forms exist (e.g., CRUD operations on the same entity), shared files (base schema, shared fields, base component) go into `forms/common/` — never loose in `forms/` itself. Each form's unique files (action, config, component) live in their own subdirectory.

```
forms/
├── common/                              ← shared across related forms
│   ├── {featureName}Schema.ts
│   ├── use{FeatureName}FormFields.ts
│   └── {FeatureName}FormBase.tsx
├── create{FeatureName}/
├── update{FeatureName}/
└── delete{FeatureName}/
```

A single standalone form needs no `common/` — all files live in the subdirectory directly.

## Shared Directory

Code that is reused across multiple features lives in `src/shared/`. Never create feature-specific code here.

```
src/shared/
├── auth/                                 ← auth helpers (role config, redirect validation)
├── backend/                              ← shared backend utilities
│   ├── mocks/                            ← MSW mock config, handler registry
│   │   └── handlers/
│   ├── models/
│   │   └── common/                       ← cross-feature API models (document, meta, solution, etc.)
│   ├── createClientFetchFunction.ts
│   ├── createServerFetchFunction.ts
│   ├── fetchWithErrorHandling.ts
│   ├── handleFormRequestError.ts
│   └── secureFetchConfig.ts
├── components/                           ← reusable UI components (one directory per component)
│   └── form/                             ← shared form components (Form, DynamicFormField, YesNoRadioGroup)
├── context/                              ← React contexts (e.g., portal)
├── hooks/                                ← reusable hooks (pagination, filters, element sizing, toasts)
├── reactQuery/                           ← React Query client config
├── types/                                ← shared TypeScript types (InteractiveListTypes, GroupConfig, searchParams, Portal)
├── utils/                                ← general-purpose utilities (constants, toasts, file upload, parsers, errors)
└── validations/                          ← reusable Zod schemas (Date, Iban, Phone, Password, TaxID, etc.)
```

Guidance on placement:

- **Validation schemas** reused across features → `shared/validations/`
- **Fetch helpers / error handlers** → `shared/backend/`
- **API models used by multiple features** → `shared/backend/models/common/`
- **Form primitives** (generic `Form`, `DynamicFormField`, etc.) → `shared/components/form/`; feature-specific form components stay inside the feature
- **Hooks not tied to a single feature** → `shared/hooks/`; feature-specific hooks live in `features/{featureName}/.../hooks/`
- **Types shared across features** → `shared/types/`; feature-specific types stay with the feature

## Inputs

- **featureName** — required
- **subFeatureName** — required
- **featureType** — required (form, interactiveList, inquiryProcess, request, modal)
- **product** — optional
- **role** — optional

## Response Format

You will answer in Markdown like this. NEVER add anything else to the content. You are NOT allowed to expand this in any shape or form!

# Paths for this feature

**Feature Path**: the feature path that you resolved

## Arguments

$ARGUMENTS
