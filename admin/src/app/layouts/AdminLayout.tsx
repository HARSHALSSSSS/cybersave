import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Sidebar } from '@/components/navigation/sidebar';
import { TopHeader } from '@/components/navigation/top-header';

function getHeaderConfig(pathname: string) {
  if (pathname.startsWith('/operators')) {
    return {
      searchPlaceholder: 'Search operators by name, ID, department...',
      actionLabel: 'Add New Operator',
      onAction: () => toast.info('Add operator flow coming soon'),
    };
  }
  if (pathname.startsWith('/notifications')) {
    return {
      searchPlaceholder: 'Search notifications by keyword, action...',
      actionLabel: 'Mark All as Read',
      onAction: () => toast.success('All notifications marked as read'),
    };
  }
  if (pathname.startsWith('/support-tickets')) {
    return {
      searchPlaceholder: 'Search tickets by ID, subject, assignee...',
      actionLabel: 'Create New Ticket',
      onAction: () => toast.info('Create ticket flow coming soon'),
    };
  }
  if (pathname.startsWith('/analytics')) {
    return {
      searchPlaceholder: 'Search reports, users, metrics...',
      actionLabel: 'Upload New Document',
      onAction: () => toast.info('Document upload coming soon'),
    };
  }
  if (pathname.startsWith('/audit-logs')) {
    return {
      searchPlaceholder: 'Search audit logs by user, action, ip...',
      actionLabel: undefined,
      onAction: undefined,
    };
  }
  if (pathname.startsWith('/settings')) {
    return {
      searchPlaceholder: 'Search settings, options, help guides...',
      actionLabel: 'Upload New Document',
      onAction: () => toast.info('Document upload coming soon'),
    };
  }
  if (pathname.startsWith('/users')) {
    return {
      searchPlaceholder: 'Search citizens by name, Aadhaar, mobile...',
      actionLabel: 'Quick Actions',
      onAction: undefined,
    };
  }
  if (pathname.startsWith('/applications')) {
    return {
      searchPlaceholder: 'Search applications by ID, citizen, service...',
      actionLabel: 'Quick Actions',
      onAction: undefined,
    };
  }
  if (pathname.startsWith('/services')) {
    return {
      searchPlaceholder: 'Search services by name, ID, category...',
      actionLabel: 'Quick Actions',
      onAction: undefined,
    };
  }
  return {
    searchPlaceholder: 'Search applications, citizens, operators...',
    actionLabel: 'Quick Actions',
    onAction: undefined,
  };
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const header = useMemo(() => getHeaderConfig(location.pathname), [location.pathname]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader
          searchPlaceholder={header.searchPlaceholder}
          notificationCount={12}
          onNotificationsClick={() => navigate('/notifications')}
          onQuickActionsClick={header.onAction}
          quickActionsLabel={header.actionLabel}
          user={{
            name: 'Rajesh Kumar',
            role: 'Super Admin',
            avatarUrl:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
          }}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-10 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
