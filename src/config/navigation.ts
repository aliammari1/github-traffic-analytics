export interface NavigationItem {
  name: string;
  href: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Explore",
    href: "/",
    description: "Public repository analysis and growth intelligence",
  },
  {
    name: "Compare",
    href: "/compare",
    description: "Side-by-side star growth and momentum comparison",
  },
  {
    name: "Repositories",
    href: "/repositories",
    description: "View and manage your tracked GitHub repositories",
  },
];
