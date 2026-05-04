import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";

const UserManageSectionContent = () => {
  return (
    <TabsContent value="users" className="m-0">
      <SettingsSection title="Users" description="Manage your users.">
        <div />
      </SettingsSection>
    </TabsContent>
  );
};

export { UserManageSectionContent };
