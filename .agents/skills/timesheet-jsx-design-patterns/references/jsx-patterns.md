# JSX Patterns

Use these patterns when building a timesheet app with the shared `@workspace/ui` package. Adapt names and data fields to the app, but keep the visual structure close to the Triage reference.

## Imports

Prefer subpath imports from the shared package:

```tsx
import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Textarea } from "@workspace/ui/components/textarea";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@workspace/ui/components/chart";
import { cn } from "@workspace/ui/lib/utils";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3, CheckCircle2, Clock3, FileText, Menu, Plus, Search, Settings, Timer, Users } from "lucide-react";
```

## App Shell

Use the same desktop sidebar and mobile sheet structure as the reference. Replace labels with timesheet app navigation.

```tsx
const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Timer, label: "Timesheets", path: "/timesheets" },
  { icon: Plus, label: "New Entry", path: "/timesheets/new" },
  { icon: CheckCircle2, label: "Approvals", path: "/approvals" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 w-52">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex md:hidden items-center justify-between h-11 border-b border-border bg-background px-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-52 bg-sidebar">
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-foreground">Timesheet</span>
          </div>
          <div className="w-7" />
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <>
      <div className="flex items-center gap-2 px-3 h-11 border-b border-sidebar-border">
        <Clock3 className="h-4 w-4" />
        <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-sidebar-accent-foreground">
          Timesheet
        </span>
      </div>

      <nav className="flex-1 py-1.5 px-1.5 space-y-px">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[9px] leading-none">
              U
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] text-sidebar-foreground truncate flex-1">User</span>
        </div>
      </div>
    </>
  );
}
```

## Page Header

Use this as the first row inside `AppLayout`:

```tsx
<div className="flex items-center justify-between px-4 md:px-6 h-11 border-b border-border shrink-0">
  <h1 className="text-[13px] font-medium">Timesheets</h1>
  <Button asChild size="sm" className="h-7 text-[12px] gap-1.5">
    <Link to="/timesheets/new">
      <Plus className="h-3.5 w-3.5" />
      New entry
    </Link>
  </Button>
</div>
```

## Metrics Row

Use one border grid, not separate floating cards.

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-md overflow-hidden">
  {[
    { label: "This week", value: "38.5h" },
    { label: "Billable", value: "31.0h" },
    { label: "Pending approval", value: "4" },
    { label: "Utilization", value: "82%" },
  ].map((stat) => (
    <div key={stat.label} className="bg-background p-4">
      <p className="text-[12px] text-muted-foreground">{stat.label}</p>
      <p className="text-2xl font-medium mt-1">{stat.value}</p>
    </div>
  ))}
</div>
```

## Filter Bar

Keep filters compact and borderless in list pages.

```tsx
<div className="flex items-center gap-2 px-4 md:px-6 h-10 border-b border-border shrink-0">
  <div className="relative flex-1 max-w-sm">
    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    <Input
      placeholder="Search entries..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      className="pl-8 h-7 text-[13px] bg-transparent border-none shadow-none focus-visible:ring-0"
    />
  </div>

  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[124px] h-7 text-[12px] border-none bg-transparent">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All statuses</SelectItem>
      <SelectItem value="draft">Draft</SelectItem>
      <SelectItem value="submitted">Submitted</SelectItem>
      <SelectItem value="approved">Approved</SelectItem>
      <SelectItem value="rejected">Rejected</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Status And Billable Badges

Use dots for workflow status and compact badges for billing state.

```tsx
const statusClassName: Record<string, string> = {
  draft: "bg-muted-foreground",
  submitted: "bg-info",
  approved: "bg-success",
  rejected: "bg-destructive",
  locked: "bg-warning",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  locked: "Locked",
};

export function TimesheetStatus({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <span className={cn("h-2 w-2 rounded-full shrink-0", statusClassName[status])} />
      {statusLabel[status] ?? status}
    </span>
  );
}

export function BillableBadge({ billable }: { billable: boolean }) {
  return (
    <Badge variant={billable ? "outline" : "secondary"} className="h-5 px-1.5 text-[10px]">
      {billable ? "Billable" : "Internal"}
    </Badge>
  );
}
```

## Timesheet Table

Use a sticky header for full-page lists and make rows clickable.

```tsx
<div className="flex-1 overflow-auto">
  <table className="w-full text-[13px]">
    <thead className="sticky top-0 bg-background z-10">
      <tr className="border-b border-border">
        <th className="text-left font-medium text-muted-foreground px-4 md:px-6 py-2">Week</th>
        <th className="text-left font-medium text-muted-foreground px-3 py-2">Person</th>
        <th className="text-left font-medium text-muted-foreground px-3 py-2">Project</th>
        <th className="text-left font-medium text-muted-foreground px-3 py-2">Hours</th>
        <th className="text-left font-medium text-muted-foreground px-3 py-2">Status</th>
        <th className="text-left font-medium text-muted-foreground px-3 py-2">Updated</th>
      </tr>
    </thead>
    <tbody>
      {entries.length === 0 ? (
        <tr>
          <td colSpan={6} className="text-center py-12 text-muted-foreground text-[13px]">
            No timesheets found
          </td>
        </tr>
      ) : (
        entries.map((entry) => (
          <tr
            key={entry.id}
            className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => navigate(`/timesheets/${entry.id}`)}
          >
            <td className="px-4 md:px-6 py-2 font-mono text-[12px] text-muted-foreground">{entry.weekLabel}</td>
            <td className="px-3 py-2 font-medium">{entry.personName}</td>
            <td className="px-3 py-2">{entry.projectName}</td>
            <td className="px-3 py-2 font-medium">{entry.totalHours}h</td>
            <td className="px-3 py-2">
              <TimesheetStatus status={entry.status} />
            </td>
            <td className="px-3 py-2 text-[12px] text-muted-foreground whitespace-nowrap">{entry.updatedAtLabel}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
```

