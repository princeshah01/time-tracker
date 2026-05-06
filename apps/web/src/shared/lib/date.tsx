import { format } from "date-fns";

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";
  return format(parsedDate, "MMM d, yyyy");
}

export function formatTableDate(date: string | Date | null | undefined) {
  const formattedDate = formatDate(date);

  return (
    <time title={formattedDate} className="text-[12px]">
      {formattedDate}
    </time>
  );
}
