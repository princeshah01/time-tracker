import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import debounce from "lodash.debounce";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib/permissions";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import {
  ProjectContextMenu,
  ProjectFilters,
  ProjectStatusDialog,
  ProjectTable,
} from "../_components";
import type {
  ProjectBillingType,
  ProjectListItem,
  ProjectMenuState,
  ProjectPriority,
  ProjectStatusFilter,
} from "../project.types";
import { projectService } from "../service";

function ProjectMainPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canManageProjects = hasPermission(userPermissions, [
    permissions.projectManageAll,
    permissions.projectManageOwn,
  ]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("all");
  const [priority, setPriority] = useState<ProjectPriority | "all">("all");
  const [billingType, setBillingType] = useState<ProjectBillingType | "all">(
    "all"
  );
  const [rowLimit, setRowLimit] = useState(0);
  const [menuState, setMenuState] = useState<ProjectMenuState>(null);
  const [statusProject, setStatusProject] = useState<ProjectListItem | null>(
    null
  );

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const projectsQuery = useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.PROJECTS,
      debouncedSearch,
      status,
      priority,
      billingType,
      rowLimit,
    ],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await projectService.listProjects({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        status,
        priority,
        billingType,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch projects");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (project: ProjectListItem) => {
      const response = await projectService.toggleProjectStatus(project.id);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update project");
      }

      return response.data;
    },
    onSuccess: (project) => {
      toast.success("Project status updated successfully");
      setStatusProject(null);
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_DETAIL, project.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function viewProject(project: ProjectListItem) {
    navigate(`/project/${project.id}`);
  }

  function editProject(project: ProjectListItem) {
    navigate(`/project/${project.id}`, { state: { mode: "edit" } });
  }

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Projects" className="sticky top-0 z-10" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="space-y-4 p-4 bg-background">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <ProjectFilters
              search={search}
              status={status}
              priority={priority}
              billingType={billingType}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
              onBillingTypeChange={setBillingType}
            />
            <PermissionsWrapper
              requiredPermissions={[permissions.projectCreate]}
            >
              <Button
                size="sm"
                className="h-8 gap-1.5 text-[12px]"
                onClick={() => navigate("/project/new")}
              >
                <AppIcon name="Plus" className="size-3.5" />
                Add Project
              </Button>
            </PermissionsWrapper>
          </div>
          <ProjectTable
            data={projectsQuery.data}
            isLoading={projectsQuery.isLoading}
            hasNextPage={projectsQuery.hasNextPage}
            isFetchingNextPage={projectsQuery.isFetchingNextPage}
            fetchNextPage={() => void projectsQuery.fetchNextPage()}
            setRowLimit={setRowLimit}
            canManage={canManageProjects}
            onView={viewProject}
            onEdit={editProject}
            onToggleStatus={setStatusProject}
            setMenuState={setMenuState}
          />
        </div>

        <ProjectContextMenu
          menuState={menuState}
          canManage={canManageProjects}
          setMenuState={setMenuState}
          onView={viewProject}
          onEdit={editProject}
          onToggleStatus={setStatusProject}
        />

        <ProjectStatusDialog
          project={statusProject}
          open={Boolean(statusProject)}
          isPending={updateStatusMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setStatusProject(null);
          }}
          onConfirm={() => {
            if (statusProject) updateStatusMutation.mutate(statusProject);
          }}
        />
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default ProjectMainPage;
