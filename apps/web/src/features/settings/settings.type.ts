export type RoleListItem = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  permissionsCount: number;
};

export type RolePermission = {
  name: string;
  include: boolean;
};

export type RoleView = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  permissions: RolePermission[];
};

export type ListRolesResponse = {
  items: RoleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};
