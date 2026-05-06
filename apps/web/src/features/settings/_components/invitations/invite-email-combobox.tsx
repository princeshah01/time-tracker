import { useMemo, useState } from "react";
import { toast } from "@workspace/ui/components/sonner";
import { Input } from "@workspace/ui/components/input";

type InviteEmailComboboxProps = {
  value: string;
  suggestions: string[];
  onChange: (value: string) => void;
};

function InviteEmailCombobox({
  value,
  suggestions,
  onChange,
}: InviteEmailComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const matchingSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return suggestions.slice(0, 5);
    }

    return suggestions
      .filter((email) => email.toLowerCase().includes(query))
      .slice(0, 5);
  }, [suggestions, value]);

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
          {matchingSuggestions.length > 0 ? (
            matchingSuggestions.map((email) => (
              <button
                key={email}
                type="button"
                className="flex h-8 w-full items-center rounded-sm px-2 text-left text-[12px] hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  toast.error(
                    "User not found. Please enter a valid email address."
                  );
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{email}</span>
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-[12px] text-muted-foreground">
              No result found
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export { InviteEmailCombobox };
