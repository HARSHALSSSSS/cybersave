import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSubServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
