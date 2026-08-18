import type { QueryClient } from '@tanstack/react-query';
import type { ApplicationDetail } from '@/services/api/applications.api';
import { applicationsApi } from '@/services/api/applications.api';
import {
  isApplicationAlreadySubmitted,
  submitApplicationAfterPayment,
} from '@/features/payments/utils/applicationSubmit';
import {
  refreshApplicationsListQueries,
  refreshNotificationsAfterSubmit,
  syncSubmittedApplicationInCaches,
} from '@/features/applications/utils/applicationListCache';

/** Wait for the server to mark the application submitted, then sync list + notifications. */
export async function finalizeApplicationSubmission(
  queryClient: QueryClient,
  applicationId: string,
  settledMessage: string,
): Promise<ApplicationDetail> {
  let result: ApplicationDetail;

  try {
    result = await submitApplicationAfterPayment(applicationId, settledMessage, {
      fast: false,
    });
  } catch (error) {
    const latest = await applicationsApi.getApplicationById(applicationId);
    if (isApplicationAlreadySubmitted(latest.status)) {
      result = latest;
    } else {
      throw error;
    }
  }

  syncSubmittedApplicationInCaches(queryClient, result);
  await refreshApplicationsListQueries(queryClient);
  refreshNotificationsAfterSubmit(queryClient);
  return result;
}
