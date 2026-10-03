export interface NavigationItem {
  name: string;
  href: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Analyze",
    href: "/",
    description: "Public repository analysis and growth intelligence",
  },
  {
    name: "Overview",
    href: "/traffic",
    description: "Portfolio traffic overview across your tracked repositories",
  },
  {
    name: "Repositories",
    href: "/repositories",
    description: "View and manage your GitHub repositories",
  },
];
