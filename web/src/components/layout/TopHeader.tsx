import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, LogOut, Phone, Search } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getProfileDisplayName } from '@/lib/profile';

export function TopHeader({
  searchPlaceholder = 'Search services, schemes, documents...',
}: {
  searchPlaceholder?: string;
}) {
  const navigate = useNavigate();
  const citizen = useAuthStore(s => s.citizen);
  const logout = useAuthStore(s => s.logout);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/services?q=${encodeURIComponent(q)}` : '/services');
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#E5E7EB] bg-white px-6">
      <form onSubmit={handleSearch} className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-9 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </form>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-2 text-sm text-[#4B5563] md:flex">
          <Phone className="h-4 w-4 text-[#2563EB]" />
          Helpdesk: 1800-111-255
        </div>
        <button
          type="button"
          className="relative rounded-full p-2 text-[#6B7280] hover:bg-gray-100"
          title="Notifications coming soon"
          onClick={() => navigate('/applications')}
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-gray-50"
            onClick={() => setMenuOpen(v => !v)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-semibold text-[#2563EB]">
              {getProfileDisplayName(citizen).slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-[#0A1629]">{getProfileDisplayName(citizen)}</p>
              <p className="text-xs text-[#6B7280]">India</p>
            </div>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0A1629] hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
              >
                Profile Settings
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
