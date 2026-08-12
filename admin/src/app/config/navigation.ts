/**
 * Primary sidebar navigation config. `icon` is a lucide-react icon *name*;
 * `Sidebar` resolves it to the actual component via `iconMap`.
 */

export type LucideIconName =
  | 'LayoutDashboard'
  | 'Users'
  | 'FileText'
  | 'Layers'
  | 'UserCog'
  | 'ArrowLeftRight'
  | 'Bell'
  | 'LifeBuoy'
  | 'BarChart3'
  | 'ScrollText'
  | 'Settings'
  | 'Receipt'
  | 'Image';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIconName;
  /** Match only the exact path (passed through to NavLink `end`). */
  end?: boolean;
  /** Optional badge count shown next to the label. */
  badgeCount?: number;
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', end: true },
  { path: '/users', label: 'User Management', icon: 'Users' },
  { path: '/applications', label: 'Applications', icon: 'FileText' },
  { path: '/services', label: 'Services', icon: 'Layers' },
  { path: '/home-banners', label: 'Home Banners', icon: 'Image' },
  { path: '/operators', label: 'Operators', icon: 'UserCog' },
  { path: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { path: '/bill-payments', label: 'Bill Payments', icon: 'Receipt' },
  { path: '/notifications', label: 'Notifications', icon: 'Bell', badgeCount: 12 },
  { path: '/support-tickets', label: 'Support Tickets', icon: 'LifeBuoy' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/audit-logs', label: 'Audit Logs', icon: 'ScrollText' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];
