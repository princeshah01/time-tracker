---
name: frontend-feature-patterns
description: Build or refactor frontend features in this monorepo using the established React feature-folder structure, workspace UI package, shared AppIcon/icon registry, color tokens, shared hooks/lib/toast utilities, and zod + react-hook-form forms. Use when creating pages, routes, feature modules, UI components, forms, or route-config entries in apps/web.
---

# Frontend Feature Patterns

## Core Rules

- Use `@workspace/ui` components and utilities before creating local UI primitives.
- Import shared UI components from direct package paths, for example `@workspace/ui/components/button`, `@workspace/ui/components/form`, `@workspace/ui/components/input`, and `@workspace/ui/lib/utils`.
- Use workspace color tokens in Tailwind classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `text-card-foreground`, `bg-primary`, `text-primary-foreground`, `bg-accent`, `text-accent-foreground`, `text-destructive`, and related semantic tokens.
- Avoid hard-coded color palettes such as `text-slate-*`, `bg-blue-*`, or hex colors unless integrating a brand asset that cannot use tokens.
- Use shared hooks, toast, and lib helpers from the existing shared packages before adding feature-local replacements.

## Icons

- Use `AppIcon` from `@/shared/components/app-icon` for frontend feature icons, route icons, buttons, empty states, and status UI.
- Do not import lucide icons directly in feature UI when `AppIcon` can render them.
- When an icon name is needed but absent, add it to `apps/web/src/shared/constants/icon-registry.tsx` using the existing lazy import style.
- Keep route and config icon values as string names that match `ICON_REGISTRY`.
- If adding route/sidebar icons, confirm the string icon name exists in `ICON_REGISTRY`; add it if missing.

Example:

```tsx
import { AppIcon } from "@/shared/components/app-icon";

<AppIcon name="Plus" className="size-4" aria-hidden="true" />
```

Registry addition:

```tsx
Plus: lazy(() =>
  import("lucide-react").then((m) => ({ default: m.Plus }))
),
```

## Forms

- Use `zod` schemas for all non-trivial forms.
- Use `useForm` with `zodResolver(schema)`.
- Define `defaultValues` explicitly.
- Use the shared form components from `@workspace/ui/components/form`: `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`, and `FormDescription` when needed.
- Use workspace inputs/selects/checkboxes/textareas from `@workspace/ui/components/*`.
- Keep submit handlers typed from the schema with `z.infer<typeof schema>`.

Pattern:

```tsx
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
  },
});
```

Field pattern:

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder="Project name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Feature Folders

Create each feature under `apps/web/src/features/<feature-name>/` with this shape:

```text
<feature-name>/
+-- _components/
|   +-- index.ts
+-- pages/
|   +-- <feature-page>.tsx
|   +-- index.ts
+-- service/
|   +-- index.ts
+-- index.ts
```

- Put page-level route components in `pages/`.
- Export page components as default exports from their page files so route setup can lazy load them.
- Export named feature internals from `_components/index.ts`, `service/index.ts`, and feature `index.ts`.
- Break large pages into small focused components under `_components/` when the page mixes layout, forms, tables, filters, dialogs, or stateful sections.
- Keep API/service calls and request helpers in `service/`; do not bury network logic inside page JSX.

Page export pattern:

```tsx
function ProjectsPage() {
  return <div className="space-y-4">...</div>;
}

export default ProjectsPage;
```

Feature index pattern:

```ts
export { default as ProjectsPage } from "./pages/projects-page";
export * from "./_components";
export * from "./service";
```

## Routing

- Add lazy-loadable pages from `pages/index.ts` or the feature `index.ts` into `apps/web/src/app/routes/route-config.tsx`.
- Prefer `React.lazy` plus the existing loader/suspense pattern when wiring new feature pages.
- Keep route icons as registry-backed strings, not component imports.
- Export newly added route config through the existing route-config flow; do not create a parallel route system.

Lazy page pattern:

```tsx
const ProjectsPage = lazy(() => import("@/features/projects/pages/projects-page"));
```

Route config pattern:

```tsx
{
  path: "/projects",
  label: "Projects",
  icon: "FolderKanban",
  element: <ProjectsPage />,
  showInSidebar: true,
}
```

## Implementation Checklist

1. Inspect nearby feature folders and shared exports before coding.
2. Build UI with `@workspace/ui` components, semantic color tokens, and `cn`.
3. Use `AppIcon`; update `icon-registry.tsx` for missing icons.
4. For forms, create a zod schema, typed `useForm`, `zodResolver`, explicit defaults, and shared `FormField` markup.
5. Split complex UI into `_components`; keep service logic in `service`.
6. Ensure page files default export route components and route config imports are lazy-load friendly.
7. Run the repo's formatter, typecheck, or targeted tests when available.
