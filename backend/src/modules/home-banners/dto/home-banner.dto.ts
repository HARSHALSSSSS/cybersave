import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateHomeBannerDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  gradientStart?: string;

  @IsOptional()
  @IsString()
  gradientMiddle?: string;

  @IsOptional()
  @IsString()
  gradientEnd?: string;

  @IsString()
  mainServiceId!: string;

  @IsString()
  subServiceId!: string;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateHomeBannerDto {
  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  gradientStart?: string;

  @IsOptional()
  @IsString()
  gradientMiddle?: string;

  @IsOptional()
  @IsString()
  gradientEnd?: string;

  @IsOptional()
  @IsString()
  mainServiceId?: string;

  @IsOptional()
  @IsString()
  subServiceId?: string;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class ReorderHomeBannersDto {
  @IsString({ each: true })
  orderedIds!: string[];
}
