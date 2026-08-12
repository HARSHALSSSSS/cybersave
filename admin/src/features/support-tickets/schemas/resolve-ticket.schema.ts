import { z } from 'zod';

export const resolveTicketSchema = z.object({
  resolutionSummary: z.string().min(10, 'Resolution summary should be at least 10 characters'),
  resolutionCategory: z.string().min(1, 'Please select a resolution category'),
  rootCause: z.string().min(1, 'Please select a root cause'),
  resolutionDays: z.coerce.number().min(0, 'Cannot be negative'),
  resolutionHours: z.coerce.number().min(0, 'Cannot be negative').max(23, 'Use days for values over 23 hours'),
  tags: z.array(z.string()),
  notifyReporter: z.boolean(),
  satisfactionSurvey: z.boolean(),
});

export type ResolveTicketFormValues = z.infer<typeof resolveTicketSchema>;
