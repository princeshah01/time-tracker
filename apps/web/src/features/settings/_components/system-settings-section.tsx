import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";

const WorkSpaceSectionContent = () => {
  return (
    <TabsContent value="workspace" className="m-0">
      <SettingsSection
        title="Workspace Settings"
        description="Feature coming soon"
      >
        <div />
      </SettingsSection>
    </TabsContent>
  );
};

export { WorkSpaceSectionContent };
