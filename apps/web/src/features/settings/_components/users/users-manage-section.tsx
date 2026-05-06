import { TabsContent } from "@workspace/ui/components/tabs";

import { SettingsSection } from "../settings-body";
import { UsersManagementContent } from "./users-management-content";

function UserManageSectionContent() {
  return (
    <TabsContent value="users" className="m-0">
      <SettingsSection title="Users" description="Manage users and access.">
        <UsersManagementContent />
      </SettingsSection>
    </TabsContent>
  );
}

export { UserManageSectionContent };
