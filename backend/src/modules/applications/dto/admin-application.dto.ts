import { ApplicationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class AdminListApplicationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  assignedOperatorId?: string;

  @IsOptional()
  @IsString()
  serviceVersionId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  citizenId?: string;

  @IsOptional()
  @Type(() => Date)
  submittedFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  submittedTo?: Date;
}

export class AssignOperatorDto {
  @IsString()
  operatorId!: string;
}

export class ExecuteTransitionDto {
  @IsString()
  actionKey!: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString({ each: true })
  requiredFieldKeys?: string[];

  @IsOptional()
  @IsString({ each: true })
  requiredDocumentIds?: string[];

  @IsOptional()
  @Type(() => Date)
  deadline?: Date;
}

export class CreateActionRequiredDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString({ each: true })
  requiredDocumentIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  requiredFieldKeys?: string[];

  @IsOptional()
  @Type(() => Date)
  deadline?: Date;
}

export class AddInternalNoteDto {
  @IsString()
  content!: string;
}
