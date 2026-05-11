# Repository Agent Instructions

These instructions apply to the whole repository. Follow them on every prompt in this repo unless the user explicitly gives a conflicting instruction.

## Default Behavior

- Use the checked-in skills automatically when the task matches them. The user should not need to mention a skill by name.
- Read the relevant `SKILL.md` before making changes in an area covered by a skill.
- Prefer the existing architecture, naming, imports, UI primitives, validation style, and permission patterns over introducing new conventions.
- Inspect nearby files before coding. Match the closest established implementation first.
- Keep edits scoped to the request. Do not refactor unrelated code or revert user changes.
- Use `pnpm` for package scripts. This repo uses Turborepo and pnpm workspaces.

## Repo Shape

- Root workspace: Turborepo monorepo.
- Frontend app: `apps/web`
- Backend app: `apps/server`
- Shared packages: `packages/*`
- Local agent skills: `.agents/skills/*`
- Formatting/linting: Biome.
- TypeScript is used throughout.

## Skills To Use Automatically

- Frontend feature or route work in `apps/web`: use `.agents/skills/frontend-feature-patterns/SKILL.md`.
- Timesheet, dashboard, settings, approval, table, filter, shell, sidebar, or operational UI JSX: use `.agents/skills/timesheet-jsx-design-patterns/SKILL.md` in addition to the frontend feature skill.
- Backend Express modules, routes, controllers, services, repositories, validation, permissions, or Drizzle access in `apps/server`: use `.agents/skills/backend-route-patterns/SKILL.md`.
- Better Auth setup, auth server/client changes, sessions, providers, or auth configuration: use the Better Auth skills under `.agents/skills/*auth*`.
- Email/password, password reset, verification, or credential security work: use `.agents/skills/email-and-password-best-practices/SKILL.md`.
- MFA, TOTP, OTP, backup codes, or trusted-device work: use `.agents/skills/two-factor-authentication-best-practices/SKILL.md`.

## Frontend Architecture

- Use feature folders under `apps/web/src/features/<feature-name>/`.
- Put route/page components in `pages/` and default export route pages.
- Put feature components in `_components/`.
- Put API and request helpers in `service/`; do not bury network calls in page JSX.
- Wire routes through `apps/web/src/app/routes/route-config.tsx`.
- Use shared components and utilities from `@workspace/ui` before creating local primitives.
- Use `AppIcon` from `@/shared/components/app-icon` and registry-backed icon names from `apps/web/src/shared/constants/icon-registry.tsx`.
- Use semantic Tailwind tokens such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-primary`, and `text-primary-foreground`.
- Avoid hard-coded color palettes and one-off UI systems unless the task specifically requires them.
- Use `zod`, `react-hook-form`, and shared form components for non-trivial forms.

## Frontend Design Pattern

- This app should feel like a compact operational SaaS/timesheet interface, not a marketing site.
- Prefer dense, scannable layouts with restrained surfaces, small type, clear dividers, tables, tabs, filters, and predictable actions.
- Use full-width operational sections instead of decorative nested cards.
- Keep controls compact, usually `h-7` or `h-8` inside app screens.
- Use page headers around `h-11` with border separation.
- Avoid oversized headings, gradients, heavy shadows, large rounded panels, and decorative hero sections inside the app.
- Check mobile behavior, text truncation, overflow, and table scrolling before finishing UI work.

## Backend Architecture

- Create backend features under `apps/server/src/modules/<module-name>/`.
- Follow the established module split:
  - `<module>.routes.ts`
  - `<module>.controllers.ts`
  - `<module>.service.ts`
  - `<module>.repository.ts`
  - `<module>.validation.ts`
  - `<module>.types.ts` when needed
- Register routers in `apps/server/src/app/routes.ts`.
- Keep HTTP concerns in routes/controllers, business rules in services, and Drizzle queries in repositories.
- Use `zod` schemas shaped as `{ body, query, params }` with `.strict()` request bodies.
- Use `requireAuth`, `requirePermission`, `validate`, and `requireRouteUser` according to existing patterns.
- Return successful responses with `sendSuccess`.
- Throw `AppError` for expected failures.
- Add permission keys in the existing `resource:action` style and update seeds when required.

## Verification

- Frontend TypeScript changes: run `pnpm --filter web check-types`.
- Backend TypeScript changes: run `pnpm --filter server check-types`.
- Broader or shared changes: run `pnpm check-types` and the relevant lint command when practical.
- Drizzle schema changes: run `pnpm --filter server db:generate` and inspect the generated migration.
- If a verification command cannot be run, say so in the final response.

