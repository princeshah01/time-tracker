---
name: backend-route-patterns
description: "Create or refactor backend Express route modules in this Turborepo using the established apps/server patterns: module folder structure, route registration, zod validation, controllers, services, repositories, Drizzle queries, AppError/sendSuccess utilities, requireAuth, requirePermission, requireRouteUser, and permission key wiring. Use when adding an API feature, backend route, repository, service, controller, validation schema, permission-protected endpoint, or server-side module under apps/server."
---

# Backend Route Patterns

## Core Workflow

1. Inspect the closest existing module before coding, especially `invites`, `roles`, `profile`, and `permissions`.
2. Create backend features under `apps/server/src/modules/<module-name>/`.
3. Use this module shape unless the feature is read-only or has no database access:

```text
<module-name>/
+-- <module-name>.routes.ts
+-- <module-name>.controllers.ts
+-- <module-name>.service.ts
+-- <module-name>.repository.ts
+-- <module-name>.validation.ts
+-- <module-name>.types.ts
```

4. Register the router in `apps/server/src/app/routes.ts` with `appRouter.use("/resource", resourceRouter)`.
5. Keep HTTP concerns in routes/controllers, business rules in services, and Drizzle access in repositories.
6. Use `@/` imports for cross-module/shared imports and relative imports inside the same module.

## Route Rules

- Import `Router` from `express`.
- Import `requireAuth`, `requirePermission`, and `validate` from `@/shared/middlewares`.
- Put `requireAuth` at router level when every endpoint needs a session: `router.use(requireAuth)`.
- Put `requirePermission(permissionKeys.someKey)` on the route or router section that needs authorization. Add missing keys to `apps/server/src/shared/constants/role-permission.ts` and seed permissions when required.
- Put `validate(schema)` immediately before the controller handler.
- Keep route files thin; do not query the database or build response bodies in routes.

## Controller Rules

- Use class-based controllers and export a singleton: `export const projectsController = new ProjectsController();`.
- Type handlers as `async method(req: Request, res: Response)`.
- Read validated data with `ValidatedRequest<typeof schema>`.
- Read authenticated users with `requireRouteUser(req)` after `requireAuth`.
- Return responses with `sendSuccess({ res, data, message, status })`; use `status: 201` for creates.
- Throw `AppError` for expected failures instead of sending ad hoc error JSON.

## Service And Repository Rules

- Services validate domain invariants, normalize input, coordinate repositories, call infrastructure, and throw `AppError`.
- Repositories contain Drizzle queries only. Return records or `null`; leave business decisions to services.
- Instantiate dependencies with constructor defaults to keep tests and future overrides possible:

```ts
export class ProjectsService {
  constructor(private readonly projectsRepository = new ProjectsRepository()) {}
}

export const projectsService = new ProjectsService();
```

- Use `returning()` after inserts/updates that need the changed row.
- Set `updatedAt: new Date()` explicitly for updates when the table pattern requires it.

## Validation Rules

- Use `zod` schemas shaped like `{ body, query, params }` because `validate()` parses those three request sections.
- Use `.strict()` for request bodies.
- Use `z.coerce.number().int().positive()` for numeric params/query values coming from Express.
- Export inferred schema types when useful, but controllers usually import the schema value and cast `ValidatedRequest<typeof schema>`.

## Database And Permissions

- Add new Drizzle tables in `apps/server/src/db/schema/auth.schema.ts` unless the project has been split into another schema file.
- Export schema through `apps/server/src/db/schema/index.ts` if adding a new schema file.
- Generate migrations with `pnpm --filter server db:generate` after schema changes.
- Add permission keys to `permissionKeys` using the existing `resource:action` style, then update `apps/server/src/db/seeds/role-permissions.ts` if the permission must be seeded.

## Reference

Read `references/module-route-guide.md` when creating a new module, adding multiple endpoints, changing permissions, touching Drizzle schema, or needing code skeletons.

## Verification

- Run `pnpm --filter server check-types` after backend TypeScript edits.
- Run `pnpm --filter server lint` when changing several files or shared behavior.
- Run `pnpm --filter server db:generate` only when Drizzle schema changed, then inspect the generated migration.
