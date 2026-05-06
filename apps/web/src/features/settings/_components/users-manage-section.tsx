import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import debounce from "lodash.debounce";

import { TabsContent } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";

import { settingsService } from "@/features/settings";
import { userManageService } from "@/features/users-mange";
import type {
  UpdateUserInput,
  UserListItem,
  UserStatusFilter,
} from "@/features/users-mange";
import { AppIcon } from "@/shared/components/app-icon";
import { DataTable } from "@/shared/components/data-table";
import { env } from "@/shared/config";
import { QUERY_KEYS } from "@/shared/constants";
import {
  capitalize,
  formatDate,
  formatTableDate,
  getInitials,
} from "@/shared/lib";
import { SettingsSection } from "./settings-body";

type StatusFilterValue = UserStatusFilter | "all";

function getImageUrl(image?: string | null) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${env.VITE_API_BASE_URL}${image}`;
}

function parseSkills(value: string) {
  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
    ),
  ];
}

function UserManageSectionContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilterValue>("all");
  const [role, setRole] = useState("all");
  const [rowLimit, setRowLimit] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    row: UserListItem;
  } | null>(null);

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const rolesQuery = useQuery({
    queryKey: [QUERY_KEYS.ASSIGNABLE_ROLES],
    queryFn: async () => {
      const response = await settingsService.listAssignableRoles();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch roles");
      }

      return response.data.assignableRoles;
    },
  });

  const usersQuery = useInfiniteQuery({
    queryKey: [QUERY_KEYS.USERS, debouncedSearch, status, role, rowLimit],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await userManageService.listUsers({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        status: status === "all" ? undefined : status,
        role: role === "all" ? undefined : role,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch users");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (input: { userId: string; data: UpdateUserInput }) => {
      const response = await userManageService.updateUser(
        input.userId,
        input.data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update user");
      }

      return response.data;
    },
    onSuccess: (user) => {
      toast.success("User updated successfully");
      setSelectedUser((current) => (current?.id === user.id ? user : current));
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_DETAIL, user.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await userManageService.sendPasswordReset(userId);

      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Password reset email sent");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [usersQuery.data]
  );

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src={getImageUrl(user.image)}
                  className="object-cover"
                />
                <AvatarFallback className="text-[11px]">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="block truncate font-medium" title={user.name}>
                  {user.name}
                </span>
                <span
                  className="block truncate text-[12px] text-muted-foreground"
                  title={user.email}
                >
                  {user.email}
                </span>
              </div>
            </div>
          );
        },
        size: 260,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => capitalize(row.original.role?.name ?? "-"),
        size: 130,
      },
      {
        accessorKey: "skills",
        header: "Skills",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-wrap gap-1">
            {row.original.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
            {row.original.skills.length > 3 ? (
              <Badge variant="outline" className="text-[10px]">
                +{row.original.skills.length - 3}
              </Badge>
            ) : null}
            {row.original.skills.length === 0 ? (
              <span className="text-muted-foreground">-</span>
            ) : null}
          </div>
        ),
        size: 230,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
        size: 120,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-6 w-16 rounded-md text-[10px]",
                user.isActive
                  ? "border-success bg-success/10 text-success hover:bg-success/20 hover:text-success"
                  : "border-muted bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              disabled={updateUserMutation.isPending}
              onClick={(event) => {
                event.stopPropagation();
                updateUserMutation.mutate({
                  userId: user.id,
                  data: { isActive: !user.isActive },
                });
              }}
            >
              {user.isActive ? "Active" : "Inactive"}
            </Button>
          );
        },
        size: 95,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            disabled={!row.original.isActive || resetPasswordMutation.isPending}
            onClick={(event) => {
              event.stopPropagation();
              resetPasswordMutation.mutate(row.original.id);
            }}
            aria-label="Send password reset"
            title="Send password reset"
          >
            <AppIcon name="Lock" className="size-3.5" />
          </Button>
        ),
        size: 65,
      },
    ],
    [resetPasswordMutation, updateUserMutation]
  );

  return (
    <TabsContent value="users" className="m-0">
      <SettingsSection title="Users" description="Manage users and access.">
        <div className="space-y-4 border-t p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <AppIcon
                name="Search"
                className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, role, skills..."
                variant="search"
                className="pl-8 text-[13px]"
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilterValue)}
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

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-8 text-[12px] lg:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {(rolesQuery.data ?? []).map((role) => (
                  <SelectItem key={role.value} value={String(role.value)}>
                    {capitalize(role.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={users}
            columns={columns}
            getRowId={(row) => row.id}
            isLoading={usersQuery.isLoading}
            hasNextPage={usersQuery.hasNextPage}
            isFetchingNextPage={usersQuery.isFetchingNextPage}
            fetchNextPage={usersQuery.fetchNextPage}
            setRowLimit={setRowLimit}
            onRowClick={(user) => {
              setMenuState(null);
              setSelectedUser(user);
            }}
            onRowContextMenu={(event, user) => {
              setMenuState({
                x: event.clientX,
                y: event.clientY,
                row: user,
              });
            }}
            emptyText="No users found"
          />

          <UserTableContextMenu
            menuState={menuState}
            setMenuState={setMenuState}
            openEdit={setSelectedUser}
            updateUserMutation={updateUserMutation}
            resetPasswordMutation={resetPasswordMutation}
          />
        </div>

        <UserDetailDialog
          user={selectedUser}
          roles={rolesQuery.data ?? []}
          open={Boolean(selectedUser)}
          isSaving={updateUserMutation.isPending}
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
          onSave={(userId, data) =>
            updateUserMutation.mutate({
              userId,
              data,
            })
          }
          onSendReset={(userId) => resetPasswordMutation.mutate(userId)}
          isSendingReset={resetPasswordMutation.isPending}
        />
      </SettingsSection>
    </TabsContent>
  );
}

function UserDetailDialog({
  user,
  roles,
  open,
  isSaving,
  isSendingReset,
  onOpenChange,
  onSave,
  onSendReset,
}: {
  user: UserListItem | null;
  roles: { label: string; value: number }[];
  open: boolean;
  isSaving: boolean;
  isSendingReset: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, data: UpdateUserInput) => void;
  onSendReset: (userId: string) => void;
}) {
  const [roleId, setRoleId] = useState("none");
  const [name, setName] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const userDetailQuery = useQuery({
    queryKey: [QUERY_KEYS.USER_DETAIL, user?.id],
    enabled: open && Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error("User id is required");

      const response = await userManageService.viewUser(user.id);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch user");
      }

      return response.data;
    },
  });

  const currentUser = userDetailQuery.data ?? user;
  const roleOptions = useMemo(() => {
    if (!currentUser?.role?.id) return roles;
    const hasCurrentRole = roles.some(
      (role) => role.value === currentUser.role?.id
    );

    return hasCurrentRole
      ? roles
      : [
          ...roles,
          {
            value: currentUser.role.id,
            label: currentUser.role.name ?? "Current role",
          },
        ];
  }, [currentUser?.role, roles]);

  useEffect(() => {
    if (!currentUser) return;

    setRoleId(currentUser.role?.id ? String(currentUser.role.id) : "none");
    setName(currentUser.name);
    setSkillsText(currentUser.skills.join(", "));
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>{currentUser.email}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-3">
            <Avatar className="size-24 rounded-md">
              <AvatarImage
                src={getImageUrl(currentUser.image)}
                className="object-cover"
              />
              <AvatarFallback className="rounded-md text-lg">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>

            <Badge
              variant="outline"
              className={cn(
                "text-[11px]",
                currentUser.isActive
                  ? "border-success bg-success/10 text-success"
                  : "border-muted bg-muted text-muted-foreground"
              )}
            >
              {currentUser.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Email" value={currentUser.email} />
              <InfoBlock
                label="Joined"
                value={formatDate(currentUser.createdAt)}
              />
              <InfoBlock
                label="Verification"
                value={currentUser.emailVerified ? "Verified" : "Unverified"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-medium">Name</div>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-9 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-medium">Role</div>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No role</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={String(role.value)}>
                      {capitalize(role.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-medium">Skills</div>
              <Textarea
                value={skillsText}
                onChange={(event) => setSkillsText(event.target.value)}
                placeholder="react, postgres, reporting"
                className="min-h-20 text-[13px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!currentUser.isActive || isSendingReset}
            onClick={() => onSendReset(currentUser.id)}
          >
            <AppIcon name="Lock" className="size-3.5" />
            Send reset
          </Button>
          <Button
            type="button"
            disabled={isSaving || userDetailQuery.isLoading}
            onClick={() =>
              onSave(currentUser.id, {
                name,
                roleId: roleId === "none" ? null : Number(roleId),
                skills: parseSkills(skillsText),
              })
            }
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserTableContextMenu({
  menuState,
  setMenuState,
  openEdit,
  updateUserMutation,
  resetPasswordMutation,
}: {
  menuState: {
    x: number;
    y: number;
    row: UserListItem;
  } | null;
  setMenuState: (
    state: {
      x: number;
      y: number;
      row: UserListItem;
    } | null
  ) => void;
  openEdit: (user: UserListItem) => void;
  updateUserMutation: {
    isPending: boolean;
    mutate: (input: { userId: string; data: UpdateUserInput }) => void;
  };
  resetPasswordMutation: {
    isPending: boolean;
    mutate: (userId: string) => void;
  };
}) {
  if (!menuState) return null;

  const user = menuState.row;

  return (
    <div
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
        onClick={() => {
          updateUserMutation.mutate({
            userId: user.id,
            data: { isActive: !user.isActive },
          });
          setMenuState(null);
        }}
      >
        <AppIcon name="CircleOff" className="size-3.5" />
        {user.isActive ? "Disable user" : "Activate user"}
      </button>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-[13px] font-medium" title={value}>
        {value}
      </div>
    </div>
  );
}

export { UserManageSectionContent };
