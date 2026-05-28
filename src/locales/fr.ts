export default {
  nav: {
    home: "Accueil",
    sources: "Sources",
    pipelines: "Pipelines",
    dataModels: "Modèles de données",
    visualizations: "Visualisations",
    dashboards: "Tableaux de bord",
    schedules: "Planifications",
    jobs: "Tâches",
    exports: "Exports",
    sharedWithMe: "Partagé avec moi",
    settings: "Paramètres",
  },
  section: {
    data: "Données",
    automation: "Automatisation",
    library: "Bibliothèque",
    settings: "Paramètres",
  },
  workspace: {
    title: "Mon espace de travail",
    plan: "Plan Pro",
  },
  window: {
    minimize: "Réduire",
    maximize: "Agrandir",
    close: "Fermer",
  },
  tabs: {
    close: "Fermer l'onglet",
    closeLeft: "Fermer les onglets à gauche",
    closeRight: "Fermer les onglets à droite",
  },
  sources: {
    subtitle: "Gérez vos connexions de données",
    new: "Nouvelle source",
    loading: "Chargement…",
    empty: "Aucune source. Ajoutez votre première connexion.",
  },
  shortcuts: {
    commandPalette: "Palette de commandes",
    closeTab: "Fermer l'onglet",
    newTab: "Nouvel onglet",
    openSettings: "Paramètres",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Gérez vos préférences",
    language: {
      sectionTitle: "Langue",
      label: "Langue de l'interface",
      description: "Choisissez la langue d'affichage",
    },
    appearance: {
      sectionTitle: "Apparence",
      mode: {
        label: "Mode de couleur",
        description: "Clair, sombre ou selon la préférence système",
      },
      lightTheme: {
        label: "Thème clair",
        description: "Thème utilisé en mode clair",
      },
      darkTheme: {
        label: "Thème sombre",
        description: "Thème utilisé en mode sombre",
      },
    },
  },
} as const;
