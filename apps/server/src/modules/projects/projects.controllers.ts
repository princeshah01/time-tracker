import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { projectsService } from "./projects.service";
import type {
  createProjectSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectBillingSchema,
  updateProjectSchema,
} from "./projects.validation";

export class ProjectsController {
  async create(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof createProjectSchema>)
      .validated;
    const user = requireRouteUser(req);
    const project = await projectsService.createProject(body, user.id);

    return sendSuccess({
      res,
      data: project,
      message: "Project created successfully",
      status: 201,
    });
  }

  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listProjectsSchema>)
      .validated;
    const user = requireRouteUser(req);
    const projects = await projectsService.listProjects(query, user.id);

    return sendSuccess({
      res,
      data: projects,
      message: "Projects fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof projectIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const project = await projectsService.getProject(params.projectId, user.id);

    return sendSuccess({
      res,
      data: project,
      message: "Project fetched successfully",
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateProjectSchema>
    ).validated;
    const user = requireRouteUser(req);
    const project = await projectsService.updateProject(
      params.projectId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: project,
      message: "Project updated successfully",
    });
  }

  async toggleStatus(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof projectIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const project = await projectsService.toggleProjectStatus(
      params.projectId,
      user.id
    );

    return sendSuccess({
      res,
      data: project,
      message: "Project status updated successfully",
    });
  }

  async updateBilling(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateProjectBillingSchema>
    ).validated;
    const user = requireRouteUser(req);
    const project = await projectsService.updateProjectBilling(
      params.projectId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: project,
      message: "Project billing updated successfully",
    });
  }
}

export const projectsController = new ProjectsController();
