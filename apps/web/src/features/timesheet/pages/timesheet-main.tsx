import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { projectService } from "@/features/project";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { RequirePermissions } from "@/shared/components/permission-wrapper";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { TimesheetCardGrid, TimesheetFilters } from "../_components";
import { timesheetService } from "../service";

function TimesheetMainPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageLimit, setPageLimit] = useState(0);

  const debouncedFn = useMemo(
    () =>
      debounce((nextSearch: string) => {
        setDebouncedSearch(nextSearch.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const projectsQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, "timesheet-filter-projects"],
    queryFn: async () => {
      const projects = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await projectService.listProjects({
          page,
          limit: 100,
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to fetch projects");
        }

        projects.push(...response.data.items);
        hasNextPage = response.data.hasNextPage;
        page += 1;
      }

      return projects;
    },
  });

  const timesheetsQuery = useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.TIMESHEETS,
      debouncedSearch,
      selectedProjectId,
      pageLimit,
    ],
    enabled: Boolean(pageLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await timesheetService.listTimesheets({
        page: pageParam,
        limit: pageLimit,
        q: debouncedSearch,
        projectId: selectedProjectId ?? undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch timesheets");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Timesheets" className="sticky top-0 z-10" />
      <PageContent.Body className="min-h-0 overflow-hidden">
        <div className="space-y-3 p-4">
          <TimesheetFilters
            search={search}
            selectedProjectId={selectedProjectId}
            projects={projectsQuery.data ?? []}
            isLoadingProjects={projectsQuery.isLoading}
            actions={
              <RequirePermissions
                requiredPermissions={[permissions.timesheetCreate]}
              >
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-[12px]"
                  onClick={() => navigate("/timesheet/new")}
                >
                  <AppIcon name="Plus" className="size-3.5" />
                  Add Timesheet
                </Button>
              </RequirePermissions>
            }
            onSearchChange={setSearch}
            onProjectChange={setSelectedProjectId}
          />

          <TimesheetCardGrid
            data={timesheetsQuery.data}
            isLoading={timesheetsQuery.isLoading}
            hasNextPage={timesheetsQuery.hasNextPage}
            isFetchingNextPage={timesheetsQuery.isFetchingNextPage}
            fetchNextPage={() => void timesheetsQuery.fetchNextPage()}
            setPageLimit={setPageLimit}
            onOpenSheets={(timesheet) =>
              navigate(`/timesheet/${timesheet.id}/sheets`)
            }
            onView={(timesheet) => navigate(`/timesheet/${timesheet.id}`)}
            onEdit={(timesheet) =>
              navigate(`/timesheet/${timesheet.id}?mode=edit`)
            }
          />
        </div>
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default TimesheetMainPage;
