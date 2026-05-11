import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { AppIcon } from "@/shared/components/app-icon";
import type { ClientListItem } from "../client.types";

function ClientIdentityCell({ client }: { client: ClientListItem }) {
  return (
    <div className="min-w-0">
      <span className="block truncate font-medium" title={client.name}>
        {client.name}
      </span>
      <span
        className="block truncate text-[12px] text-muted-foreground"
        title={client.email}
      >
        {client.email}
      </span>
    </div>
  );
}

function ClientStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md text-[10px]",
        isActive
          ? "border-success bg-success/10 text-success"
          : "border-muted bg-muted text-muted-foreground"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function ClientStatusAction({
  client,
  canManage,
  onToggleStatus,
}: {
  client: ClientListItem;
  canManage: boolean;
  onToggleStatus: (client: ClientListItem) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground"
      disabled={!canManage}
      title={client.isActive ? "Disable client" : "Activate client"}
      aria-label={client.isActive ? "Disable client" : "Activate client"}
      onClick={(event) => {
        event.stopPropagation();
        onToggleStatus(client);
      }}
    >
      <AppIcon
        name={client.isActive ? "CircleOff" : "CheckCircle2"}
        className="size-3.5"
      />
    </Button>
  );
}

export { ClientIdentityCell, ClientStatusAction, ClientStatusBadge };
