export type NavChild = { label: string; to: string };
export type NavItem = { label: string; to: string; children?: NavChild[] };

export const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Who we are", to: "/who-we-are" },
  { label: "Home ownership opportunities", to: "/home-ownership-opportunities" },
  {
    label: "Products",
    to: "/homeready",
    children: [
      { label: "HomeReady™", to: "/homeready" },
      { label: "Co-Ownership", to: "/co-ownership" },
    ],
  },
  { label: "Knowledge Centre", to: "/knowledge" },
  { label: "Impact", to: "/impact" },
  { label: "Work with AXP", to: "/work-with-axp" },
];
