import { createBrowserRouter, Navigate } from 'react-router';
import AdminLayout from '@/app/layouts/AdminLayout';
import { LoginPage, ProtectedRoute } from '@/features/authentication';
import ComingSoonPage from '@/features/shared/ComingSoonPage';
import { TransactionsPage } from '@/features/transactions';
import { DashboardPage } from '@/features/dashboard';
import { UsersPage, CitizenDetailPage } from '@/features/users';
import { ApplicationsPage, ApplicationDetailPage } from '@/features/applications';
import {
  ServicesPage,
  MainServiceStepPage,
  SubServiceStepPage,
  OverviewStepPage,
  FormBuilderStepPage,
  DocumentsStepPage,
  PricingStepPage,
  FulfillmentStepPage,
  WorkflowStepPage,
  PublishStepPage,
} from '@/features/services';
import { NotificationsPage } from '@/features/notifications';
import {
  SupportTicketsPage,
  TicketDetailPage,
  ResolveTicketPage,
} from '@/features/support-tickets';
import { AnalyticsPage } from '@/features/analytics';
import { AuditLogsPage } from '@/features/audit-logs';
import { SettingsPage } from '@/features/settings';
import { OperatorsPage, OperatorDetailPage } from '@/features/operators';
import {
  BillPaymentsDashboardPage,
  BillPaymentsCategoriesPage,
  BillPaymentsBillersPage,
  BillPaymentsTransactionsPage,
  BillPaymentTransactionDetailPage,
  BillPaymentsIntegrationPage,
} from '@/features/bill-payments';
import { HomeBannersPage } from '@/features/home-banners';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:citizenId', element: <CitizenDetailPage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'applications/:applicationId', element: <ApplicationDetailPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/new', element: <MainServiceStepPage /> },
      { path: 'services/new/:mainServiceId/sub-services', element: <SubServiceStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/overview', element: <OverviewStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/form-builder', element: <FormBuilderStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/documents', element: <DocumentsStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/pricing', element: <PricingStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/fulfillment', element: <FulfillmentStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/workflow', element: <WorkflowStepPage /> },
      { path: 'services/new/:mainServiceId/sub/:subServiceId/publish', element: <PublishStepPage /> },
      { path: 'home-banners', element: <HomeBannersPage /> },
      { path: 'operators', element: <OperatorsPage /> },
      { path: 'operators/:operatorId', element: <OperatorDetailPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'bill-payments', element: <BillPaymentsDashboardPage /> },
      { path: 'bill-payments/categories', element: <BillPaymentsCategoriesPage /> },
      { path: 'bill-payments/billers', element: <BillPaymentsBillersPage /> },
      { path: 'bill-payments/transactions', element: <BillPaymentsTransactionsPage /> },
      { path: 'bill-payments/transactions/:transactionId', element: <BillPaymentTransactionDetailPage /> },
      { path: 'bill-payments/integration', element: <BillPaymentsIntegrationPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'support-tickets', element: <SupportTicketsPage /> },
      { path: 'support-tickets/:ticketId', element: <TicketDetailPage /> },
      { path: 'support-tickets/:ticketId/resolve', element: <ResolveTicketPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <ComingSoonPage /> },
        ],
      },
    ],
  },
]);
