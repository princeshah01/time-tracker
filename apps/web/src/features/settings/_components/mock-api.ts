// mock-api.ts
type Role = {
  id: number;
  name: string;
  description: string;
  permissionsCount: number;
  isDefault: boolean;
};

const ALL_ROLES: Role[] = Array.from({ length: 120 }).map((_, i) => ({
  id: i + 1,
  name: `Role ${i + 1}`,
  description: `Description for role ${i + 1}`,
  permissionsCount: Math.floor(Math.random() * 20),
  isDefault: i === 3,
}));

export async function fetchRoles({
  pageParam = 0,
  search = "",
  limit = 20,
}: {
  pageParam?: number;
  search?: string;
  limit?: number;
}) {
  await new Promise((r) => setTimeout(r, 500)); // simulate API delay

  const pageSize = limit ?? 20;

  const filtered = ALL_ROLES.filter((r) =>
    [r.name, r.description]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const start = pageParam * pageSize;
  const end = start + pageSize;

  return {
    data: filtered.slice(start, end),
    nextPage: end < filtered.length ? pageParam + 1 : undefined,
  };
}
