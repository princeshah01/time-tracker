import { TabsContent } from "@workspace/ui/components/tabs";

import { SettingsSection } from "../settings-body";
import { InviteCompose } from "./invite-compose";
import { InvitationTable } from "./invitation-table";

const InvitationSectionContent = () => {
  return (
    <TabsContent value="invitations" className="m-0">
      <SettingsSection
        title="Invitations"
        description="Create invitations and review invite status."
      >
        <InviteCompose />
        <InvitationTable />
      </SettingsSection>
    </TabsContent>
  );
};

export { InvitationSectionContent };
