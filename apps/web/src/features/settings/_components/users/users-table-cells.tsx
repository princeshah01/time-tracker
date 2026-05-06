import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import type { UpdateUserInput, UserListItem } from "@/features/users-mange";
import { AppIcon } from "@/shared/components/app-icon";
import { env } from "@/shared/config";
import { getInitials } from "@/shared/lib";
import type { ResetPasswordMutation, UpdateUserMutation } from "./users.types";
import { SkillTagRenderer } from "@/shared/components/tag-icon";

function getImageUrl(image?: string | null) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${env.VITE_API_BASE_URL}${image}`;
}

function UserIdentityCell({ user }: { user: UserListItem }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-8">
        <AvatarImage src={getImageUrl(user.image)} className="object-cover" />
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
}

function UserSkillsCell({ skills }: { skills: string[] }) {
  return (
    <div className="flex min-w-0 flex-wrap gap-1">
      {skills.slice(0, 3).map((skill) => (
        <SkillTagRenderer key={skill} skill={skill} className="text-[10px]" />
      ))}
      {skills.length > 3 ? (
        <Badge variant="outline" className="text-[10px]">
          +{skills.length - 3}
        </Badge>
      ) : null}
      {skills.length === 0 ? (
        <span className="text-muted-foreground">-</span>
      ) : null}
    </div>
  );
}

function UserEmailVerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] rounded-md",
        verified
          ? "border-success bg-success/10 text-success"
          : "border-warning bg-warning/10 text-warning"
      )}
    >
      {verified ? "Verified" : "Unverified"}
    </Badge>
  );
}

function UserStatusButton({
  user,
  updateUserMutation,
}: {
  user: UserListItem;
  updateUserMutation: Pick<UpdateUserMutation, "isPending" | "mutate">;
}) {
  function toggleStatus(data: UpdateUserInput) {
    updateUserMutation.mutate({
      userId: user.id,
      data,
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-5 w-12 rounded-md text-[10px] cursor-pointer",
        user.isActive
          ? "border-success bg-success/10 text-success hover:bg-success/20 hover:text-success"
          : "border-muted bg-muted text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground"
      )}
      disabled={updateUserMutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        toggleStatus({ isActive: !user.isActive });
      }}
    >
      {user.isActive ? "Active" : "Inactive"}
    </Button>
  );
}

function UserResetPasswordButton({
  user,
  resetPasswordMutation,
}: {
  user: UserListItem;
  resetPasswordMutation: Pick<ResetPasswordMutation, "isPending" | "mutate">;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground"
      disabled={!user.isActive || resetPasswordMutation.isPending}
      onClick={(event) => {
        event.stopPropagation();
        resetPasswordMutation.mutate(user.id);
      }}
      aria-label="Send password reset"
      title="Send password reset"
    >
      <AppIcon name="Lock" className="size-3.5" />
    </Button>
  );
}

export {
  UserEmailVerifiedBadge,
  UserIdentityCell,
  UserResetPasswordButton,
  UserSkillsCell,
  UserStatusButton,
  getImageUrl,
};
