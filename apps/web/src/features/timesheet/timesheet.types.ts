export type TimesheetUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type TimesheetListItem = {
  id: number;
  projectId: number;
  timesheetName: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
    isActive: boolean;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  userCount: number;
  users: TimesheetUser[];
};

export type ListTimesheetsResponse = {
  items: TimesheetListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CreateTimesheetInput = {
  projectId: number;
  timesheetName: string;
  startDate: string;
  endDate: string;
  userIds: string[];
};

export type UpdateTimesheetInput = Partial<CreateTimesheetInput>;

export type TimesheetTaskSuggestion = {
  id: number;
  projectId: number;
  title: string;
  status: "todo" | "inprogress" | "completed";
};

export type TimesheetSheetRow = {
  rowKey: string;
  date: string;
  user: TimesheetUser;
  entryId: number | null;
  task: TimesheetTaskSuggestion | null;
  minutesSpent: number;
  hours: number;
  minutes: number;
  updatedAt: string | null;
};

export type ListTimesheetSheetsResponse = {
  items: TimesheetSheetRow[];
  users: TimesheetUser[];
  canManageAllUsers: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type UpsertTimesheetSheetInput = {
  entryDate: string;
  userId?: string;
  taskId?: number | null;
  taskTitle?: string;
  hours: number;
  minutes: number;
};
