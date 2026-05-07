import { Checkbox } from "@workspace/ui/components/checkbox";
import { Skeleton } from "@workspace/ui/components/skeleton";

type RolePermissionSkeletonProps = {
  count: number;
};

const PermissionsViewSkeleton = ({ count }: RolePermissionSkeletonProps) => {
  return (
    <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto rounded-md border p-3 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
};

type PermissionsViewProps = {
  permissions: { name: string }[];
  selected: Set<string>;
  onToggle: (name: string, checked: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

const PermissionsView = ({
  permissions,
  selected,
  onToggle,
  disabled = false,
  isLoading = false,
}: PermissionsViewProps) => {
  return isLoading && permissions.length === 0 ? (
    <PermissionsViewSkeleton count={18} />
  ) : (
    <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto rounded-md border p-3 md:grid-cols-2">
      {permissions.map((permission) => {
        const checked = selected.has(permission.name);
        const permissionId = `permission-${permission.name}`;
        return (
          <label
            key={permission.name}
            htmlFor={permissionId}
            className="flex items-center gap-2 text-xs"
          >
            <Checkbox
              id={permissionId}
              checked={checked}
              disabled={disabled}
              onCheckedChange={(value) =>
                onToggle(permission.name, Boolean(value))
              }
            />
            <span className="truncate">{permission.name}</span>
          </label>
        );
      })}
    </div>
  );
};

export { PermissionsView };
