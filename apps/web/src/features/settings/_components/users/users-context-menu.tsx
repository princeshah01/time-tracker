import type { UpdateUserInput, UserListItem } from "@/features/users-mange";
import { AppIcon } from "@/shared/components/app-icon";
import type {
  ResetPasswordMutation,
  UpdateUserMutation,
  UserMenuState,
} from "./users.types";
import { useDismiss } from "@/shared/hooks/use-dismiss";

type UsersContextMenuProps = {
  menuState: UserMenuState;
  setMenuState: (state: UserMenuState) => void;
  openEdit: (user: UserListItem) => void;
  updateUserMutation: Pick<UpdateUserMutation, "isPending" | "mutate">;
  resetPasswordMutation: Pick<ResetPasswordMutation, "isPending" | "mutate">;
};

function UsersContextMenu({
  menuState,
  setMenuState,
  openEdit,
  updateUserMutation,
  resetPasswordMutation,
}: UsersContextMenuProps) {
  if (!menuState) return null;

  const menuRef = useDismiss<HTMLDivElement>({
    enabled: !!menuState,
    onDismiss: () => setMenuState(null),
  });

  const user = menuState.row;

  function updateUser(data: UpdateUserInput) {
    updateUserMutation.mutate({
      userId: user.id,
      data,
    });
    setMenuState(null);
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: menuState.y, left: menuState.x }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => {
          openEdit(user);
          setMenuState(null);
        }}
      >
        <AppIcon name="Pencil" className="size-3.5" />
        Edit user
      </button>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
        disabled={!user.isActive || resetPasswordMutation.isPending}
        onClick={() => {
          resetPasswordMutation.mutate(user.id);
          setMenuState(null);
        }}
      >
        <AppIcon name="Lock" className="size-3.5" />
        Send reset link
      </button>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
        disabled={updateUserMutation.isPending}
        onClick={() => updateUser({ isActive: !user.isActive })}
      >
        <AppIcon name="CircleOff" className="size-3.5" />
        {user.isActive ? "Disable user" : "Activate user"}
      </button>
    </div>
  );
}

export { UsersContextMenu };
