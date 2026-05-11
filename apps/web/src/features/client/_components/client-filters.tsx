import { AppIcon } from "@/shared/components/app-icon";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { ClientStatusFilter } from "../client.types";

type ClientFiltersProps = {
  search: string;
  status: ClientStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ClientStatusFilter) => void;
};

function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ClientFiltersProps) {
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
          placeholder="Search client, company, email, phone..."
          variant="search"
          className="pl-8 text-[13px]"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as ClientStatusFilter)}
      >
        <SelectTrigger className="h-8 text-[12px] lg:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clients</SelectItem>
          <SelectItem value="active">Active clients</SelectItem>
          <SelectItem value="inactive">Inactive clients</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export { ClientFilters };
