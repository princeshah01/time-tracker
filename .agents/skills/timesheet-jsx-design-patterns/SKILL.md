---
name: timesheet-jsx-design-patterns
description: Write React JSX/TSX for a timesheet app that matches the Triage reference UI. Use when building or refactoring time tracking, timesheet list, entry form, approvals, reports, analytics, settings, shell, sidebar, tabs, tables, filters, badges, or dashboard screens with Tailwind and the shared @workspace/ui component package.
---

# Timesheet JSX Design Patterns

## Purpose

Use this skill to write application JSX that matches the `refrence` Triage UI: compact operational screens, border-divided sections, small type, quiet neutral surfaces, lucide icons, and shadcn primitives from `packages/ui`.

This skill is for JSX/TSX page and component structure. Do not recreate Tailwind tokens or shadcn components unless they are missing from the target app.

## Workflow

1. Inspect the target app for existing imports, route conventions, layout components, and whether `@workspace/ui/globals.css` is already imported.
2. Import primitives from `@workspace/ui/components/*`, `cn` from `@workspace/ui/lib/utils`, and icons from `lucide-react`.
3. Build pages using an app shell, `h-11` page headers, `h-10` filter bars, border-divided content rows, compact inputs, and table-first data views.
4. Prefer full-width operational sections over decorative cards. Use cards only for repeated bounded items such as kanban/weekly day entries.
5. Model timesheet concepts with Triage-like patterns: metric grids, searchable tables, status dots, approval badges, weekly entry rows, side tabs, and compact chart panels.
6. Before finishing, check mobile width behavior, table overflow, text truncation, and button/input heights.

## Read When Needed

Read `references/jsx-patterns.md` when writing actual JSX. It contains reusable snippets for:

- App shell and sidebar navigation.
- Page headers, filters, metrics, and dense table layouts.
- Timesheet status badges and billable markers.
- Weekly timesheet entry forms.
- Approval/settings tabs and analytics panels.

## Core Rules

- Use `text-[13px]` for primary app text, `text-[12px]` for labels and supporting text, and `text-[11px]` for counts/timestamps.
- Use `h-7` or `h-8` controls inside the app shell. Keep icon buttons at `h-7 w-7` or `h-8 w-8 p-0`.
- Use `px-4 md:px-6 h-11 border-b border-border` for page headers.
- Use `gap-px bg-border rounded-md overflow-hidden` for metric and chart grids.
- Use `divide-y divide-border` or explicit `border-b border-border` for form sections.
- Use semantic classes from the shared tokens: `bg-background`, `bg-muted/30`, `text-muted-foreground`, `border-border`, `bg-success`, `bg-warning`, `bg-info`, `text-destructive`.
- Use lucide icons at `h-3.5 w-3.5` or `h-4 w-4`.
- Avoid hero sections, marketing cards, gradients, heavy shadows, large rounded panels, and oversized headings inside the app.

## Timesheet Semantics

- Treat `draft`, `submitted`, `approved`, `rejected`, and `locked` like workflow statuses.
- Represent status with muted text plus a small colored dot.
- Represent billable/non-billable as compact outline/secondary badges, not large colored pills.
- Table columns should favor scan order: date/week, person, project/client, task, hours, status, submitted/updated time, actions.
- Entry forms should favor row sections and weekly grids over a large centered card.
