import { useEffect, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";
import { permissions } from "@/shared/constants";
import { hasPermission } from "@/shared/lib/permissions";
import type { AppIconName } from "@/shared/types";

import { InvitationSectionContent } from "./invitations";
import { NotificationSectionContent } from "./notification-section";
import { ProfileSectionContent } from "./profile-section";
import { RoleManageSectionContent } from "./roles";
import { SecuritySectionContent } from "./security-section";
import { WorkSpaceSectionContent } from "./system-settings-section";
import { UserManageSectionContent } from "./users-manage-section";

const SETTINGS_TABS = [
  "profile",
  "users",
  "invitations",
  "roles",
  "notifications",
  "security",
  "workspace",
] as const;

type SettingsTabValue = (typeof SETTINGS_TABS)[number];

//TODO: add permissions for each tab later
const TAB_PERMISSIONS: Record<SettingsTabValue, string[]> = {
  profile: [permissions.profileView],
  users: [permissions.userView],
  invitations: [permissions.userInvite],
  roles: [permissions.roleView],
  notifications: [],
  security: [permissions.profileSecurityManage],
  workspace: [],
};

const TAB_META: Record<
  SettingsTabValue,
  {
    icon: AppIconName;
    label: string;
    content: ReactNode;
  }
> = {
  profile: {
    icon: "User",
    label: "Profile",
    content: <ProfileSectionContent />,
  },
  users: {
    icon: "Users",
    label: "Users",
    content: <UserManageSectionContent />,
  },
  invitations: {
    icon: "Mail",
    label: "Invitations",
    content: <InvitationSectionContent />,
  },
  roles: {
    icon: "Shield",
    label: "Roles",
    content: <RoleManageSectionContent />,
  },
  notifications: {
    icon: "Bell",
    label: "Notifications",
    content: <NotificationSectionContent />,
  },
  security: {
    icon: "Lock",
    label: "Security",
    content: <SecuritySectionContent />,
  },
  workspace: {
    icon: "Building2",
    label: "Workspace Settings",
    content: <WorkSpaceSectionContent />,
  },
};

function getValidSettingsTab(tab: string | null): SettingsTabValue {
  if (SETTINGS_TABS.includes(tab as SettingsTabValue)) {
    return tab as SettingsTabValue;
  }

  return "profile";
}

export const SettingsBody = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userPermissions = useAppSelector(
    (state) => state.user.permissions ?? []
  );

  const allowedTabs = SETTINGS_TABS.filter((tab) =>
    hasPermission(userPermissions, TAB_PERMISSIONS[tab])
  );

  const fallbackTab = allowedTabs[0] ?? "profile";
  const requestedTab = getValidSettingsTab(searchParams.get("t"));

  const activeTab = hasPermission(
    userPermissions,
    TAB_PERMISSIONS[requestedTab]
  )
    ? requestedTab
    : fallbackTab;

  useEffect(() => {
    const currentTab = searchParams.get("t");

    if (currentTab !== activeTab) {
      const params = new URLSearchParams(searchParams);
      params.set("t", activeTab);

      navigate(
        {
          pathname: "/settings",
          search: params.toString(),
        },
        { replace: true }
      );
    }
  }, [activeTab, navigate, searchParams]);

  function handleTabChange(value: string) {
    const nextTab = getValidSettingsTab(value);

    if (!hasPermission(userPermissions, TAB_PERMISSIONS[nextTab])) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("t", nextTab);

    navigate({
      pathname: "/settings",
      search: params.toString(),
    });
  }

  return (
    <Tabs
      value={activeTab}
      className="flex h-full min-h-0 flex-col md:flex-row"
      onValueChange={handleTabChange}
    >
      <aside className="shrink-0 border-b bg-background md:w-42 md:border-b-0 md:border-r">
        <TabsList className="flex h-auto w-full justify-start gap-px overflow-x-auto rounded-none bg-transparent px-2 md:flex-col">
          {allowedTabs.map((tab) => (
            <SettingsTab
              key={tab}
              value={tab}
              icon={TAB_META[tab].icon}
              label={TAB_META[tab].label}
              requiredPermissions={TAB_PERMISSIONS[tab]}
            />
          ))}
        </TabsList>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        {allowedTabs.map((tab) => TAB_META[tab].content)}
      </main>
    </Tabs>
  );
};

const SettingsTab = ({
  value,
  icon,
  label,
  requiredPermissions = [],
}: {
  value: SettingsTabValue;
  icon: AppIconName;
  label: string;
  requiredPermissions?: string[];
}) => {
  return (
    <PermissionsWrapper requiredPermissions={requiredPermissions}>
      <TabsTrigger
        value={value}
        className="w-full justify-start gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-[12px] data-[state=active]:bg-muted"
      >
        <AppIcon name={icon} size={12} />
        {label}
      </TabsTrigger>
    </PermissionsWrapper>
  );
};

export const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="bg-background">
      <div className="p-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
};
