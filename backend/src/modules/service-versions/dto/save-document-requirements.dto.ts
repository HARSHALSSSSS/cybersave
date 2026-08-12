import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class DocumentRequirementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFormats?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedMimeTypes?: string[];

  @IsOptional()
  @IsInt()
  maxFileSizeBytes?: number;

  @IsOptional()
  @IsInt()
  maxFiles?: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  config?: Record<string, unknown>;
}

export class SaveDocumentRequirementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentRequirementDto)
  requirements!: DocumentRequirementDto[];
}
