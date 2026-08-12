import { Module } from '@nestjs/common';

import {
  AdminSupportTicketsController,
  CitizenSupportTicketsController,
} from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  controllers: [CitizenSupportTicketsController, AdminSupportTicketsController],
  providers: [SupportTicketsService],
})
export class SupportTicketsModule {}
