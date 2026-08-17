import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

function toStringList(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
}

export class CreateGovernmentSchemeDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  ministry?: string;

  @IsString()
  @MinLength(2)
  category!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsString()
  @MinLength(2)
  whoCanApply!: string;

  @IsString()
  @MinLength(2)
  eligibility!: string;

  @IsOptional()
  @Transform(({ value }) => toStringList(value) ?? [])
  @IsArray()
  @IsString({ each: true })
  documentsRequired?: string[];

  @IsString()
  @MinLength(8)
  officialPortalUrl!: string;

  @IsOptional()
  @IsString()
  officialPortalLabel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGovernmentSchemeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  ministry?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  whoCanApply?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  eligibility?: string;

  @IsOptional()
  @Transform(({ value }) => toStringList(value))
  @IsArray()
  @IsString({ each: true })
  documentsRequired?: string[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  officialPortalUrl?: string;

  @IsOptional()
  @IsString()
  officialPortalLabel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
