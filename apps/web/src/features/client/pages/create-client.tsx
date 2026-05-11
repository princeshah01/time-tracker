import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { PageContent } from "@/shared/components/page-content";
import { AppIcon } from "@/shared/components/app-icon";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { useAppSelector } from "@/app/store/hooks";
import { hasPermission } from "@/shared/lib/permissions";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";

import { ClientForm } from "../_components";
import { clientService } from "../service";
import type { CreateClientInput, UpdateClientInput } from "../client.types";

function CreateClientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canCreateClient = hasPermission(userPermissions, [
    permissions.clientCreate,
  ]);

  const createClientMutation = useMutation({
    mutationFn: async (input: CreateClientInput | UpdateClientInput) => {
      const response = await clientService.createClient(
        input as CreateClientInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create client");
      }

      return response.data;
    },
    onSuccess: (client) => {
      toast.success("Client created successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
      navigate(`/clients/${client.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Create Client" className="sticky top-0 z-10" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <section className="bg-background max-w-4xl border-r border-b">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold">Client details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add contact, company, and billing information for a client.
            </p>
          </div>

          <ClientForm
            mode="create"
            canSubmit={canCreateClient}
            isSubmitting={createClientMutation.isPending}
            onCancel={() => navigate("/clients")}
            onSubmit={(input) => createClientMutation.mutate(input)}
          />
        </section>
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default CreateClientPage;
