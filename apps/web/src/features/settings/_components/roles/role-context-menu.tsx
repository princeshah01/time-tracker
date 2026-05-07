import { AppIcon } from "@/shared/components/app-icon";
import type { RoleListItem } from "@/features/settings/settings.type";
import { useDismiss } from "@/shared/hooks/use-dismiss";

type RoleTableContextMenuProps = {
  menuState: {
    x: number;
    y: number;
    row: RoleListItem;
  } | null;
  openEdit: (row: RoleListItem) => void;
  setMenuState: (state: RoleTableContextMenuProps["menuState"]) => void;
  toggleRoleStatusMutation: {
    isPending: boolean;
    mutate: (row: RoleListItem) => void;
  };
};

const RoleTableContextMenu = ({
  menuState,
  openEdit,
  setMenuState,
  toggleRoleStatusMutation,
}: RoleTableContextMenuProps) => {
  const menuRef = useDismiss<HTMLDivElement>({
    enabled: Boolean(menuState),
    onDismiss: () => setMenuState(null),
  });

  if (!menuState) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: menuState.y, left: menuState.x }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => {
          openEdit(menuState.row);
          setMenuState(null);
        }}
      >
        <AppIcon name="Pencil" className="size-3.5" />
        Edit role
      </button>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
        disabled={menuState.row.isDefault || toggleRoleStatusMutation.isPending}
        onClick={() => {
          toggleRoleStatusMutation.mutate(menuState.row);
          setMenuState(null);
        }}
      >
        <AppIcon name="CircleOff" className="size-3.5" />
        {menuState.row.isActive ? "Disable role" : "Activate role"}
      </button>
    </div>
  );
};

export { RoleTableContextMenu };
