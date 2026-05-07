export type Permission = string;

export type Role = {
  id: number;
  name: string;
  description: string | null;
  level: number;
};
