import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";

import { buildSidebarRoutes } from "../lib/build-sidebar";
import { AppSideBar, SideBar } from "./side-bar";

import { useAppSelector } from "@/app/store";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { PageLoader } from "./loaders";
import { userService } from "@/features/user/user.service";
import { toast } from "@workspace/ui/components/sonner";
import { NotificationDrawer } from "./notification-drawer";
import { ThemeToggle } from "./theme-toggle";

const AppLayout = () => {
  const [open, setOpen] = useState(false);

  const { permissions, isLoading } = useAppSelector((s) => s.user);

  const sideBarItems = buildSidebarRoutes(permissions);

  if (isLoading) {
    return <PageLoader />;
  }

  async function handleLogout() {
    const res = await userService.LogOut();
    if ((res.data as any).success) {
      window.location.href = window.location.origin + "/auth";
      return;
    }
    toast.error("Failed to log out. Please try again.");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSideBar items={sideBarItems} onLogout={handleLogout} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="fixed top-2 right-8 z-50 flex h-7 items-center gap-4">
          <ThemeToggle />
          <NotificationDrawer />
        </div>

        <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-3 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-52 bg-background p-0">
              <div className="flex h-full flex-col">
                <SideBar
                  items={sideBarItems}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-[14px] font-bold uppercase tracking-[0.08em]">
            Time Tracker
          </span>

          <div className="w-7" />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { AppLayout };
