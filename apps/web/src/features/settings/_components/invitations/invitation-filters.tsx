import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { AppIcon } from "@/shared/components/app-icon";
import type { InvitationStatus } from "./invitations.types";

export type InvitationStatusFilter = InvitationStatus | "all";

type InvitationFiltersProps = {
  search: string;
  status: InvitationStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InvitationStatusFilter) => void;
};

const statusOptions: { value: InvitationStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
];

function InvitationFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: InvitationFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <AppIcon
          name="Search"
          className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search email or inviter..."
          variant="search"
          className="pl-8 text-[13px]"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-full text-[12px] sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { InvitationFilters };