## Weekly Entry Form

Use border-divided rows. Keep the form attached to the page instead of placing it in a large card.

```tsx
<form onSubmit={handleSubmit} className="max-w-3xl">
  <div className="px-4 md:px-6 py-4 border-b border-border space-y-1">
    <Label className="text-[12px] text-muted-foreground">Week</Label>
    <Select value={weekId} onValueChange={setWeekId}>
      <SelectTrigger className="h-8 text-[13px] border-none shadow-none px-0">
        <SelectValue placeholder="Select week" />
      </SelectTrigger>
      <SelectContent>
        {weeks.map((week) => (
          <SelectItem key={week.id} value={week.id}>{week.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2">
    <div className="px-4 md:px-6 py-4 border-b border-border md:border-r space-y-1">
      <Label className="text-[12px] text-muted-foreground">Project</Label>
      <Select value={projectId} onValueChange={setProjectId}>
        <SelectTrigger className="h-8 text-[13px] border-none shadow-none px-0">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="px-4 md:px-6 py-4 border-b border-border space-y-1">
      <Label className="text-[12px] text-muted-foreground">Task</Label>
      <Input
        value={task}
        onChange={(event) => setTask(event.target.value)}
        placeholder="Implementation, review, support..."
        className="h-8 text-[13px] border-none shadow-none px-0 focus-visible:ring-0"
      />
    </div>
  </div>

  <div className="px-4 md:px-6 py-4 border-b border-border">
    <p className="text-[12px] text-muted-foreground font-medium mb-3">Daily hours</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
      {days.map((day) => (
        <div key={day.key} className="bg-background p-3 space-y-2">
          <div>
            <p className="text-[12px] font-medium">{day.label}</p>
            <p className="text-[11px] text-muted-foreground">{day.dateLabel}</p>
          </div>
          <Input
            inputMode="decimal"
            value={hours[day.key] ?? ""}
            onChange={(event) => updateHours(day.key, event.target.value)}
            className="h-8 text-[13px]"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  </div>

  <div className="px-4 md:px-6 py-4 border-b border-border space-y-1">
    <Label className="text-[12px] text-muted-foreground">Notes</Label>
    <Textarea
      value={notes}
      onChange={(event) => setNotes(event.target.value)}
      placeholder="What did you work on?"
      className="text-[13px] border-none shadow-none px-0 focus-visible:ring-0 resize-none min-h-[72px]"
    />
  </div>

  <div className="px-4 md:px-6 py-4 flex gap-2">
    <Button type="button" variant="ghost" size="sm" className="h-8 text-[13px]">
      Save draft
    </Button>
    <Button type="submit" size="sm" className="h-8 text-[13px]">
      Submit timesheet
    </Button>
  </div>
</form>
```

## Settings Or Approvals Tabs

Use side tabs on desktop and horizontal tabs on mobile, matching the reference settings page.

```tsx
<Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full">
  <div className="md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-border">
    <TabsList className="flex md:flex-col items-stretch w-full bg-transparent h-auto p-1.5 gap-px">
      <TabsTrigger value="profile" className="justify-start gap-1.5 text-[12px] h-7 px-2 data-[state=active]:bg-muted w-full">
        <Users className="h-3.5 w-3.5" />
        Team
      </TabsTrigger>
      <TabsTrigger value="approvals" className="justify-start gap-1.5 text-[12px] h-7 px-2 data-[state=active]:bg-muted w-full">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approvals
      </TabsTrigger>
      <TabsTrigger value="general" className="justify-start gap-1.5 text-[12px] h-7 px-2 data-[state=active]:bg-muted w-full">
        <Settings className="h-3.5 w-3.5" />
        General
      </TabsTrigger>
    </TabsList>
  </div>

  <div className="flex-1 min-w-0">
    <TabsContent value="profile" className="m-0">
      <TeamSettings />
    </TabsContent>
    <TabsContent value="approvals" className="m-0">
      <ApprovalRules />
    </TabsContent>
    <TabsContent value="general" className="m-0">
      <GeneralSettings />
    </TabsContent>
  </div>
</Tabs>
```

## Compact Settings Sections

Use this row style for settings, preferences, and approval rules:

```tsx
<div className="divide-y divide-border">
  <div className="px-4 md:px-6 py-4">
    <p className="text-[12px] text-muted-foreground font-medium mb-3">Approval workflow</p>
    <div className="space-y-1">
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted/30">
          <div>
            <p className="text-[13px] font-medium">{rule.name}</p>
            <p className="text-[12px] text-muted-foreground">{rule.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-[12px]">Edit</Button>
        </div>
      ))}
    </div>
  </div>
</div>
```

## Analytics Panels

Use the package chart wrappers and a border grid when charts are available.

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border rounded-md overflow-hidden">
  <div className="bg-background p-4">
    <p className="text-[13px] font-medium mb-1">Hours by project</p>
    <p className="text-[12px] text-muted-foreground mb-4">Billable hours across active projects</p>
    <ChartContainer config={projectChartConfig} className="h-[220px] w-full">
      <BarChart data={projectData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="project" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={0} />
      </BarChart>
    </ChartContainer>
  </div>
</div>
```

## Avoid

- Do not make page sections look like marketing cards.
- Do not use large hero titles inside the application shell.
- Do not hardcode raw colors when semantic token classes exist.
- Do not make dense forms wider than the content needs; use `max-w-2xl` or `max-w-3xl`.
- Do not let long project names, notes, or user names push table columns out of view; use `truncate`, `whitespace-nowrap`, or horizontal overflow where needed.
