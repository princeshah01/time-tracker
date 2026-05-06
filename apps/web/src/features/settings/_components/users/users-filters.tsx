import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import type { AssignableRole } from "@/features/settings/settings.type";
import { AppIcon } from "@/shared/components/app-icon";
import { capitalize } from "@/shared/lib";
import type { StatusFilterValue } from "./users.types";

type UsersFiltersProps = {
  search: string;
  status: StatusFilterValue;
  role: string;
  roles: AssignableRole[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilterValue) => void;
  onRoleChange: (value: string) => void;
};

function UsersFilters({
  search,
  status,
  role,
  roles,
  onSearchChange,
  onStatusChange,
  onRoleChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-sm">
        <AppIcon
          name="Search"
          className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, role, skills..."
          variant="search"
          className="pl-8 text-[13px]"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFilterValue)}
      >
        <SelectTrigger className="h-8 text-[12px] lg:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="h-8 text-[12px] lg:w-44">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.value} value={String(role.value)}>
              {capitalize(role.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { UsersFilters };
