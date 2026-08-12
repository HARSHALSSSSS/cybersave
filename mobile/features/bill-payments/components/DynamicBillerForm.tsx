import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@app/providers/ThemeProvider';
import { Input } from '@components/Input';
import type { BbpsField } from '@services/api/billPayments.api';
import {
  BillIcon,
  BoltIcon,
  BookIcon,
  CardIcon,
  ShieldIcon,
  WaterIcon,
} from '@components/icons';

type DynamicBillerFormProps = {
  fields: BbpsField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  errors?: Record<string, string>;
};

function keyboardTypeForField(type: string): 'default' | 'numeric' | 'phone-pad' | 'email-address' {
  if (type === 'number' || type === 'mobile') return 'numeric';
  if (type === 'mobile') return 'phone-pad';
  if (type === 'email') return 'email-address';
  return 'default';
}

export const DynamicBillerForm: React.FC<DynamicBillerFormProps> = ({
  fields,
  values,
  onChange,
  errors = {},
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldGap: {
          marginBottom: theme.spacing.lg,
        },
        helpText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        errorText: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
          marginTop: theme.spacing.xs,
        },
        optionGroup: {
          gap: theme.spacing.sm,
        },
        optionChip: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        optionChipSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primaryMuted,
        },
        optionLabel: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
      }),
    [theme],
  );

  if (fields.length === 0) {
    return (
      <Text style={styles.helpText}>
        No account details required for this biller.
      </Text>
    );
  }

  return (
    <>
      {fields.map(field => {
        if (field.options?.length) {
          return (
            <View key={field.key} style={styles.fieldGap}>
              <Text style={styles.optionLabel}>
                {field.label}
                {field.required ? ' *' : ''}
              </Text>
              <View style={styles.optionGroup}>
                {field.options.map(option => {
                  const selected = values[field.key] === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                      onPress={() => onChange(field.key, option.value)}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors[field.key] ? (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              ) : null}
            </View>
          );
        }

        return (
          <View key={field.key} style={styles.fieldGap}>
            <Input
              label={`${field.label}${field.required ? ' *' : ''}`}
              placeholder={field.placeholder ?? field.label}
              value={values[field.key] ?? ''}
              onChangeText={text => onChange(field.key, text)}
              keyboardType={keyboardTypeForField(field.type)}
              maxLength={field.maxLength}
              error={errors[field.key]}
            />
            {field.helpText ? (
              <Text style={styles.helpText}>{field.helpText}</Text>
            ) : null}
          </View>
        );
      })}
    </>
  );
};

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  electricity: { color: '#F59E0B', bg: '#FEF3C7' },
  water: { color: '#3B82F6', bg: '#DBEAFE' },
  gas: { color: '#EF4444', bg: '#FEE2E2' },
  broadband: { color: '#8B5CF6', bg: '#EDE9FE' },
  mobile_postpaid: { color: '#10B981', bg: '#ECFDF5' },
  dth: { color: '#6366F1', bg: '#EEF2FF' },
  insurance: { color: '#059669', bg: '#D1FAE5' },
  loan_repayment: { color: '#DC2626', bg: '#FEE2E2' },
  education: { color: '#7C3AED', bg: '#F5F3FF' },
  fastag: { color: '#2563EB', bg: '#EFF6FF' },
};

export function getCategoryColors(category: string | null | undefined) {
  const key = (category ?? '').toLowerCase();
  return CATEGORY_COLORS[key] ?? { color: '#2563EB', bg: '#EFF6FF' };
}

export const CategoryIcon: React.FC<{ icon: string; color: string; size?: number }> = ({
  icon,
  color,
  size = 22,
}) => {
  switch (icon) {
    case 'bolt':
      return <BoltIcon color={color} size={size} />;
    case 'water':
      return <WaterIcon color={color} size={size} />;
    case 'book':
      return <BookIcon color={color} size={size} />;
    case 'shield':
      return <ShieldIcon color={color} size={size} />;
    case 'bank':
    case 'card':
      return <CardIcon color={color} size={size} />;
    default:
      return <BillIcon color={color} size={size} />;
  }
};

export function billerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function formatRupee(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatBillDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
