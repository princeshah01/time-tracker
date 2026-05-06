import { useMemo, useState } from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { TAG_ICON_MAP } from "@/shared/constants/tag-icons";

import { AppIcon } from "./app-icon";
import { SkillTagRenderer } from "./tag-icon";

export type TagSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function TagSelect({
  value,
  onChange,
  placeholder = "Add tag",
  disabled = false,
}: TagSelectProps) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const query = draft.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return Object.keys(TAG_ICON_MAP)
      .filter((tag) => {
        const alreadySelected = value.some(
          (item) => item.toLowerCase() === tag.toLowerCase()
        );

        return !alreadySelected && tag.toLowerCase().includes(query);
      })
      .slice(0, 3);
  }, [draft, value]);

  function addTag(customTag?: string) {
    const tag = normalizeTag(customTag ?? draft);

    if (!tag) return;

    const existing = new Set(value.map((item) => item.toLowerCase()));

    if (!existing.has(tag.toLowerCase())) {
      onChange([...value, tag]);
    }

    setDraft("");
    setOpen(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.length > 0 ? (
          value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-[11px]"
            >
              <SkillTagRenderer
                skill={tag}
                className="max-w-40 border-none bg-transparent truncate"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-4 rounded-sm text-muted-foreground hover:text-foreground"
                disabled={disabled}
                onClick={() => removeTag(tag)}
              >
                <AppIcon name="X" className="size-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <span className="text-[12px] text-muted-foreground">No tags</span>
        )}
      </div>

      <div className="relative">
        <Input
          value={draft}
          variant="search"
          disabled={disabled}
          placeholder={placeholder}
          className="h-9 text-[13px]"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }

            if (event.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        />

        {open && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left hover:bg-accent"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(skill)}
              >
                <SkillTagRenderer
                  skill={skill}
                  className="border-none bg-transparent p-0"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { TagSelect };
