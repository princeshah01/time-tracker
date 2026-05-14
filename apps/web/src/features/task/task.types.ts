export type TaskStatus = "todo" | "inprogress" | "completed";

export type TaskStatusFilter = "all" | TaskStatus;

export type TaskListItem = {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
    createdBy: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export type TaskDetail = TaskListItem;

export type ListTasksResponse = {
  items: TaskListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CreateTaskInput = {
  projectId: number;
  title: string;
  description?: string | null;
  status?: TaskStatus;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "projectId">>;
