// Static navigation config for the app sidebar.
// Order here is the order rendered in AppSidebar.

export interface NavItem {
  label: string; // UI label (Italian)
  icon: string; // PrimeVue icon class (e.g. "pi pi-home")
  to: string; // route path
}

export const navigation: NavItem[] = [
  { label: "Dashboard", icon: "pi pi-home", to: "/" },
  { label: "Allievi", icon: "pi pi-users", to: "/students" },
];
