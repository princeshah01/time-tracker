import { DEFAULT_TAG_ICON, TAG_ICON_MAP } from "@/shared/constants/tag-icons";
import { cn } from "@workspace/ui/lib/utils";
import { capitalize } from "@/shared/lib";
function getTagIcon(tag: string) {
  const normalizedTag = tag
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.\-_]/g, "");

  return TAG_ICON_MAP[normalizedTag] || DEFAULT_TAG_ICON;
}

type SkillTagRendererProps = {
  skill: string;
  className?: string;
};

export function SkillTagRenderer({ skill, className }: SkillTagRendererProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-background px-1 py-0.5 text-xs font-medium",
        className
      )}
    >
      <i className={cn(getTagIcon(skill), "text-[8px]")} />

      <span className="truncate uppercase text-[8px]">{skill}</span>
    </div>
  );
}
