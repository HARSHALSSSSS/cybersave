import { Module } from '@nestjs/common';

import { NotificationsModule } from '@/modules/notifications/notifications.module';
import {
  AdminSupportTicketsController,
  CitizenSupportTicketsController,
} from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CitizenSupportTicketsController, AdminSupportTicketsController],
  providers: [SupportTicketsService],
})
export class SupportTicketsModule {}
