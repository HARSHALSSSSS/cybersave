import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  ChevronDown,
  Headphones,
  LogOut,
  MapPin,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { useRequireAuthNavigate } from '@/features/auth/hooks/useRequireAuth';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { getProfileDisplayName } from '@/lib/profile';
import { cn } from '@/lib/utils';

/** Matches Figma citizen dashboard nav */
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true, public: true },
  { to: '/services', label: 'Services', public: true },
  { to: '/applications', label: 'Applications' },
  { to: '/documents', label: 'Documents' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/schemes', label: 'Schemes', public: true },
] as const;

export function PortalNavbar() {
  const navigate = useNavigate();
  const citizen = useAuthStore(s => s.citizen);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const openLogin = useAuthModalStore(s => s.openLogin);
  const requireAuthNavigate = useRequireAuthNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const displayName = getProfileDisplayName(citizen);
  const firstName = displayName.split(' ')[0];
  const lastInitial = displayName.split(' ')[1]?.charAt(0);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  function handleProtectedNav(to: string) {
    requireAuthNavigate(to, { requireProfile: true });
    setMenuOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/services?q=${encodeURIComponent(q)}` : '/services');
    setSearchOpen(false);
    setQuery('');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8EDF5]/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center gap-5 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <BrandMark className="shrink-0" size="md" />

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV_LINKS.map(link =>
            'public' in link && link.public ? (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : false}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0A1629]',
                  )
                }
              >
                {link.label}
              </NavLink>
            ) : (
              <button
                key={link.to}
                type="button"
                onClick={() => handleProtectedNav(link.to)}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0A1629]"
              >
                {link.label}
              </button>
            ),
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-10 rounded-full border-[#BFDBFE] px-4 text-[13px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] lg:inline-flex"
            onClick={() => navigate('/help')}
          >
            <MapPin className="mr-1.5 h-4 w-4" />
            Find Centre
          </Button>

          <button
            type="button"
            className="rounded-lg p-2.5 text-[#64748B] transition hover:bg-[#F1F5F9]"
            aria-label="Search"
            onClick={() => setSearchOpen(v => !v)}
          >
            <Search className="h-5 w-5" />
          </button>

          {isAuthenticated ? <NotificationBell /> : null}

          <button
            type="button"
            className="hidden rounded-lg p-2.5 text-[#64748B] transition hover:bg-[#F1F5F9] sm:block"
            aria-label="Help"
            onClick={() => navigate('/help')}
          >
            <Headphones className="h-5 w-5" />
          </button>

          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-[#F8FAFC]"
                onClick={() => setProfileOpen(v => !v)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1A3B8B] text-sm font-semibold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-[15px] font-semibold text-[#0A1629] md:block">
                  {firstName}
                  {lastInitial ? ` ${lastInitial}.` : ''}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-[#94A3B8] md:block" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#E8EDF5] bg-white py-1 shadow-xl">
                  <button
                    type="button"
                    className="flex w-full px-4 py-2.5 text-left text-sm text-[#0A1629] hover:bg-[#F8FAFC]"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                  >
                    Profile Settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Button
              size="sm"
              className="hidden h-10 rounded-full px-5 sm:inline-flex"
              onClick={() => openLogin({ requireProfile: true })}
            >
              Login
            </Button>
          )}

          <button
            type="button"
            className="rounded-lg p-2.5 text-[#64748B] lg:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[#E8EDF5] bg-white px-4 py-3 sm:px-6">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl gap-2">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for services e.g., Aadhaar, PAN Card, Birth Certificate…"
              className="h-11 flex-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#2563EB]"
              autoFocus
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <nav className="border-t border-[#E8EDF5] bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(link =>
              'public' in link && link.public ? (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-[15px] font-medium',
                      isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B]',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ) : (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => handleProtectedNav(link.to)}
                  className="rounded-xl px-4 py-3 text-left text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  {link.label}
                </button>
              ),
            )}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openLogin({ requireProfile: true });
                }}
                className="rounded-xl bg-[#2563EB] px-4 py-3 text-[15px] font-semibold text-white"
              >
                Login
              </button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
