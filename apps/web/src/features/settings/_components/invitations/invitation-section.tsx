import { TabsContent } from "@workspace/ui/components/tabs";

import { SettingsSection } from "../settings-body";
import { InviteCompose } from "./invite-compose";
import { InvitationTable } from "./invitation-table";
import { INVITATION_ROLE_OPTIONS } from "./invitations.mock";

const InvitationSectionContent = () => {

  // TODO fetch Roles we can invite

  return (
    <TabsContent value="invitations" className="m-0">
      <SettingsSection
        title="Invitations"
        description="Create invitations and review invite status."
      >
        <InviteCompose roles={INVITATION_ROLE_OPTIONS} />
        <InvitationTable />
      </SettingsSection>
    </TabsContent>
  );
};

export { InvitationSectionContent };
