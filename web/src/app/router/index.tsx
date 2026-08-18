import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PortalLayout } from '@/app/layouts/PortalLayout';
import { BrandMark } from '@/components/brand/BrandMark';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const OtpPage = lazy(() => import('@/features/auth/pages/OtpPage').then(m => ({ default: m.OtpPage })));
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('@/features/services/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const SchemesPage = lazy(() => import('@/features/services/pages/SchemesPage').then(m => ({ default: m.SchemesPage })));
const SchemeDetailPage = lazy(() => import('@/features/services/pages/SchemeDetailPage').then(m => ({ default: m.SchemeDetailPage })));
const CategoryServicesPage = lazy(() => import('@/features/services/pages/CategoryServicesPage').then(m => ({ default: m.CategoryServicesPage })));
const ServiceDetailPage = lazy(() => import('@/features/services/pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const StateSelectPage = lazy(() => import('@/features/services/pages/StateSelectPage').then(m => ({ default: m.StateSelectPage })));
const StateServicesPage = lazy(() => import('@/features/services/pages/StateServicesPage').then(m => ({ default: m.StateServicesPage })));
const ServiceApplyPage = lazy(() => import('@/features/apply/pages/ServiceApplyPage').then(m => ({ default: m.ServiceApplyPage })));
const ApplicationsPage = lazy(() => import('@/features/applications/pages/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })));
const ApplicationDetailPage = lazy(() => import('@/features/applications/pages/ApplicationDetailPage').then(m => ({ default: m.ApplicationDetailPage })));
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage').then(m => ({ default: m.WalletPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })),
);
const HelpPage = lazy(() => import('@/features/help/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const HelpTicketsPage = lazy(() =>
  import('@/features/help/pages/HelpTicketsPage').then(m => ({ default: m.HelpTicketsPage })),
);
const HelpTicketDetailPage = lazy(() =>
  import('@/features/help/pages/HelpTicketDetailPage').then(m => ({ default: m.HelpTicketDetailPage })),
);
const PayBillsHomePage = lazy(() => import('@/features/bill-payments/pages/PayBillsHomePage').then(m => ({ default: m.PayBillsHomePage })));
const PayBillsCategoryPage = lazy(() => import('@/features/bill-payments/pages/PayBillsCategoryPage').then(m => ({ default: m.PayBillsCategoryPage })));
const PayBillsBillerPage = lazy(() => import('@/features/bill-payments/pages/PayBillsBillerPage').then(m => ({ default: m.PayBillsBillerPage })));
const PayBillsBillPage = lazy(() => import('@/features/bill-payments/pages/PayBillsBillPage').then(m => ({ default: m.PayBillsBillPage })));
const PayBillsConfirmPage = lazy(() => import('@/features/bill-payments/pages/PayBillsConfirmPage').then(m => ({ default: m.PayBillsConfirmPage })));
const PayBillsResultPage = lazy(() => import('@/features/bill-payments/pages/PayBillsResultPage').then(m => ({ default: m.PayBillsResultPage })));
const PayBillsHistoryPage = lazy(() => import('@/features/bill-payments/pages/PayBillsHistoryPage').then(m => ({ default: m.PayBillsHistoryPage })));

function Page({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <BrandMark linked={false} />
          <p className="text-sm text-[#6B7280]">Loading…</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { index: true, element: <Page><HomePage /></Page> },
      { path: 'services', element: <Page><ServicesPage /></Page> },
      { path: 'services/state/:stateCode', element: <Page><StateServicesPage /></Page> },
      { path: 'services/category/:mainSlug', element: <Page><CategoryServicesPage /></Page> },
      { path: 'services/:mainSlug/:subSlug', element: <Page><ServiceDetailPage /></Page> },
      { path: 'services/:mainSlug/:subSlug/select-state', element: <Page><StateSelectPage /></Page> },
      { path: 'schemes', element: <Page><SchemesPage /></Page> },
      { path: 'schemes/:schemeId', element: <Page><SchemeDetailPage /></Page> },
      { path: 'pay-bills', element: <Page><PayBillsHomePage /></Page> },
      { path: 'pay-bills/category/:category', element: <Page><PayBillsCategoryPage /></Page> },
      { path: 'pay-bills/biller/:billerId', element: <Page><PayBillsBillerPage /></Page> },
      { path: 'help', element: <Page><HelpPage /></Page> },
      { path: 'login', element: <Page><LoginPage /></Page> },
      { path: 'otp', element: <Page><OtpPage /></Page> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'services/:mainSlug/:subSlug/apply', element: <Page><ServiceApplyPage /></Page> },
          { path: 'services/:mainSlug/:subSlug/apply/:applicationId', element: <Page><ServiceApplyPage /></Page> },
          { path: 'applications', element: <Page><ApplicationsPage /></Page> },
          { path: 'applications/:id', element: <Page><ApplicationDetailPage /></Page> },
          { path: 'wallet', element: <Page><WalletPage /></Page> },
          { path: 'profile', element: <Page><ProfilePage /></Page> },
          { path: 'notifications', element: <Page><NotificationsPage /></Page> },
          { path: 'help/tickets', element: <Page><HelpTicketsPage /></Page> },
          { path: 'help/tickets/:ticketId', element: <Page><HelpTicketDetailPage /></Page> },
          { path: 'pay-bills/bill/:requestId', element: <Page><PayBillsBillPage /></Page> },
          { path: 'pay-bills/confirm/:requestId', element: <Page><PayBillsConfirmPage /></Page> },
          { path: 'pay-bills/receipt/:paymentId', element: <Page><PayBillsResultPage /></Page> },
          { path: 'pay-bills/history', element: <Page><PayBillsHistoryPage /></Page> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
