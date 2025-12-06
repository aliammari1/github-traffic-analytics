export interface NavigationItem {
  name: string;
  href: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    description: "Overview of your GitHub traffic analytics",
  },
  {
    name: "Traffic",
    href: "/traffic",
    description: "Detailed traffic analytics across your repositories",
  },
  {
    name: "Repositories",
    href: "/repositories",
    description: "View and manage your GitHub repositories",
  },
];
