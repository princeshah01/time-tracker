import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { formatDate, hasPermission } from "@/shared/lib";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { ProjectForm, ProjectSaveDialog } from "../_components";
import type {
  CreateProjectInput,
  UpdateProjectBillingInput,
  UpdateProjectInput,
} from "../project.types";
import { projectService } from "../service";

type ProjectDetailsMode = "edit" | "view";
type ProjectDetailsLocationState = {
  mode?: ProjectDetailsMode;
} | null;

function ProjectDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = Number(params.projectId);
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canManageProject = hasPermission(userPermissions, [
    permissions.projectManageAll,
    permissions.projectManageOwn,
  ]);
  const canManageFinance = hasPermission(userPermissions, [
    permissions.projectFinanceManagement,
  ]);
  const locationState = location.state as ProjectDetailsLocationState;
  const [mode, setMode] = useState<ProjectDetailsMode>("view");
  const [pendingInput, setPendingInput] = useState<UpdateProjectInput | null>(
    null,
  );
  const [pendingBillingInput, setPendingBillingInput] =
    useState<UpdateProjectBillingInput | null>(null);

  const projectQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECT_DETAIL, projectId],
    enabled: Number.isFinite(projectId) && projectId > 0,
    queryFn: async () => {
      const response = await projectService.viewProject(projectId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch project");
      }

      return response.data;
    },
  });

  useEffect(() => {
    if (
      locationState?.mode === "edit" &&
      (canManageProject || canManageFinance)
    ) {
      setMode("edit");
      return;
    }

    setMode("view");
  }, [canManageFinance, canManageProject, locationState?.mode, projectId]);

  const updateProjectMutation = useMutation({
    mutationFn: async (input: CreateProjectInput | UpdateProjectInput) => {
      const response = await projectService.updateProject(
        projectId,
        input as UpdateProjectInput,
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update project");
      }

      return response.data;
    },
    onSuccess: (project) => {
      toast.success("Project updated successfully");
      setPendingInput(null);
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_DETAIL, project.id],
      });
      setMode("view");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateBillingMutation = useMutation({
    mutationFn: async (input: UpdateProjectBillingInput) => {
      const response = await projectService.updateProjectBilling(
        projectId,
        input,
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update billing");
      }

      return response.data;
    },
    onSuccess: (project) => {
      toast.success("Project billing updated successfully");
      setPendingBillingInput(null);
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_DETAIL, project.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const project = projectQuery.data;

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header
        title={project?.name ?? "Project Details"}
        className="sticky top-0 z-10"
      />
      <PageContent.Body className="min-h-0 overflow-y-auto border-border border-r max-w-4xl">
        {projectQuery.isLoading ? (
          <ProjectDetailsSkeleton />
        ) : projectQuery.isError ? (
          <ProjectDetailsError onRetry={() => void projectQuery.refetch()} />
        ) : project ? (
          <div className="bg-background">
            <section className="border-b">
              <>
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2
                        className="truncate text-base font-semibold"
                        title={project.name}
                      >
                        {project.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md text-[10px]",
                          project.isActive
                            ? "border-success bg-success/10 text-success"
                            : "border-muted bg-muted text-muted-foreground",
                        )}
                      >
                        {project.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {project.client.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border text-[12px] md:min-w-72">
                    <InfoTile
                      label="Billing"
                      value={
                        project.billingType === "fixed_bill"
                          ? "Fixed bill"
                          : "Hours worked"
                      }
                    />
                    <InfoTile label="Priority" value={project.priority} />
                    <InfoTile
                      label="Created"
                      value={formatDate(project.createdAt)}
                    />
                    <InfoTile
                      label="Updated"
                      value={formatDate(project.updatedAt)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 py-2 pr-4 border-t border-border">
                  {mode === "view" && (canManageProject || canManageFinance) ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-[12px]"
                      onClick={() => setMode("edit")}
                    >
                      <AppIcon name="Pencil" className="size-3.5" />
                      Edit
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[12px]"
                    onClick={() => navigate("/project")}
                  >
                    <AppIcon name="X" className="size-3.5" />
                    Close
                  </Button>
                </div>
              </>
            </section>
            <ProjectForm
              project={project}
              mode={mode}
              canSubmit={canManageProject}
              canManageFinance={canManageFinance}
              isSubmitting={updateProjectMutation.isPending}
              isBillingSubmitting={updateBillingMutation.isPending}
              onCancel={() => setMode("view")}
              onSubmit={(input) => setPendingInput(input as UpdateProjectInput)}
              onBillingSubmit={setPendingBillingInput}
            />
          </div>
        ) : null}

        <ProjectSaveDialog
          open={Boolean(pendingInput)}
          isPending={updateProjectMutation.isPending}
          mode="edit"
          onOpenChange={(open) => {
            if (!open) setPendingInput(null);
          }}
          onConfirm={() => {
            if (pendingInput) updateProjectMutation.mutate(pendingInput);
          }}
        />
        <ProjectSaveDialog
          open={Boolean(pendingBillingInput)}
          isPending={updateBillingMutation.isPending}
          mode="edit"
          onOpenChange={(open) => {
            if (!open) setPendingBillingInput(null);
          }}
          onConfirm={() => {
            if (pendingBillingInput) {
              updateBillingMutation.mutate(pendingBillingInput);
            }
          }}
        />
      </PageContent.Body>
    </PageContent.Root>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-[13px] font-medium" title={value}>
        {value}
      </div>
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-0">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <div className="font-medium text-[13px] text-destructive">
        Failed to load project
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        The selected project could not be fetched. Try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 text-[12px]"
        onClick={onRetry}
      >
        <AppIcon name="Loader" className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

export default ProjectDetailsPage;
