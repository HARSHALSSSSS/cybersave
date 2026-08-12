import * as React from 'react';
import { Bell, Globe, Search, Sparkles, Sun } from 'lucide-react';

import { useUiStore } from '@/app/store/ui-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TopHeaderUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface TopHeaderProps extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onQuickActionsClick?: () => void;
  /** Label for the primary header action. Hide the button when undefined. */
  quickActionsLabel?: string;
  user?: TopHeaderUser;
}

export function TopHeader({
  searchPlaceholder = 'Search...',
  onSearchChange,
  notificationCount = 0,
  onNotificationsClick,
  onQuickActionsClick,
  quickActionsLabel = 'Quick Actions',
  user,
  className,
  ...props
}: TopHeaderProps) {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  return (
    <TooltipProvider>
      <header
        data-slot="top-header"
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-6',
          className,
        )}
        {...props}
      >
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Globe className="size-4" />
            EN
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="text-muted-foreground"
              >
                <Sun className="size-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === 'light' ? 'Switch to dark' : 'Switch to light'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={onNotificationsClick}
                className="relative text-muted-foreground"
              >
                <Bell className="size-[18px]" />
                {notificationCount > 0 && (
                  <Badge
                    variant="danger"
                    className="absolute -top-1 -right-1 h-4.5 min-w-4.5 justify-center border-0 px-1 text-[10px] font-semibold"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {quickActionsLabel ? (
            <Button size="sm" className="ml-1 gap-1.5" onClick={onQuickActionsClick}>
              <Sparkles className="size-4" />
              {quickActionsLabel}
            </Button>
          ) : null}

          {user && (
            <>
              <Separator orientation="vertical" className="mx-1.5 h-7" />
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors duration-150 hover:bg-muted"
              >
                <Avatar className="size-8">
                  {/* Keep the avatar without showing the full name/image */}
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
              </button>
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
