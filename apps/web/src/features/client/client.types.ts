export type ClientStatusFilter = "all" | "active" | "inactive";

export type ClientProject = {
  id: number | string;
  name: string;
  code?: string | null;
  status?: string | null;
  totalHours?: number | null;
  updatedAt?: string | null;
};

export type ClientListItem = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectTotal?: number;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
};

export type ClientDetail = ClientListItem & {
  projects?: ClientProject[];
};

export type ListClientsResponse = {
  items: ClientListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type CreateClientInput = {
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
};

export type UpdateClientInput = Partial<CreateClientInput>;

export type ClientAutocompleteOption = {
  label: string;
  value: number;
};

export type ClientMenuState = {
  x: number;
  y: number;
  row: ClientListItem;
} | null;
