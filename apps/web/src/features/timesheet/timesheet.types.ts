export type TimesheetUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "manager" | "lead" | "member" | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verifier: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
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
    createdBy: string;
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
  isWeekend: boolean;
  isExplicitLeave: boolean;
  isLeave: boolean;
  leaveType: "weekly_off" | "leave" | null;
  verification: {
    isVerified: boolean;
    verifiedAt: string | null;
    verifiedBy: string | null;
    verifier: TimesheetUser["verifier"];
    canVerify: boolean;
  };
  entryId: number | null;
  task: TimesheetTaskSuggestion | null;
  entries: TimesheetSheetEntry[];
  minutesSpent: number;
  hours: number;
  minutes: number;
  updatedAt: string | null;
};

export type TimesheetSheetEntry = {
  entryId: number;
  task: TimesheetTaskSuggestion | null;
  minutesSpent: number;
  hours: number;
  minutes: number;
  updatedAt: string | null;
};

export type ListTimesheetSheetsResponse = {
  items: TimesheetSheetRow[];
  users: TimesheetUser[];
  selectedSheet: {
    user: TimesheetUser;
    totalDays: number;
    weekendDays: number;
    explicitLeaveDays: number;
    availableDays: number;
    filledAvailableDays: number;
    unfilledAvailableDays: number;
    verification: TimesheetSheetRow["verification"];
  } | null;
  canManageAllUsers: boolean;
  canVerifySheets: boolean;
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
  taskStatus?: TimesheetTaskSuggestion["status"];
  hours?: number;
  minutes?: number;
  entries?: {
    taskId?: number | null;
    taskTitle?: string;
    taskStatus?: TimesheetTaskSuggestion["status"];
    hours: number;
    minutes: number;
  }[];
};

export type SetTimesheetSheetLeaveInput = {
  entryDate: string;
  isLeave: boolean;
};

export type SetTimesheetSheetVerificationInput = {
  userId: string;
  isVerified: boolean;
};
