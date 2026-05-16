import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";

const NotificationSectionContent = () => {
  return (
    <TabsContent value="notifications" className="m-0">
      <SettingsSection title="Notifications" description="Feature coming soon">
        <div />
      </SettingsSection>
    </TabsContent>
  );
};

export { NotificationSectionContent };
