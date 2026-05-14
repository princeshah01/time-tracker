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
