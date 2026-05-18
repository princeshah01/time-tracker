import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";

function AnalyticsPage() {
  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header className="sticky top-0 z-10" title="Analytics" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="p-4">
          <div className="w-full max-w-sm rounded-md border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md border border-border bg-muted/30">
                <AppIcon
                  name="BarChart3"
                  className="size-4 text-muted-foreground"
                />
              </span>
              <div>
                <h2 className="text-[13px] font-medium text-foreground">
                  Feature coming soon.
                </h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Analytics tools are not available yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default AnalyticsPage;
