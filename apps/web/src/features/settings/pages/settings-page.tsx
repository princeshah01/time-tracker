import { PageContent } from "@/shared/components/page-content";

const SettingsPage = () => {
  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header className="sticky top-0 z-10" title="Settings" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="h-[200vh]"></div>
      </PageContent.Body>
    </PageContent.Root>
  );
};

export default SettingsPage;
