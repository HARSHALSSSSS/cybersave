import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SubServiceStatus } from '@prisma/client';

export class UpdateSubServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(SubServiceStatus)
  status?: SubServiceStatus;
}
