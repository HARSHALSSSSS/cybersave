import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import AdminLayout from '@/app/layouts/AdminLayout';
import { env } from '@/app/config/env';
import { LoginPage, ProtectedRoute } from '@/features/authentication';
import ComingSoonPage from '@/features/shared/ComingSoonPage';

const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    }
  >
    {children}
  </Suspense>
);

const DashboardPageLazy = lazy(() =>
  import('@/features/dashboard').then(m => ({ default: m.DashboardPage })),
);

const UsersPageLazy = lazy(() => import('@/features/users').then(m => ({ default: m.UsersPage })));
const CitizenDetailPageLazy = lazy(() =>
  import('@/features/users').then(m => ({ default: m.CitizenDetailPage })),
);

const ApplicationsPageLazy = lazy(() =>
  import('@/features/applications').then(m => ({ default: m.ApplicationsPage })),
);
const ApplicationDetailPageLazy = lazy(() =>
  import('@/features/applications').then(m => ({ default: m.ApplicationDetailPage })),
);

const ServicesPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.ServicesPage })),
);
const MainServiceStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.MainServiceStepPage })),
);
const SubServiceStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.SubServiceStepPage })),
);
const OverviewStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.OverviewStepPage })),
);
const FormBuilderStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.FormBuilderStepPage })),
);
const DocumentsStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.DocumentsStepPage })),
);
const PricingStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.PricingStepPage })),
);
const FulfillmentStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.FulfillmentStepPage })),
);
const WorkflowStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.WorkflowStepPage })),
);
const PublishStepPageLazy = lazy(() =>
  import('@/features/services').then(m => ({ default: m.PublishStepPage })),
);

const HomeBannersPageLazy = lazy(() =>
  import('@/features/home-banners').then(m => ({ default: m.HomeBannersPage })),
);

const GovernmentSchemesPageLazy = lazy(() =>
  import('@/features/schemes').then(m => ({ default: m.SchemesPage })),
);

const OperatorsPageLazy = lazy(() =>
  import('@/features/operators').then(m => ({ default: m.OperatorsPage })),
);
const OperatorDetailPageLazy = lazy(() =>
  import('@/features/operators').then(m => ({ default: m.OperatorDetailPage })),
);

const TransactionsPageLazy = lazy(() =>
  import('@/features/transactions').then(m => ({ default: m.TransactionsPage })),
);

const BillPaymentsDashboardPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentsDashboardPage })),
);
const BillPaymentsCategoriesPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentsCategoriesPage })),
);
const BillPaymentsBillersPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentsBillersPage })),
);
const BillPaymentsTransactionsPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentsTransactionsPage })),
);
const BillPaymentTransactionDetailPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentTransactionDetailPage })),
);
const BillPaymentsIntegrationPageLazy = lazy(() =>
  import('@/features/bill-payments').then(m => ({ default: m.BillPaymentsIntegrationPage })),
);

const NotificationsPageLazy = lazy(() =>
  import('@/features/notifications').then(m => ({ default: m.NotificationsPage })),
);

const SupportTicketsPageLazy = lazy(() =>
  import('@/features/support-tickets').then(m => ({ default: m.SupportTicketsPage })),
);
const TicketDetailPageLazy = lazy(() =>
  import('@/features/support-tickets').then(m => ({ default: m.TicketDetailPage })),
);
const ResolveTicketPageLazy = lazy(() =>
  import('@/features/support-tickets').then(m => ({ default: m.ResolveTicketPage })),
);

const AnalyticsPageLazy = lazy(() =>
  import('@/features/analytics').then(m => ({ default: m.AnalyticsPage })),
);
const AuditLogsPageLazy = lazy(() =>
  import('@/features/audit-logs').then(m => ({ default: m.AuditLogsPage })),
);

const SettingsPageLazy = lazy(() =>
  import('@/features/settings').then(m => ({ default: m.SettingsPage })),
);

export const router = createBrowserRouter([
  { path: 'login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <RouteSuspense><DashboardPageLazy /></RouteSuspense> },
      { path: 'users', element: <RouteSuspense><UsersPageLazy /></RouteSuspense> },
      { path: 'users/:citizenId', element: <RouteSuspense><CitizenDetailPageLazy /></RouteSuspense> },
      { path: 'applications', element: <RouteSuspense><ApplicationsPageLazy /></RouteSuspense> },
      { path: 'applications/:applicationId', element: <RouteSuspense><ApplicationDetailPageLazy /></RouteSuspense> },
      { path: 'services', element: <RouteSuspense><ServicesPageLazy /></RouteSuspense> },
      { path: 'services/new', element: <RouteSuspense><MainServiceStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub-services', element: <RouteSuspense><SubServiceStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/overview', element: <RouteSuspense><OverviewStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/form-builder', element: <RouteSuspense><FormBuilderStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/documents', element: <RouteSuspense><DocumentsStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/pricing', element: <RouteSuspense><PricingStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/fulfillment', element: <RouteSuspense><FulfillmentStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/workflow', element: <RouteSuspense><WorkflowStepPageLazy /></RouteSuspense> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/publish', element: <RouteSuspense><PublishStepPageLazy /></RouteSuspense> },
      { path: 'schemes', element: <RouteSuspense><GovernmentSchemesPageLazy /></RouteSuspense> },
      { path: 'home-banners', element: <RouteSuspense><HomeBannersPageLazy /></RouteSuspense> },
      { path: 'operators', element: <RouteSuspense><OperatorsPageLazy /></RouteSuspense> },
      { path: 'operators/:operatorId', element: <RouteSuspense><OperatorDetailPageLazy /></RouteSuspense> },
      { path: 'transactions', element: <RouteSuspense><TransactionsPageLazy /></RouteSuspense> },
      { path: 'bill-payments', element: <RouteSuspense><BillPaymentsDashboardPageLazy /></RouteSuspense> },
      { path: 'bill-payments/categories', element: <RouteSuspense><BillPaymentsCategoriesPageLazy /></RouteSuspense> },
      { path: 'bill-payments/billers', element: <RouteSuspense><BillPaymentsBillersPageLazy /></RouteSuspense> },
      { path: 'bill-payments/transactions', element: <RouteSuspense><BillPaymentsTransactionsPageLazy /></RouteSuspense> },
      { path: 'bill-payments/transactions/:transactionId', element: <RouteSuspense><BillPaymentTransactionDetailPageLazy /></RouteSuspense> },
      { path: 'bill-payments/integration', element: <RouteSuspense><BillPaymentsIntegrationPageLazy /></RouteSuspense> },
      { path: 'notifications', element: <RouteSuspense><NotificationsPageLazy /></RouteSuspense> },
      { path: 'support-tickets', element: <RouteSuspense><SupportTicketsPageLazy /></RouteSuspense> },
      { path: 'support-tickets/:ticketId', element: <RouteSuspense><TicketDetailPageLazy /></RouteSuspense> },
      { path: 'support-tickets/:ticketId/resolve', element: <RouteSuspense><ResolveTicketPageLazy /></RouteSuspense> },
      { path: 'analytics', element: <RouteSuspense><AnalyticsPageLazy /></RouteSuspense> },
      { path: 'audit-logs', element: <RouteSuspense><AuditLogsPageLazy /></RouteSuspense> },
      { path: 'settings', element: <RouteSuspense><SettingsPageLazy /></RouteSuspense> },
      { path: '*', element: <ComingSoonPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
], { basename: env.routerBasename });
