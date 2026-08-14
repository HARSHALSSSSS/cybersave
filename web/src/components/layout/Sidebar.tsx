import { NavLink } from 'react-router';
import {
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Layers,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLockup } from '@/components/brand/BrandLockup';
import { env } from '@/app/config/env';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/services', label: 'Services', icon: Layers },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
      <div className="px-5 py-5">
        <BrandLockup size={120} />
        <p className="sr-only">{env.appName}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#4B5563] hover:bg-gray-50 hover:text-[#0A1629]',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#E5E7EB] px-5 py-4">
        <p className="text-xs text-[#6B7280]">🇮🇳 Govt. of India Certified</p>
      </div>
    </aside>
  );
}
