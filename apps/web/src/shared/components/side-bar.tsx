import { Link, useLocation } from "react-router-dom";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import type { SidebarGroupKey } from "@/shared/types";
import type { SidebarGroupMap } from "../lib/build-sidebar";
import { AppIcon } from "./app-icon";
import { useAppSelector } from "@/app/store/hooks";
import { getInitials } from "../lib/string";
import { StackedLogo } from "./stacked-logo";

const sidebarGroupOrder: SidebarGroupKey[] = [
  "General",
  "Management",
  "Insights",
  "System",
];

type SideBarProps = {
  items: SidebarGroupMap;
  onNavigate?: () => void;
  onLogout?: () => void;
};

export function SideBar({ items, onNavigate, onLogout }: SideBarProps) {
  const location = useLocation();
  const { user, role } = useAppSelector((s) => s.user);
  const { name: userName, image } = user || {};
  const { name: roleName } = role || {};
  const initials = getInitials(userName);
  console.log("Sidebar render", { userName, roleName, initials, image });
  return (
    <>
      <div className="flex h-11 items-center gap-2 border-b border-sidebar-border px-3">
        <StackedLogo size={16} />
        <span className="text-sm font-bold uppercase tracking-[0.08em]">
          Time Tracker
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-1.5 py-2">
        {sidebarGroupOrder.map((group) => {
          const groupItems = items[group];

          if (!groupItems.length) return null;

          return (
            <div key={group} className="mb-4">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group}
              </p>
              <div className="space-y-px">
                {groupItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1.5 text-[13px] transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <AppIcon name={item?.icon!} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="size-6">
            <AvatarImage src={image || ""} className="object-cover" />
            <AvatarFallback className="bg-sidebar-primary text-[9px] text-sidebar-primary-foreground">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="flex-1 truncate text-[12px] text-sidebar-foreground">
              {userName}
            </span>
            <span className="text-[10px] text-sidebar-foreground/50">
              {roleName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <AppIcon name="LogOut" className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function AppSideBar(props: SideBarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-52 flex-col border-r border-sidebar-border bg-sidebar-background md:flex">
      <div className="flex flex-1 flex-col overflow-hidden">
        <SideBar {...props} />
      </div>
    </aside>
  );
}
