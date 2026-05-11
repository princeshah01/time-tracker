import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib/permissions";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { ProjectForm, ProjectSaveDialog } from "../_components";
import type { CreateProjectInput, UpdateProjectInput } from "../project.types";
import { projectService } from "../service";

function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canCreateProject = hasPermission(userPermissions, [
    permissions.projectCreate,
  ]);
  const canManageFinance = hasPermission(userPermissions, [
    permissions.projectFinanceManagement,
  ]);
  const [pendingInput, setPendingInput] = useState<CreateProjectInput | null>(
    null
  );

  const createProjectMutation = useMutation({
    mutationFn: async (input: CreateProjectInput | UpdateProjectInput) => {
      const response = await projectService.createProject(
        input as CreateProjectInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create project");
      }

      return response.data;
    },
    onSuccess: (project) => {
      toast.success("Project created successfully");
      setPendingInput(null);
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      navigate(`/project/${project.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Create Project" className="sticky top-0 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-[12px]"
          onClick={() => navigate("/project")}
        >
          <AppIcon name="X" className="size-3.5" />
          Cancel
        </Button>
      </PageContent.Header>

      <PageContent.Body className="min-h-0 overflow-y-auto">
        <section className="bg-background">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold">Project details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add project scope, billing setup, and team assignments.
            </p>
          </div>

          <ProjectForm
            mode="create"
            canSubmit={canCreateProject}
            canManageFinance={canManageFinance}
            isSubmitting={createProjectMutation.isPending}
            onCancel={() => navigate("/project")}
            onSubmit={(input) => setPendingInput(input as CreateProjectInput)}
          />
        </section>

        <ProjectSaveDialog
          open={Boolean(pendingInput)}
          isPending={createProjectMutation.isPending}
          mode="create"
          onOpenChange={(open) => {
            if (!open) setPendingInput(null);
          }}
          onConfirm={() => {
            if (pendingInput) createProjectMutation.mutate(pendingInput);
          }}
        />
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default CreateProjectPage;
