import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";

import { clientService } from "@/features/client";
import { EmptyState } from "@/shared/components/empty-container";
import { QUERY_KEYS } from "@/shared/constants";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

type ClientComboboxProps = {
  value: number | null;
  label: string;
  disabled?: boolean;
  onChange: (value: { label: string; value: number } | null) => void;
};

function SuggestionSkeleton() {
  return (
    <div className="space-y-1 rounded-sm px-2 py-1.5">
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

function ClientCombobox({ label, disabled, onChange }: ClientComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(label);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setInputValue(label);
  }, [label]);

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
    data: suggestions = [],
    isFetching,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.CLIENT_AUTOCOMPLETE, search],
    queryFn: async () => {
      const response = await clientService.autocompleteClients({ q: search });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch clients");
      }

      return response.data.clients;
    },
    enabled: isOpen && search.length > 0 && !disabled,
    staleTime: 1000 * 60,
  });

  const globalLoading = isLoading || isFetching;

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, isOpen]);

  function handleSelect(client: { label: string; value: number }) {
    setInputValue(client.label);
    onChange(client);
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

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedClient = suggestions[activeIndex];
      if (selectedClient) handleSelect(selectedClient);
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
          onChange(null);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder="Search client"
        className="h-8 text-[13px]"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="project-client-options"
        aria-activedescendant={
          isOpen && suggestions[activeIndex]
            ? `project-client-option-${suggestions[activeIndex].value}`
            : undefined
        }
      />

      {isOpen && inputValue.trim() ? (
        <div
          id="project-client-options"
          className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          role="listbox"
        >
          {globalLoading ? (
            <div className="space-y-1">
              <SuggestionSkeleton />
              <SuggestionSkeleton />
            </div>
          ) : isError ? (
            <EmptyState
              size="sm"
              text="Failed to fetch clients"
              containerClassName="min-h-24"
            />
          ) : suggestions.length > 0 ? (
            suggestions.map((client, index) => (
              <button
                key={client.value}
                id={`project-client-option-${client.value}`}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground",
                  index === activeIndex && "bg-accent text-accent-foreground"
                )}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(client)}
              >
                <span className="max-w-full truncate text-[12px] font-medium">
                  {client.label}
                </span>
                <span className="ml-2 text-[11px] text-muted-foreground">
                  #{client.value}
                </span>
              </button>
            ))
          ) : (
            <EmptyState
              size="sm"
              text="No clients found"
              containerClassName="min-h-24"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export { ClientCombobox };
