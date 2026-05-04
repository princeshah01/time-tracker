import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";

const RoleManageSectionContent = () => {
  return (
    <TabsContent value="roles" className="m-0">
      <SettingsSection
        title="Roles"
        description="Manage user roles and permissions."
      >
        <div />
      </SettingsSection>
    </TabsContent>
  );
};

export { RoleManageSectionContent };
