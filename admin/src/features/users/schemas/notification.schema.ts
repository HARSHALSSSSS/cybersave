import { z } from 'zod';

export const NOTIFICATION_MESSAGE_MAX_LENGTH = 500;

export const sendNotificationSchema = z.object({
  type: z.enum(['email', 'sms', 'push']),
  subject: z.string().min(3, 'Subject line is required').max(120, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message should be at least 10 characters')
    .max(NOTIFICATION_MESSAGE_MAX_LENGTH, `Message cannot exceed ${NOTIFICATION_MESSAGE_MAX_LENGTH} characters`),
});

export type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>;
