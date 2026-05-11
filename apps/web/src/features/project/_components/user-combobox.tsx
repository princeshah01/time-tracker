import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";

import { userManageService } from "@/features/users-mange";
import type { UserSearchResponse } from "@/features/users-mange";
import { EmptyState } from "@/shared/components/empty-container";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

type UserOption = UserSearchResponse["suggestedUsers"][number] & {
  id: string;
};

type UserComboboxProps = {
  value: string;
  disabled?: boolean;
  excludeUserIds?: string[];
  placeholder?: string;
  onSelect: (user: UserOption) => void;
};

function UserCombobox({
  value,
  disabled,
  excludeUserIds = [],
  placeholder = "Search user",
  onSelect,
}: UserComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearch(query.trim());
      }, 400),
    []
  );

  useEffect(() => {
    debouncedSetSearch(inputValue);

    return () => {
      debouncedSetSearch.cancel();
    };
  }, [inputValue, debouncedSetSearch]);

  const {
    data = [],
    isFetching,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project-user-search", search],
    enabled: isOpen && search.length > 0 && !disabled,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const response = await userManageService.searchUsers({
        q: search,
        type: "project-assign",
        excludeSelf: false,
        limit: 5,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch users");
      }

      const excluded = new Set(excludeUserIds);

      return response.data.suggestedUsers.filter(
        (user): user is UserOption =>
          typeof user.id === "string" && !excluded.has(user.id)
      );
    },
  });

  const globalLoading = isLoading || isFetching;

  useEffect(() => {
    setActiveIndex(0);
  }, [data.length, isOpen]);

  function handleSelect(user: UserOption) {
    setInputValue(user.name);
    onSelect(user);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || data.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % data.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + data.length) % data.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedUser = data[activeIndex];
      if (selectedUser) handleSelect(selectedUser);
    }
  }

  return (
    <div className="relative min-w-0">
      <Input
        value={inputValue}
        variant="search"
        disabled={disabled}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setInputValue(event.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        className="h-8 text-[13px]"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="project-user-options"
        aria-activedescendant={
          isOpen && data[activeIndex]
            ? `project-user-option-${data[activeIndex].id}`
            : undefined
        }
      />

      {isOpen && inputValue.trim() ? (
        <div
          id="project-user-options"
          className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {globalLoading ? (
            <div className="space-y-1">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isError ? (
            <EmptyState
              size="sm"
              text="Failed to fetch users"
              containerClassName="min-h-24"
            />
          ) : data.length > 0 ? (
            data.map((user, index) => (
              <button
                key={user.id}
                id={`project-user-option-${user.id}`}
                type="button"
                className={cn(
                  "flex w-full flex-col rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground",
                  index === activeIndex && "bg-accent text-accent-foreground"
                )}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(user)}
              >
                <span className="truncate text-[12px] font-medium">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
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

export { UserCombobox, type UserOption };
