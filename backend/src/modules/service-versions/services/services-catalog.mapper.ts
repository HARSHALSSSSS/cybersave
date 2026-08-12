import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { getStateName } from '@/common/constants/indian-states.constants';
import { applyOverviewLocale } from '@/common/utils/locale.util';
import type { FullServiceBundle } from '../types/service-bundle.types';
import {
  calculateAssistedTotalAmount,
  resolveAssistedPlatformFee,
} from '../utils/assisted-pricing.util';

type StateVariant = {
  stateCode: string;
  stateName: string;
  assistedEnabled: boolean;
  manualEnabled: boolean;
  officialPortalUrl: string | null;
  platformFee: Prisma.Decimal | null;
  baseFeeOverride: Prisma.Decimal | null;
  processingTime: string | null;
  department: string | null;
};

@Injectable()
export class ServicesCatalogMapper {
  toConfigurationResponse(
    bundle: FullServiceBundle,
    stateCode?: string,
    locale = 'en',
  ) {
    const fulfillment = bundle.fulfillmentConfig;
    const variant = stateCode
      ? fulfillment?.stateVariants.find(
          (v: { stateCode: string }) => v.stateCode === stateCode,
        )
      : undefined;

    const pricing = bundle.pricingConfig;
    const baseFeeRaw = variant?.baseFeeOverride
      ? Number(variant.baseFeeOverride)
      : pricing
        ? Number(pricing.baseFee)
        : 0;
    const taxRate = pricing ? Number(pricing.taxRate) : 0;
    const taxAmount = pricing?.taxEnabled ? (baseFeeRaw * taxRate) / 100 : 0;

    const assistedEnabled =
      fulfillment?.assistedEnabled !== false &&
      (variant ? variant.assistedEnabled : true);
    const manualEnabled =
      fulfillment?.manualEnabled === true &&
      (variant ? variant.manualEnabled : true);

    const platformFee = resolveAssistedPlatformFee(fulfillment, stateCode);

    const officialPortalUrl =
      variant?.officialPortalUrl ??
      fulfillment?.defaultPortalUrl ??
      null;

    const overview = bundle.overview
      ? applyOverviewLocale(
          {
            ...bundle.overview,
            processingTime:
              variant?.processingTime ?? bundle.overview.processingTime,
            department: variant?.department ?? bundle.overview.department,
          },
          locale,
        )
      : null;

    return {
      serviceVersionId: bundle.id,
      versionNumber: bundle.versionNumber,
      lifecycleStatus: bundle.lifecycleStatus,
      mainService: {
        id: bundle.subService.mainService.id,
        name: bundle.subService.mainService.name,
        slug: bundle.subService.mainService.slug,
      },
      subService: {
        id: bundle.subService.id,
        name: bundle.subService.name,
        slug: bundle.subService.slug,
      },
      overview,
      form: assistedEnabled && bundle.formVersion
        ? {
            id: bundle.formVersion.id,
            versionNumber: bundle.formVersion.versionNumber,
            fields: bundle.formVersion.fields,
            conditions: bundle.formVersion.conditions,
          }
        : null,
      documentRequirements: assistedEnabled
        ? bundle.documentRequirements
        : [],
      pricing: assistedEnabled && pricing
        ? {
            baseFee: baseFeeRaw.toFixed(2),
            taxEnabled: pricing.taxEnabled,
            taxRate: pricing.taxRate.toString(),
            taxAmount: taxAmount.toFixed(2),
            currency: pricing.currency,
            platformFee: platformFee.toFixed(2),
            additionalCharges: pricing.additionalCharges.map(
              (c: { name: string; amount: { toString(): string }; condition: string | null }) => ({
              name: c.name,
              amount: c.amount.toString(),
              condition: c.condition,
            }),
            ),
            totalAmount: calculateAssistedTotalAmount(
              pricing,
              fulfillment,
              stateCode,
              variant?.baseFeeOverride ? Number(variant.baseFeeOverride) : null,
            ).toFixed(2),
          }
        : null,
      workflow: bundle.workflowDefinition
        ? {
            id: bundle.workflowDefinition.id,
            steps: bundle.workflowDefinition.steps,
          }
        : null,
      fulfillment: fulfillment
        ? {
            assistedEnabled,
            manualEnabled,
            assistedCtaLabel: fulfillment.assistedCtaLabel,
            manualCtaLabel: fulfillment.manualCtaLabel,
            requiresStateSelection: fulfillment.requiresStateSelection,
            platformFee: assistedEnabled ? platformFee : 0,
            officialPortalUrl,
            manualInstructions: fulfillment.manualInstructions,
            selectedState: stateCode
              ? {
                  code: stateCode,
                  name: variant?.stateName ?? getStateName(stateCode) ?? stateCode,
                }
              : null,
            availableStates: fulfillment.stateVariants.map((v: StateVariant) => ({
              code: v.stateCode,
              name: v.stateName,
              assistedEnabled: v.assistedEnabled,
              manualEnabled: v.manualEnabled,
              platformFee: assistedEnabled
                ? v.platformFee
                  ? Number(v.platformFee)
                  : platformFee
                : 0,
              officialPortalUrl: v.officialPortalUrl,
            })),
          }
        : {
            assistedEnabled: true,
            manualEnabled: false,
            assistedCtaLabel: 'Get it done by us',
            manualCtaLabel: 'Apply on official portal',
            requiresStateSelection: false,
            platformFee: 49,
            officialPortalUrl: null,
            manualInstructions: null,
            selectedState: null,
            availableStates: [],
          },
      termsAndConditions: bundle.overview?.termsAndConditions,
      instructions: bundle.overview?.instructions,
    };
  }
}
