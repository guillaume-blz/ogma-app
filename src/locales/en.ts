export default {
  nav: {
    home: "Home",
    sources: "Sources",
    pipelines: "Pipelines",
    dataModels: "Data Models",
    visualizations: "Visualizations",
    dashboards: "Dashboards",
    schedules: "Schedules",
    jobs: "Jobs",
    exports: "Exports",
    sharedWithMe: "Shared with me",
    settings: "Settings",
  },
  section: {
    data: "Data",
    automation: "Automation",
    library: "Library",
    settings: "Settings",
  },
  workspace: {
    title: "My workspace",
    plan: "Pro Plan",
  },
  window: {
    minimize: "Minimize",
    maximize: "Maximize",
    close: "Close",
  },
  tabs: {
    close: "Close tab",
    closeLeft: "Close tabs to the left",
    closeRight: "Close tabs to the right",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences",
    language: {
      sectionTitle: "Language",
      label: "Interface language",
      description: "Choose the display language",
    },
    appearance: {
      sectionTitle: "Appearance",
      mode: {
        label: "Color mode",
        description: "Light, dark, or follow system preference",
      },
      lightTheme: {
        label: "Light theme",
        description: "Theme used in light mode",
      },
      darkTheme: {
        label: "Dark theme",
        description: "Theme used in dark mode",
      },
    },
  },
} as const;
