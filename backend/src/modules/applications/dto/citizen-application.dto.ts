import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  subServiceId!: string;

  @IsOptional()
  @IsString()
  stateCode?: string;

  @IsOptional()
  @IsString()
  stateName?: string;
}

export class SaveFormValuesDto {
  @IsObject()
  values!: Record<string, unknown>;
}

export class RequestUploadDto {
  @IsString()
  documentRequirementId!: string;

  @IsString()
  originalFileName!: string;

  @IsString()
  mimeType!: string;
}

export class CompleteUploadDto {
  @IsString()
  uploadSessionId!: string;

  @IsString()
  storedFileId!: string;
}

export class CreatePaymentIntentDto {
  @IsString()
  idempotencyKey!: string;
}

export class PayWithWalletDto {
  @IsString()
  idempotencyKey!: string;
}

export class ConfirmApplicationPaymentDto {
  @IsString()
  paymentId!: string;

  @IsOptional()
  @IsBoolean()
  mockCapture?: boolean;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}

export class SubmitCorrectionDto {
  @IsObject()
  values!: Record<string, unknown>;
}

export class ListApplicationsQueryDto {
  @IsString()
  status?: string;

  page?: number;
  limit?: number;
}
