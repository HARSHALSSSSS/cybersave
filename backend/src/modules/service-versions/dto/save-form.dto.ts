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

export class FormFieldOptionDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class FormFieldDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  helpText?: string;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  validation?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldOptionDto)
  options?: FormFieldOptionDto[];
}

export class FormConditionDto {
  @IsString()
  sourceFieldKey!: string;

  @IsString()
  operator!: string;

  @IsString()
  value!: string;

  @IsString()
  action!: string;

  @IsArray()
  @IsString({ each: true })
  targetFieldKeys!: string[];

  @IsOptional()
  rule?: Record<string, unknown>;
}

export class SaveFormDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields!: FormFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormConditionDto)
  conditions?: FormConditionDto[];
}
