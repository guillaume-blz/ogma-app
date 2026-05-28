import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";

export interface NavItem {
  id: string;
  icon: LucideIcon;
  labelKey: ParseKeys;
  path: string;
}

export interface NavSection {
  titleKey?: ParseKeys;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    items: [{ id: "home", icon: Home, labelKey: "nav.home", path: "/" }],
  },
  {
    titleKey: "section.data",
    items: [
      { id: "sources",        icon: Database,        labelKey: "nav.sources",        path: "/sources"        },
      { id: "pipelines",      icon: Workflow,         labelKey: "nav.pipelines",      path: "/pipelines"      },
      { id: "data-models",    icon: Layers,           labelKey: "nav.dataModels",     path: "/data-models"    },
      { id: "visualizations", icon: BarChart3,        labelKey: "nav.visualizations", path: "/visualizations" },
      { id: "dashboards",     icon: LayoutDashboard,  labelKey: "nav.dashboards",     path: "/dashboards"     },
    ],
  },
  {
    titleKey: "section.automation",
    items: [
      { id: "schedules", icon: CalendarClock, labelKey: "nav.schedules", path: "/schedules" },
      { id: "jobs",      icon: Cpu,           labelKey: "nav.jobs",      path: "/jobs"      },
    ],
  },
  {
    titleKey: "section.library",
    items: [
      { id: "exports", icon: Download, labelKey: "nav.exports",      path: "/exports" },
      { id: "shared",  icon: Users,    labelKey: "nav.sharedWithMe", path: "/shared"  },
    ],
  },
  {
    titleKey: "section.settings",
    items: [{ id: "settings", icon: Settings, labelKey: "nav.settings", path: "/settings" }],
  },
];

export const navItemsFlat: NavItem[] = navigation.flatMap((s) => s.items);
export const findNavItem = (id: string): NavItem | undefined =>
  navItemsFlat.find((item) => item.id === id);
