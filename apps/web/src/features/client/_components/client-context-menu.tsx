import { AppIcon } from "@/shared/components/app-icon";
import { useDismiss } from "@/shared/hooks/use-dismiss";
import type { ClientListItem, ClientMenuState } from "../client.types";

type ClientContextMenuProps = {
  menuState: ClientMenuState;
  canManage: boolean;
  setMenuState: (state: ClientMenuState) => void;
  onView: (client: ClientListItem) => void;
  onEdit: (client: ClientListItem) => void;
  onToggleStatus: (client: ClientListItem) => void;
};

function ClientContextMenu({
  menuState,
  canManage,
  setMenuState,
  onView,
  onEdit,
  onToggleStatus,
}: ClientContextMenuProps) {
  const menuRef = useDismiss<HTMLDivElement>({
    enabled: Boolean(menuState),
    onDismiss: () => setMenuState(null),
  });

  if (!menuState) return null;

  const client = menuState.row;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: menuState.y, left: menuState.x }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent"
        onClick={() => {
          onView(client);
          setMenuState(null);
        }}
      >
        <AppIcon name="Eye" className="size-3.5" />
        View client
      </button>

      {canManage ? (
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent disabled:opacity-50"
          disabled={!canManage}
          onClick={() => {
            onEdit(client);
            setMenuState(null);
          }}
        >
          <AppIcon name="Pencil" className="size-3.5" />
          Edit client
        </button>
      ) : null}

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent disabled:opacity-50"
        disabled={!canManage}
        onClick={() => {
          onToggleStatus(client);
          setMenuState(null);
        }}
      >
        <AppIcon
          name={client.isActive ? "CircleOff" : "CheckCircle2"}
          className="size-3.5"
        />
        {client.isActive ? "Disable client" : "Activate client"}
      </button>
    </div>
  );
}

export { ClientContextMenu };
