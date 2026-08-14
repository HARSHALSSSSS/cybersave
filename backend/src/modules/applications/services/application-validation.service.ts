import { Injectable } from '@nestjs/common';
import {
  ApplicationDocumentStatus,
  FormCondition,
  FormField,
  FormFieldType,
} from '@prisma/client';

import { PrismaService } from '@/database/database.module';

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

type FormFieldWithOptions = FormField & {
  options: Array<{ value: string; label: string }>;
};

const FILE_FIELD_TYPES: FormFieldType[] = [
  FormFieldType.FILE,
  FormFieldType.IMAGE,
  FormFieldType.DOCUMENT,
];

@Injectable()
export class ApplicationValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateApplication(
    applicationId: string,
    options?: { scope?: 'form' | 'documents' | 'all' },
  ): Promise<ValidationResult> {
    const scope = options?.scope ?? 'all';
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        fieldValues: true,
        documents: {
          include: { documentRequirement: true, storedFile: true },
        },
        formVersion: {
          include: {
            fields: { include: { options: true }, orderBy: { sortOrder: 'asc' } },
            conditions: true,
          },
        },
        serviceVersion: {
          include: { documentRequirements: { orderBy: { sortOrder: 'asc' } } },
        },
        actionRequests: {
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!application) {
      return {
        valid: false,
        errors: [{ field: 'application', message: 'Application not found' }],
        warnings: [],
      };
    }

    const openActionRequest = application.actionRequests[0];
    const valueMap = new Map(
      application.fieldValues.map((fv) => [fv.fieldKey, fv.value]),
    );

    const fields = application.formVersion.fields as FormFieldWithOptions[];
    const conditions = application.formVersion.conditions;
    const visibleRequiredKeys = this.resolveVisibleRequiredFields(
      fields,
      conditions,
      valueMap,
    );

    const scopedFieldKeys = openActionRequest?.requiredFieldKeys.length
      ? new Set(openActionRequest.requiredFieldKeys)
      : null;
    const scopedDocumentIds = openActionRequest?.requiredDocumentIds.length
      ? new Set(openActionRequest.requiredDocumentIds)
      : null;

    const errors: ValidationIssue[] = [];

    if (scope === 'form' || scope === 'all') {
      for (const field of fields) {
        if (FILE_FIELD_TYPES.includes(field.type)) {
          continue;
        }

        if (scopedFieldKeys && !scopedFieldKeys.has(field.key)) {
          continue;
        }

        const isRequired =
          visibleRequiredKeys.has(field.key) ||
          (scopedFieldKeys?.has(field.key) ?? false);

        const rawValue = valueMap.get(field.key);
        const fieldErrors = this.validateFieldValue(field, rawValue, isRequired);
        errors.push(...fieldErrors);
      }
    }

    if (scope !== 'form') {
      const documentRequirements = application.serviceVersion.documentRequirements;
      for (const requirement of documentRequirements) {
      if (scopedDocumentIds && !scopedDocumentIds.has(requirement.id)) {
        continue;
      }

      if (!requirement.required && !scopedDocumentIds?.has(requirement.id)) {
        continue;
      }

      const uploaded = application.documents.filter(
        (doc) =>
          doc.documentRequirementId === requirement.id &&
          doc.status !== ApplicationDocumentStatus.REJECTED &&
          doc.storedFile.status !== 'FAILED',
      );

      if (uploaded.length < 1) {
        errors.push({
          field: `document:${requirement.id}`,
          message: `Required document "${requirement.name}" is missing`,
        });
        continue;
      }

      if (uploaded.length > requirement.maxFiles) {
        errors.push({
          field: `document:${requirement.id}`,
          message: `Too many files for "${requirement.name}" (max ${requirement.maxFiles})`,
        });
      }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  validateFieldValues(
    fields: FormFieldWithOptions[],
    conditions: FormCondition[],
    values: Record<string, unknown>,
    options?: { onlyKeys?: Set<string> },
  ): ValidationIssue[] {
    const valueMap = new Map(Object.entries(values));
    const visibleRequiredKeys = this.resolveVisibleRequiredFields(
      fields,
      conditions,
      valueMap,
    );
    const errors: ValidationIssue[] = [];

    for (const field of fields) {
      if (FILE_FIELD_TYPES.includes(field.type)) {
        continue;
      }

      if (options?.onlyKeys && !options.onlyKeys.has(field.key)) {
        continue;
      }

      const isRequired =
        visibleRequiredKeys.has(field.key) ||
        (options?.onlyKeys?.has(field.key) ?? false);

      const fieldErrors = this.validateFieldValue(
        field,
        valueMap.get(field.key),
        isRequired,
      );
      errors.push(...fieldErrors);
    }

    return errors;
  }

  resolveVisibleRequiredFields(
    fields: FormFieldWithOptions[],
    conditions: FormCondition[],
    valueMap: Map<string, unknown>,
  ): Set<string> {
    const hidden = new Set<string>();
    const required = new Set<string>();

    for (const field of fields) {
      if (!field.visible) {
        hidden.add(field.key);
      }
      if (field.required) {
        required.add(field.key);
      }
    }

    for (const condition of conditions) {
      const sourceValue = valueMap.get(condition.sourceFieldKey);
      const matches = this.evaluateCondition(
        condition.operator,
        sourceValue,
        condition.value,
      );

      if (!matches) {
        continue;
      }

      for (const targetKey of condition.targetFieldKeys) {
        if (condition.action === 'hide') {
          hidden.add(targetKey);
          required.delete(targetKey);
        } else if (condition.action === 'show') {
          hidden.delete(targetKey);
        } else if (condition.action === 'require') {
          required.add(targetKey);
          hidden.delete(targetKey);
        } else if (condition.action === 'optional') {
          required.delete(targetKey);
        }
      }
    }

    for (const key of hidden) {
      required.delete(key);
    }

    return required;
  }

  private validateFieldValue(
    field: FormFieldWithOptions,
    rawValue: unknown,
    isRequired: boolean,
  ): ValidationIssue[] {
    const errors: ValidationIssue[] = [];
    const isEmpty =
      rawValue === null ||
      rawValue === undefined ||
      rawValue === '' ||
      (Array.isArray(rawValue) && rawValue.length === 0);

    if (isRequired && isEmpty) {
      errors.push({
        field: field.key,
        message: `"${field.label}" is required`,
      });
      return errors;
    }

    if (isEmpty) {
      return errors;
    }

    const validation =
      field.validation && typeof field.validation === 'object'
        ? (field.validation as Record<string, unknown>)
        : {};

    switch (field.type) {
      case FormFieldType.EMAIL:
        if (typeof rawValue !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawValue)) {
          errors.push({ field: field.key, message: 'Invalid email address' });
        }
        break;
      case FormFieldType.PHONE: {
        const digits = String(rawValue).replace(/\D/g, '');
        const national =
          digits.length === 12 && digits.startsWith('91')
            ? digits.slice(2)
            : digits;
        if (!/^[6-9]\d{9}$/.test(national)) {
          errors.push({ field: field.key, message: 'Enter a valid 10-digit mobile number' });
        }
        break;
      }
      case FormFieldType.NUMBER: {
        const num = Number(rawValue);
        if (Number.isNaN(num)) {
          errors.push({ field: field.key, message: 'Must be a number' });
          break;
        }
        if (validation.min !== undefined && num < Number(validation.min)) {
          errors.push({
            field: field.key,
            message: `Must be at least ${validation.min}`,
          });
        }
        if (validation.max !== undefined && num > Number(validation.max)) {
          errors.push({
            field: field.key,
            message: `Must be at most ${validation.max}`,
          });
        }
        break;
      }
      case FormFieldType.TEXT:
      case FormFieldType.TEXTAREA: {
        if (typeof rawValue !== 'string') {
          errors.push({ field: field.key, message: 'Must be text' });
          break;
        }
        if (
          validation.minLength !== undefined &&
          rawValue.length < Number(validation.minLength)
        ) {
          errors.push({
            field: field.key,
            message: `Minimum length is ${validation.minLength}`,
          });
        }
        if (
          validation.maxLength !== undefined &&
          rawValue.length > Number(validation.maxLength)
        ) {
          errors.push({
            field: field.key,
            message: `Maximum length is ${validation.maxLength}`,
          });
        }
        if (
          validation.pattern &&
          typeof validation.pattern === 'string' &&
          !new RegExp(validation.pattern).test(rawValue)
        ) {
          errors.push({ field: field.key, message: 'Invalid format' });
        }
        break;
      }
      case FormFieldType.DROPDOWN:
      case FormFieldType.RADIO: {
        const allowed = field.options.map((o) => o.value);
        if (typeof rawValue === 'string' && !allowed.includes(rawValue)) {
          errors.push({ field: field.key, message: 'Invalid option selected' });
        }
        break;
      }
      case FormFieldType.CHECKBOX:
      case FormFieldType.MULTI_SELECT: {
        if (field.type === FormFieldType.CHECKBOX && (rawValue === true || rawValue === false)) {
          break;
        }
        const allowed = new Set(field.options.map((o) => o.value));
        if (allowed.size === 0) break;
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        if (!values.every((v) => typeof v === 'string' && allowed.has(v))) {
          errors.push({ field: field.key, message: 'Invalid option selected' });
        }
        break;
      }
      default:
        break;
    }

    return errors;
  }

  private evaluateCondition(
    operator: string,
    sourceValue: unknown,
    expected: string,
  ): boolean {
    const normalized =
      sourceValue === null || sourceValue === undefined
        ? ''
        : String(sourceValue);

    switch (operator) {
      case 'equals':
      case 'eq':
        return normalized === expected;
      case 'not_equals':
      case 'neq':
        return normalized !== expected;
      case 'contains':
        return normalized.includes(expected);
      case 'not_contains':
        return !normalized.includes(expected);
      case 'greater_than':
        return Number(normalized) > Number(expected);
      case 'less_than':
        return Number(normalized) < Number(expected);
      case 'is_empty':
        return normalized === '';
      case 'is_not_empty':
        return normalized !== '';
      default:
        return normalized === expected;
    }
  }
}
