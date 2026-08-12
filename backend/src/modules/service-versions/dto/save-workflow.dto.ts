import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WorkflowStepDto {
  @IsString()
  stepKey!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsString()
  applicationStatus!: string;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @IsOptional()
  @IsBoolean()
  citizenVisible?: boolean;

  @IsOptional()
  @IsInt()
  slaHours?: number;
}

export class WorkflowTransitionDto {
  @IsString()
  fromStepKey!: string;

  @IsString()
  toStepKey!: string;

  @IsString()
  actionKey!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoleIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPermissions?: string[];

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAssignment?: boolean;

  @IsOptional()
  @IsBoolean()
  createsActionRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyCitizen?: boolean;

  @IsOptional()
  guardConfig?: Record<string, unknown>;
}

export class SaveWorkflowDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps!: WorkflowStepDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowTransitionDto)
  transitions!: WorkflowTransitionDto[];
}
