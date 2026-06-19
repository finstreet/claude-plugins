# Reusable Headers

PageHeader primitives (`PageHeader`, `PageHeaderTitle`, `PageHeaderActions`, `PageHeaderBackButton`) are documented in the UI skill. This file covers **when to use a reusable header component vs composing inline**, which reusable headers exist, and where to store new ones.

## When to Use a Reusable Header

**Use a reusable header** when multiple sub-pages under the same parent share identical back-navigation and subtitle logic. This is the case for all sub-pages under an overview/detail page (e.g., every form page under `[financingCaseId]/`).

**Compose inline** when the header is unique to a single page — overview/detail pages (`[id]/page.tsx`) and simple list pages. These headers have bespoke content (status indicators, case manager info, rich subtitles) that doesn't repeat elsewhere.

| Page type | Header approach |
|-----------|----------------|
| Sub-page under overview (form, documents, details) | Reusable header component |
| Specialized sub-page (adds toggle/switch to base) | Extended reusable header |
| Overview/detail page (`[id]/page.tsx`) | Inline composition or extracted feature component |
| List page | Inline composition |
| Auth page | No header (`Panel` wrapper) |
| Inquiry step | No header in `page.tsx` (handled by feature component) |

## Existing Reusable Headers

### FSP Sub-Page Header

**`FspFinancingCaseOverviewSubPageHeader`** — `@/layouts/fsp/FspFinancingCaseOverviewSubPageHeader`

The standard header for all FSP sub-pages under a financing case overview. Client component.

```tsx
type Props = {
  title: string;
  financingCaseId: string;
  header: PropertyManagerSubPageHeaderType;
  actionComponent?: ReactElement;
};
```

- Back button navigates to the financing case overview, product-aware via `useProduct()` (resolves to hoaAccount or hoaLoan route)
- Subtitle: `{propertyManagement} | {homeOwnersAssociation}` from the `header` prop
- Optional `actionComponent` renders inside `PageHeaderActions`

Usage in a sub-page:

```tsx
<FspFinancingCaseOverviewSubPageHeader
  title={t("formTitle")}
  financingCaseId={financingCaseId}
  header={response.header}
/>
```

### Extended Sub-Page Header (FSP)

When a specific sub-page needs an extra action in its header, wrap the base `FspFinancingCaseOverviewSubPageHeader` and pass an `actionComponent` (e.g. a Switch toggle) into `PageHeaderActions`. This is the **extension pattern** — specialized behavior layered on top of the base header without duplicating its navigation/subtitle logic.

### PM Sub-Page Header

**`PropertyManagementCaseDetailsPageSubHeader`** — `@/features/propertyManagement/components/PropertyManagementCaseDetailsPageSubHeader`

The PM (Property Manager) equivalent of `FspFinancingCaseOverviewSubPageHeader`. Same structure, but uses PM-specific routes for back navigation.

### Extended Sub-Page Header (PM)

The PM equivalent: wrap `PropertyManagementCaseDetailsPageSubHeader` and pass an `actionComponent`, same extension pattern as the FSP variant.

## The `header` Prop

Sub-page headers receive a `header` object from the backend API response. This is typed as `PropertyManagerSubPageHeaderType`:

```tsx
{
  propertyManagement: string;
  homeOwnersAssociation: string | null;
}
```

The backend includes this in most detail/sub-page API responses. Pass it through from the page's data fetch.

## Where to Store New Reusable Headers

**Cross-feature headers** (used by sub-pages across multiple features for the same portal role):
→ `src/layouts/{portal}/` — e.g., `src/layouts/fsp/FspFinancingCaseOverviewSubPageHeader.tsx`

**Feature-specific headers** (used only by sub-pages within a single feature, or a portal-role variant):
→ `src/features/{featureName}/components/` — e.g., `src/features/propertyManagement/components/PropertyManagementCaseDetailsPageSubHeader.tsx`

## Creating a New Reusable Sub-Page Header

When building sub-pages under a new overview page that will have multiple sub-pages:

1. Check if an existing reusable header already covers the parent (e.g., `FspFinancingCaseOverviewSubPageHeader` covers all FSP financing case sub-pages)
2. If not, create one following this pattern:

```tsx
"use client";

import { routes } from "@/routes";
import { Headline } from "@finstreet/ui/components/base/Headline";
import { Typography } from "@finstreet/ui/components/base/Typography";
import {
  PageHeader,
  PageHeaderBackButton,
  PageHeaderTitle,
} from "@finstreet/ui/components/pageLayout/PageHeader";
import { VStack } from "@styled-system/jsx";
import { useExtracted } from "next-intl";
import { ReactElement } from "react";

type Props = {
  title: string;
  parentId: string;
  subtitle: string;
  actionComponent?: ReactElement;
};

export const {Feature}SubPageHeader = ({
  title,
  parentId,
  subtitle,
  actionComponent,
}: Props) => {
  const t = useExtracted();

  return (
    <PageHeader>
      <PageHeaderBackButton href={routes.{portal}.{feature}.overview(parentId)}>
        {t("back")}
      </PageHeaderBackButton>
      <PageHeaderTitle>
        <VStack gap={1} alignItems="flex-start">
          <Headline as="h1">{title}</Headline>
          <Typography fontSize="md">{subtitle}</Typography>
        </VStack>
      </PageHeaderTitle>
      {actionComponent}
    </PageHeader>
  );
};
```

3. Place it in `src/layouts/{portal}/` if it will be used across features, or `src/features/{feature}/components/` if feature-specific
4. To extend it (e.g., adding a toggle), wrap it and pass the extra UI via `actionComponent`
