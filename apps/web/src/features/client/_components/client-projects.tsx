import { useNavigate } from "react-router-dom";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { AppIcon } from "@/shared/components/app-icon";
import { formatDate } from "@/shared/lib";
import type { ClientProject } from "../client.types";

type ClientProjectsProps = {
  projects: ClientProject[];
};

function ClientProjects({ projects }: ClientProjectsProps) {
  const navigate = useNavigate();

  return (
    <section className="border-t">
      <div className="flex h-11 items-center justify-between border-b px-4">
        <div>
          <h2 className="text-[13px] font-medium">Projects</h2>
          <p className="text-[12px] text-muted-foreground">
            Work linked with this client
          </p>
        </div>
        <Badge variant="outline" className="rounded-md text-[10px]">
          {projects.length}
        </Badge>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-px bg-border p-px md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="min-w-0 bg-background p-4 text-left hover:bg-muted/40"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className="truncate text-[13px] font-medium"
                    title={project.name}
                  >
                    {project.name}
                  </div>
                  <div className="mt-1 truncate text-[12px] text-muted-foreground">
                    {project.code ?? "No project code"}
                  </div>
                </div>
                <AppIcon
                  name="FolderKanban"
                  className="size-4 text-muted-foreground"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>{project.status ?? "No status"}</span>
                <span>{formatDate(project.updatedAt)}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
          <AppIcon
            name="Inbox"
            className="mb-2 size-9 text-muted-foreground"
          />
          <div className="text-[13px] font-medium">No projects found</div>
          <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">
            Projects connected to this client will appear here.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 text-[12px]"
            onClick={() => navigate("/projects/new")}
          >
            <AppIcon name="Plus" className="size-3.5" />
            New project
          </Button>
        </div>
      )}
    </section>
  );
}

export { ClientProjects };
