import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  userManageService,
  type UserSearchResponse,
} from "@/features/users-mange";
import { EmptyState } from "@/shared/components/empty-container";
import { toast } from "@workspace/ui/components/sonner";
import { QUERY_KEYS } from "@/shared/constants";
import { useAppSelector } from "@/app/store";

type InviteEmailComboboxProps = {
  value: string;
  onChange: (value: string) => void;
};

function SuggestionSkeleton() {
  return (
    <div className="space-y-1 rounded-sm px-2 py-1.5">
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

function InviteEmailCombobox({ value, onChange }: InviteEmailComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useAppSelector((s) => s.user);
  const currentUserEmail = user?.email;
  const debouncedSetSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearch(query.trim());
      }, 400),
    []
  );

  useEffect(() => {
    debouncedSetSearch(value);

    return () => {
      debouncedSetSearch.cancel();
    };
  }, [value, debouncedSetSearch]);

  const {
    data: suggestions = [],
    isFetching,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.INVITE_USER_SUGGESTIONS, search],
    queryFn: async () => {
      const result = await userManageService.searchUsers({
        q: search,
        type: "invite",
        excludeSelf: false,
        limit: 5,
      });

      return result?.data?.suggestedUsers;
    },
    enabled: isOpen && search.length > 0,
    staleTime: 1000 * 60,
  });

  const globalLoading = isLoading || isFetching;

  function handleSelectSuggestion(
    user: UserSearchResponse["suggestedUsers"][number]
  ) {
    if (!user.canSendInvite) {
      toast.error("User already has access.");
      return;
    }
    onChange(user.email);
    setIsOpen(false);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <Input
        value={value}
        variant="search"
        type="email"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder="Type invitee email"
        className="h-8 text-[13px]"
      />

      {isOpen && value.trim() ? (
        <div className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {globalLoading ? (
            <div className="space-y-1">
              <SuggestionSkeleton />
              <SuggestionSkeleton />
            </div>
          ) : isError ? (
            <EmptyState
              size="sm"
              text="Failed to fetch users"
              containerClassName="min-h-24"
            />
          ) : suggestions.length > 0 ? (
            suggestions.map((user) => (
              <button
                key={user.email}
                type="button"
                className="flex w-full items-start justify-between rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectSuggestion(user)}
              >
                <div className="flex min-w-0 flex-col">
                  <span className="max-w-full truncate text-[12px] font-medium">
                    {user.email}
                  </span>

                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {user.name} {user.role ? `• ${user.role}` : ""}
                  </span>
                </div>

                {currentUserEmail === user.email && (
                  <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    You
                  </span>
                )}
              </button>
            ))
          ) : (
            <EmptyState
              size="sm"
              text="No users found"
              containerClassName="min-h-24"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export { InviteEmailCombobox };
