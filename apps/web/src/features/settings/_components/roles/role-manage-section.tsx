import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "../settings-body";
import { RoleTable } from "./role-table";
const RoleManageSectionContent = () => {
  return (
    <TabsContent value="roles" className="m-0">
      <SettingsSection
        title="Roles"
        description="Manage user roles and permissions."
      >
        <RoleTable />
      </SettingsSection>
    </TabsContent>
  );
};

export { RoleManageSectionContent };
