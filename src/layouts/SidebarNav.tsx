import { useState } from "react";
import {
  Home,
  Database,
  Workflow,
  Layers,
  BarChart3,
  LayoutDashboard,
  CalendarClock,
  Cpu,
  Download,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { MenuItem } from "@/components/MenuItem";
import { MenuTitle } from "@/components/MenuTitle";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    items: [{ id: "home", icon: Home, label: "Home" }],
  },
  {
    title: "Data",
    items: [
      { id: "sources", icon: Database, label: "Sources" },
      { id: "pipelines", icon: Workflow, label: "Pipelines" },
      { id: "data-models", icon: Layers, label: "Data Models" },
      { id: "visualizations", icon: BarChart3, label: "Visualizations" },
      { id: "dashboards", icon: LayoutDashboard, label: "Dashboards" },
    ],
  },
  {
    title: "Automation",
    items: [
      { id: "schedules", icon: CalendarClock, label: "Schedules" },
      { id: "jobs", icon: Cpu, label: "Jobs" },
    ],
  },
  {
    title: "Library",
    items: [
      { id: "exports", icon: Download, label: "Exports" },
      { id: "shared", icon: Users, label: "Shared with me" },
    ],
  },
  {
    title: "Settings",
    items: [{ id: "settings", icon: Settings, label: "Settings" }],
  },
];

export function SidebarNav() {
  const [activeId, setActiveId] = useState("home");

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5 p-2 overflow-y-auto flex-1">
        {navigation.map((section, i) => (
          <div key={i}>
            {section.title && <MenuTitle label={section.title} />}
            {section.items.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeId === item.id}
                onClick={() => setActiveId(item.id)}
              />
            ))}
          </div>
        ))}
      </nav>
      <WorkspaceSwitcher />
    </div>
  );
}
