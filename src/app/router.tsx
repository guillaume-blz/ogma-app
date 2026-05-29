import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { SourcesPage } from "@/pages/SourcesPage";
import { PipelinesPage } from "@/pages/PipelinesPage";
import { DataModelsPage } from "@/pages/DataModelsPage";
import { VisualizationsPage } from "@/pages/VisualizationsPage";
import { DashboardsPage } from "@/pages/DashboardsPage";
import { SchedulesPage } from "@/pages/SchedulesPage";
import { JobsPage } from "@/pages/JobsPage";
import { ExportsPage } from "@/pages/ExportsPage";
import { SharedPage } from "@/pages/SharedPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SourceDetailPage } from "@/pages/SourceDetailPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true,              element: <HomePage />         },
      { path: "sources",          element: <SourcesPage />      },
      { path: "sources/:id",      element: <SourceDetailPage /> },
      { path: "pipelines",        element: <PipelinesPage />    },
      { path: "data-models",      element: <DataModelsPage />   },
      { path: "visualizations",   element: <VisualizationsPage /> },
      { path: "dashboards",       element: <DashboardsPage />   },
      { path: "schedules",        element: <SchedulesPage />    },
      { path: "jobs",             element: <JobsPage />         },
      { path: "exports",          element: <ExportsPage />      },
      { path: "shared",           element: <SharedPage />       },
      { path: "settings",         element: <SettingsPage />     },
    ],
  },
]);
