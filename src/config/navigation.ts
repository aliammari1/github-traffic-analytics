export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  category: 'analytics' | 'insights' | 'tools' | 'community' | 'advanced';
}

export interface PageConfig {
  title: string;
  description: string;
  component: React.ComponentType;
  gradient: string;
  features: string[];
}

export const CATEGORY_COLORS = {
  analytics: 'from-blue-500 to-cyan-500',
  insights: 'from-purple-500 to-pink-500',
  tools: 'from-green-500 to-emerald-500',
  community: 'from-orange-500 to-yellow-500',
  advanced: 'from-red-500 to-pink-500'
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Analytics Core
  {
    name: "Dashboard",
    href: "/",
    icon: "📊",
    description: "Vue d'ensemble complète de vos analyses GitHub",
    category: 'analytics'
  },
  {
    name: "Traffic Analytics",
    href: "/traffic",
    icon: "📈",
    description: "Analyse détaillée du trafic de vos dépôts",
    category: 'analytics'
  },
  {
    name: "Repository Insights",
    href: "/repositories",
    icon: "📁",
    description: "Aperçu détaillé de vos dépôts GitHub",
    category: 'analytics'
  },
  {
    name: "Contribution Timeline",
    href: "/contributions",
    icon: "🎯",
    description: "Chronologie interactive de vos contributions",
    category: 'analytics'
  },
  
  // Advanced Insights
  {
    name: "Code Quality Matrix",
    href: "/code-quality",
    icon: "⚡",
    description: "Analyse de la qualité du code avec métriques avancées",
    category: 'insights'
  },
  {
    name: "Productivity Metrics",
    href: "/productivity",
    icon: "🚀",
    description: "Métriques de productivité et suggestions d'amélioration",
    category: 'insights'
  },
  {
    name: "Collaboration Network",
    href: "/collaboration",
    icon: "🌐",
    description: "Visualisation 3D de vos réseaux de collaboration",
    category: 'insights'
  },
  {
    name: "Trend Predictions",
    href: "/trends",
    icon: "🔮",
    description: "Prédictions IA sur les tendances de vos projets",
    category: 'insights'
  },
  
  // Development Tools
  {
    name: "Security Scanner",
    href: "/security",
    icon: "🛡️",
    description: "Analyse de sécurité approfondie de vos dépôts",
    category: 'tools'
  },
  {
    name: "Performance Monitor",
    href: "/performance",
    icon: "⚡",
    description: "Surveillance des performances en temps réel",
    category: 'tools'
  },
  {
    name: "Dependency Tracker",
    href: "/dependencies",
    icon: "🔗",
    description: "Suivi intelligent des dépendances",
    category: 'tools'
  },
  {
    name: "Release Planner",
    href: "/releases",
    icon: "🎯",
    description: "Planification et gestion des versions",
    category: 'tools'
  },
  
  // Community & Social
  {
    name: "Community Impact",
    href: "/community",
    icon: "👥",
    description: "Impact de vos projets sur la communauté",
    category: 'community'
  },
  {
    name: "Social Analytics",
    href: "/social",
    icon: "💬",
    description: "Analyse des interactions sociales GitHub",
    category: 'community'
  },
  {
    name: "Mentoring Hub",
    href: "/mentoring",
    icon: "🎓",
    description: "Tableau de bord pour le mentorat open source",
    category: 'community'
  },
  {
    name: "Event Timeline",
    href: "/events",
    icon: "📅",
    description: "Chronologie des événements GitHub",
    category: 'community'
  },
  
  // Advanced Features
  {
    name: "AI Code Review",
    href: "/ai-review",
    icon: "🤖",
    description: "Révision de code assistée par IA",
    category: 'advanced'
  },
  {
    name: "3D Code Explorer",
    href: "/3d-explorer",
    icon: "🌍",
    description: "Exploration 3D de l'architecture du code",
    category: 'advanced'
  },
  {
    name: "Data Playground",
    href: "/playground",
    icon: "🎮",
    description: "Bac à sable pour l'analyse de données GitHub",
    category: 'advanced'
  },
  {
    name: "Custom Reports",
    href: "/reports",
    icon: "📋",
    description: "Générateur de rapports personnalisés",
    category: 'advanced'
  }
];

export const PAGE_CONFIGS: Record<string, PageConfig> = {
  dashboard: {
    title: "Tableau de Bord Principal",
    description: "Vue d'ensemble de votre activité GitHub",
    component: null as unknown as React.ComponentType,
    gradient: "from-blue-600 via-purple-600 to-cyan-600",
    features: ["Métriques en temps réel", "Analyses prédictives", "Visualisations interactives"]
  },
  traffic: {
    title: "Analyse du Trafic",
    description: "Statistiques détaillées du trafic de vos dépôts",
    component: null as unknown as React.ComponentType,
    gradient: "from-green-600 via-teal-600 to-blue-600",
    features: ["Vues et clones", "Géolocalisation", "Tendances temporelles"]
  },
  repositories: {
    title: "Aperçu des Dépôts",
    description: "Gestion et analyse de vos dépôts GitHub",
    component: null as unknown as React.ComponentType,
    gradient: "from-purple-600 via-pink-600 to-red-600",
    features: ["Métriques par dépôt", "Comparaisons", "Recommandations"]
  }
};
