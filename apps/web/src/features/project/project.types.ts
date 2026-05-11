export type ProjectStatusFilter = "all" | "active" | "inactive";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type ProjectBillingType = "fixed_bill" | "hours_worked";
export type ProjectTeamRole = "manager" | "lead" | "member";

export type ProjectTeamMemberInput = {
  userId: string;
  role: ProjectTeamRole;
};

export type ProjectListItem = {
  id: number;
  name: string;
  clientId: number;
  clientName: string;
  clientCompany: string | null;
  priority: ProjectPriority;
  description: string | null;
  isActive: boolean;
  startDate: string;
  expectedEndDate: string | null;
  billingType: ProjectBillingType;
  totalProjectIncome: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskTotal?: number;
  teamMemberTotal?: number;
  manager?: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
};

export type ProjectTeamMember = {
  id: number;
  projectId: number;
  userId: string;
  role: ProjectTeamRole;
  hourlyRate: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export type ProjectDetail = {
  id: number;
  name: string;
  clientId: number;
  priority: ProjectPriority;
  description: string | null;
  isActive: boolean;
  startDate: string;
  expectedEndDate: string | null;
  billingType: ProjectBillingType;
  totalProjectIncome: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    name: string;
    company: string | null;
    email: string;
    isActive: boolean;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  teamMembers: ProjectTeamMember[];
};

export type ListProjectsResponse = {
  items: ProjectListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CreateProjectInput = {
  name: string;
  clientId: number;
  priority: ProjectPriority;
  description?: string | null;
  isActive?: boolean;
  startDate: string;
  expectedEndDate?: string | null;
  billingType: ProjectBillingType;
  teamMembers?: ProjectTeamMemberInput[];
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export type UpdateProjectBillingInput = {
  totalProjectIncome?: number | null;
  teamMembers?: {
    userId: string;
    hourlyRate?: number | null;
  }[];
};

export type ProjectMenuState = {
  x: number;
  y: number;
  row: ProjectListItem;
} | null;
