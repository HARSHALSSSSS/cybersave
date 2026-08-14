import { NavLink } from 'react-router';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Receipt,
  Image,
  Globe,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { navItems } from '@/app/config/navigation';
import type { LucideIconName, NavItem } from '@/app/config/navigation';
import { useUiStore } from '@/app/store/ui-store';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const iconMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileText,
  Layers,
  UserCog,
  ArrowLeftRight,
  Bell,
  LifeBuoy,
  BarChart3,
  ScrollText,
  Settings,
  Receipt,
  Image,
  Globe,
};

export interface SidebarProps {
  /** Controlled collapsed state. Falls back to the shared UI store if omitted. */
  collapsed?: boolean;
  /** Called whenever a nav item is activated, with the destination path. */
  onNavigate?: (path: string) => void;
  /** Called when the collapse toggle is pressed. Falls back to the UI store if omitted. */
  onToggleCollapse?: () => void;
  className?: string;
}

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-5', collapsed && 'justify-center px-2')}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <ShieldCheck className="size-4.5" />
      </div>
      {!collapsed && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Cybersave
        </span>
      )}
    </div>
  );
}

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: (path: string) => void;
}) {
  const Icon = iconMap[item.icon];

  const link = (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={() => onNavigate?.(item.path)}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150',
          'hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-0 py-2.5',
          isActive &&
            'bg-sidebar-active-bg text-sidebar-active-text hover:bg-sidebar-active-bg hover:text-sidebar-active-text',
          isActive &&
            (collapsed
              ? 'border-r-2 border-sidebar-active-border'
              : 'border-l-2 border-sidebar-active-border pl-2.5'),
        )
      }
    >
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badgeCount ? (
        <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1 text-[11px]">
          {item.badgeCount}
        </Badge>
      ) : null}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ collapsed: collapsedProp, onNavigate, onToggleCollapse, className }: SidebarProps) {
  const storeCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const collapsed = collapsedProp ?? storeCollapsed;
  const handleToggle = onToggleCollapse ?? toggleSidebar;

  return (
    <TooltipProvider>
      <aside
        data-slot="sidebar"
        className={cn(
          'flex h-full flex-col border-r border-sidebar-border bg-sidebar-bg transition-[width] duration-200 ease-out',
          collapsed ? 'w-[76px]' : 'w-[260px]',
          className,
        )}
      >
        <SidebarLogo collapsed={collapsed} />

        <nav className={cn('flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2', collapsed && 'px-2.5')}>
          {navItems.map((item) => (
            <NavItemLink key={item.path} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className={cn('border-t border-sidebar-border p-3', collapsed && 'px-2.5')}>
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <ChevronsRight className="size-[18px]" /> : <ChevronsLeft className="size-[18px]" />}
            {!collapsed && <span>Collapse Menu</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
