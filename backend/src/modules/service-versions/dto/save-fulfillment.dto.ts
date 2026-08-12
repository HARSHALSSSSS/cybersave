import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveStateVariantDto {
  @IsString()
  stateCode!: string;

  @IsString()
  stateName!: string;

  @IsOptional()
  @IsBoolean()
  assistedEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  manualEnabled?: boolean;

  @IsOptional()
  @IsString()
  officialPortalUrl?: string;

  @IsOptional()
  @IsNumber()
  platformFee?: number;

  @IsOptional()
  @IsNumber()
  baseFeeOverride?: number;

  @IsOptional()
  @IsString()
  processingTime?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class SaveFulfillmentDto {
  @IsOptional()
  @IsBoolean()
  assistedEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  manualEnabled?: boolean;

  @IsOptional()
  @IsString()
  assistedCtaLabel?: string;

  @IsOptional()
  @IsString()
  manualCtaLabel?: string;

  @IsOptional()
  @IsBoolean()
  requiresStateSelection?: boolean;

  @IsOptional()
  @IsNumber()
  defaultPlatformFee?: number;

  @IsOptional()
  @IsString()
  defaultPortalUrl?: string;

  @IsOptional()
  @IsString()
  manualInstructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveStateVariantDto)
  stateVariants?: SaveStateVariantDto[];
}
