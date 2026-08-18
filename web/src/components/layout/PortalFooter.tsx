import { Link } from 'react-router';
import { BrandMark } from '@/components/brand/BrandMark';
import { BRAND_TAGLINE } from '@/components/brand/brand-assets';

const FOOTER_COLUMNS = [
  {
    title: 'Services',
    links: [
      { label: 'Aadhaar Update', to: '/services?q=aadhaar' },
      { label: 'PAN Registration', to: '/services?q=pan' },
      { label: 'Certificates', to: '/services/category/certificates' },
      { label: 'PM Insurance Plans', to: '/schemes' },
    ],
  },
  {
    title: 'Applications',
    links: [
      { label: 'Track Status', to: '/applications' },
      { label: 'Browse Services', to: '/services' },
      { label: 'Fee Structure', to: '/services' },
      { label: 'State Grievance Link', to: '/help' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Centre', to: '/help' },
      { label: 'Raise a Ticket', to: '/help/tickets' },
      { label: 'Find Centre', to: '/help' },
      { label: 'Notifications', to: '/notifications' },
    ],
  },
  {
    title: 'Payments',
    links: [
      { label: 'Pay Bills (BBPS)', to: '/pay-bills' },
      { label: 'Settlement Portal', to: '/wallet' },
      { label: 'Grievance Refunds', to: '/help' },
      { label: 'G2C Direct Transfer', to: '/wallet' },
    ],
  },
] as const;

export function PortalFooter() {
  return (
    <footer className="mt-auto bg-[#0A1629] text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <BrandMark size="lg" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#94A3B8]">
              Simplifying citizen access to government services through a secure, unified digital
              platform built for India.
            </p>
            <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">
              {BRAND_TAGLINE}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#BFDBFE]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Digital India Ready
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_COLUMNS.map(col => (
              <div key={col.title}>
                <h3 className="text-xs font-bold tracking-[0.16em] text-[#60A5FA] uppercase">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-[#94A3B8] transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} Cybersave Digital India Platform. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#64748B]">
            <Link to="/help" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/help" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link to="/help" className="transition hover:text-white">
              Information Security Directive
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
