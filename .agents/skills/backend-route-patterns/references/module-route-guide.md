# Module Route Guide

Use this reference when implementing an `apps/server` module from a feature prompt.

## Existing Patterns To Inspect

- `apps/server/src/modules/invites`: full route/controller/service/repository/validation/types pattern, invite token flow, protected create route, public token routes.
- `apps/server/src/modules/roles`: authenticated CRUD, pagination validation, permission listing, Drizzle joins and counts.
- `apps/server/src/modules/profile`: authenticated `me` flow, `requireRouteUser(req)`, upload middleware, Better Auth calls.
- `apps/server/src/modules/permissions`: authorization service and repository used by `requirePermission`.

## File Responsibilities

`<module>.routes.ts`

- Define the Express router.
- Compose middleware in this order: `requireAuth`, `requirePermission(...)`, upload middleware if needed, `validate(schema)`, controller handler.
- Export `<module>Router`.

`<module>.controllers.ts`

- Translate HTTP request data into service input.
- Cast `req` to `ValidatedRequest<typeof schema>` after validation.
- Use `requireRouteUser(req)` for the session user.
- Respond through `sendSuccess`.

`<module>.service.ts`

- Normalize input, enforce business rules, compose repositories/infrastructure, and throw `AppError`.
- Return response-ready data shapes, not Express responses.

`<module>.repository.ts`

- Import `db` from `@/db` and schema tables from `@/db/schema`.
- Keep Drizzle query details here.
- Return `record ?? null` for single-row reads.

`<module>.validation.ts`

- Export zod schemas named after route actions: `createProjectSchema`, `projectIdParamSchema`, `listProjectsSchema`.
- Shape every schema around `body`, `query`, and/or `params`.

`<module>.types.ts`

- Keep service input/output types here when they are shared between service/controller or would clutter the service.

## Route Skeleton

```ts
import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { projectsController } from "./projects.controllers";
import {
  createProjectSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from "./projects.validation";

const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get(
  "/",
  requirePermission(permissionKeys.projectViewAll),
  validate(listProjectsSchema),
  projectsController.list
);

projectsRouter.get(
  "/:projectId",
  requirePermission(permissionKeys.projectViewAll),
  validate(projectIdParamSchema),
  projectsController.view
);

projectsRouter.post(
  "/",
  requirePermission(permissionKeys.projectCreate),
  validate(createProjectSchema),
  projectsController.create
);

projectsRouter.patch(
  "/:projectId",
  requirePermission(permissionKeys.projectManageAll),
  validate(updateProjectSchema),
  projectsController.update
);

export { projectsRouter };
```

Register it:

```ts
import { projectsRouter } from "@/modules/projects/projects.routes";

appRouter.use("/projects", projectsRouter);
```

## Controller Skeleton

```ts
import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { projectsService } from "./projects.service";
import type {
  createProjectSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from "./projects.validation";

export class ProjectsController {
  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listProjectsSchema>)
      .validated;
    const result = await projectsService.listProjects(query);

    return sendSuccess({
      res,
      data: result,
      message: "Projects fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof projectIdParamSchema>)
      .validated;
    const project = await projectsService.viewProject(params.projectId);

    return sendSuccess({
      res,
      data: project,
      message: "Project fetched successfully",
    });
  }

  async create(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const { body } = (req as ValidatedRequest<typeof createProjectSchema>)
      .validated;
    const project = await projectsService.createProject({
      ...body,
      createdBy: user.id,
    });

    return sendSuccess({
      res,
      data: project,
      message: "Project created successfully",
      status: 201,
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateProjectSchema>
    ).validated;
    const project = await projectsService.updateProject(params.projectId, body);

    return sendSuccess({
      res,
      data: project,
      message: "Project updated successfully",
    });
  }
}

export const projectsController = new ProjectsController();
```

## Validation Skeleton

```ts
import { z } from "zod";

const projectNameSchema = z
  .string()
  .trim()
  .min(2, "Project name must be at least 2 characters")
  .max(100, "Project name must be at most 100 characters");

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
  }),
  params: z.object({}),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const createProjectSchema = z.object({
  body: z
    .object({
      name: projectNameSchema,
      description: z.string().trim().max(255).optional(),
    })
    .strict(),
  params: z.object({}),
  query: z.object({}),
});

export const updateProjectSchema = z.object({
  body: z
    .object({
      name: projectNameSchema.optional(),
      description: z.string().trim().max(255).nullable().optional(),
    })
    .refine(
      (value) => value.name !== undefined || value.description !== undefined,
      { message: "At least one field must be provided to update project" }
    ),
  params: z.object({
    projectId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
```

## Service Skeleton

```ts
import { AppError } from "@/shared/utils";
import { ProjectsRepository } from "./projects.repository";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export class ProjectsService {
  constructor(private readonly projectsRepository = new ProjectsRepository()) {}

  async listProjects(input: { page: number; limit: number; q?: string }) {
    const result = await this.projectsRepository.listProjectsPaginated(input);

    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async viewProject(projectId: number) {
    const project = await this.projectsRepository.findProjectById(projectId);

    if (!project) {
      throw new AppError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    return project;
  }

  async createProject(input: {
    name: string;
    description?: string;
    createdBy: string;
  }) {
    const name = normalizeName(input.name);
    const existingProject = await this.projectsRepository.findProjectByName(name);

    if (existingProject) {
      throw new AppError({
        message: "Project name already exists",
        code: "CONFLICT",
      });
    }

    const project = await this.projectsRepository.createProject({
      name,
      description: input.description?.trim() || null,
      createdBy: input.createdBy,
    });

    if (!project) {
      throw new AppError({
        message: "Failed to create project",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return project;
  }
}

export const projectsService = new ProjectsService();
```

## Repository Skeleton

```ts
import { asc, count, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { projects } from "@/db/schema";

export class ProjectsRepository {
  async findProjectById(projectId: number) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    return project ?? null;
  }

  async findProjectByName(name: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.name, name));

    return project ?? null;
  }

  async listProjectsPaginated(input: {
    page: number;
    limit: number;
    q?: string;
  }) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const q = (input.q ?? "").trim();
    const whereClause = q
      ? or(
          ilike(projects.name, `%${q}%`),
          ilike(projects.description, `%${q}%`),
          sql`${projects.id}::text ILIKE ${`%${q}%`}`
        )
      : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(whereClause)
        .orderBy(asc(projects.id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(projects).where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async createProject(input: {
    name: string;
    description?: string | null;
    createdBy: string;
  }) {
    const [project] = await db.insert(projects).values(input).returning();
    return project ?? null;
  }
}
```

## Permission Checklist

1. Choose existing keys from `permissionKeys` when they match the feature.
2. Add new keys in `apps/server/src/shared/constants/role-permission.ts` with `resource:action` names.
3. Add seed data in `apps/server/src/db/seeds/role-permissions.ts` when the database must know the permission.
4. Protect routes with `requirePermission(permissionKeys.<key>)`.
5. For ownership rules like own/team/all, enforce detailed scoping in the service or repository, not only with a broad route permission.

## Final Checks

- Ensure imports use `@/` aliases for shared and cross-module imports.
- Ensure all controller methods used as handlers are class methods that do not depend on `this`.
- Ensure public routes intentionally omit `requireAuth`.
- Ensure every validated route has a schema containing the request sections it uses.
- Run `pnpm --filter server check-types`.
