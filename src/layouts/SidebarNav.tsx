import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ParseKeys } from "i18next";
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
  labelKey: ParseKeys;
}

interface NavSection {
  titleKey?: ParseKeys;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    items: [{ id: "home", icon: Home, labelKey: "nav.home" }],
  },
  {
    titleKey: "section.data",
    items: [
      { id: "sources", icon: Database, labelKey: "nav.sources" },
      { id: "pipelines", icon: Workflow, labelKey: "nav.pipelines" },
      { id: "data-models", icon: Layers, labelKey: "nav.dataModels" },
      { id: "visualizations", icon: BarChart3, labelKey: "nav.visualizations" },
      { id: "dashboards", icon: LayoutDashboard, labelKey: "nav.dashboards" },
    ],
  },
  {
    titleKey: "section.automation",
    items: [
      { id: "schedules", icon: CalendarClock, labelKey: "nav.schedules" },
      { id: "jobs", icon: Cpu, labelKey: "nav.jobs" },
    ],
  },
  {
    titleKey: "section.library",
    items: [
      { id: "exports", icon: Download, labelKey: "nav.exports" },
      { id: "shared", icon: Users, labelKey: "nav.sharedWithMe" },
    ],
  },
  {
    titleKey: "section.settings",
    items: [{ id: "settings", icon: Settings, labelKey: "nav.settings" }],
  },
];

export function SidebarNav() {
  const [activeId, setActiveId] = useState("home");
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5 p-2 overflow-y-auto flex-1">
        {navigation.map((section, i) => (
          <div key={i}>
            {section.titleKey && <MenuTitle label={t(section.titleKey)} />}
            {section.items.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={t(item.labelKey)}
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
