import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Input } from '@components/Input';
import { pickDocument } from '@features/services/utils/documentUpload';
import { sanitizeFieldInput } from '@features/services/utils/formValidation';
import {
  profileApi,
  profileQueryKeys,
  type FormFieldConfig,
} from '@services/api';

type DynamicFormFieldsProps = {
  fields: FormFieldConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
};

type PickedFileValue = {
  name: string;
  uri: string;
  mimeType: string;
};

function normalizeFieldType(type: string): string {
  if (type === 'DROPDOWN') return 'SELECT';
  if (type === 'MULTI_SELECT') return 'MULTI_SELECT';
  return type;
}

function formatAddressLabel(address: {
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
}): string {
  const lines = [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ');
  return `${address.label}: ${lines}`;
}

function fileDisplayName(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as PickedFileValue;
      if (parsed?.name) return parsed.name;
    } catch {
      return value;
    }
    return value;
  }
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return String((value as PickedFileValue).name);
  }
  return String(value);
}

export const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({
  fields,
  values,
  onChange,
  errors = {},
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const needsAddresses = fields.some(
    field => field.visible && normalizeFieldType(field.type) === 'ADDRESS',
  );

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
    enabled: needsAddresses,
  });

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
        optionGroup: {
          gap: theme.spacing.sm,
        },
        optionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
        },
        optionLabel: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          flex: 1,
          flexShrink: 1,
        },
        optionScroll: {
          maxHeight: 280,
        },
        radioOuter: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        radioInner: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.primary,
        },
        checkbox: {
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        checkboxChecked: {
          backgroundColor: theme.colors.primary,
        },
        checkMark: {
          color: theme.colors.textInverse,
          fontSize: 12,
          fontWeight: '700',
        },
        fileButton: {
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.md,
          alignItems: 'center',
          backgroundColor: theme.colors.backgroundSecondary,
        },
        fileButtonText: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        fileName: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
        },
        fieldLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
      }),
    [theme],
  );

  const handlePickFile = useCallback(
    async (field: FormFieldConfig) => {
      try {
        const allowedFormats = Array.isArray(field.config?.allowedFormats)
          ? (field.config.allowedFormats as string[])
          : undefined;
        const picked = await pickDocument(allowedFormats);
        if (!picked) return;
        onChange(field.key, {
          name: picked.name,
          uri: picked.uri,
          mimeType: picked.mimeType,
        } satisfies PickedFileValue);
      } catch {
        // Picker errors are non-fatal; leave previous value.
      }
    },
    [onChange],
  );

  const visibleFields = fields
    .filter(field => field.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const renderOptionField = (
    field: FormFieldConfig,
    mode: 'RADIO' | 'SELECT' | 'CHECKBOX' | 'MULTI_SELECT',
  ) => {
    const currentValue = values[field.key];
    const isMulti =
      mode === 'MULTI_SELECT' || (mode === 'CHECKBOX' && field.options.length > 1);
    const selectedValues = isMulti
      ? Array.isArray(currentValue)
        ? (currentValue as string[])
        : []
      : [];
    const options = [...field.options].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <View style={styles.fieldGap} key={field.id}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required ? ' *' : ''}
        </Text>
        {field.helpText ? <Text style={styles.helpText}>{field.helpText}</Text> : null}
        {options.length === 0 ? (
          <Text style={styles.helpText}>{t.services.noOptions}</Text>
        ) : (
          <ScrollView
            style={mode === 'SELECT' ? styles.optionScroll : undefined}
            nestedScrollEnabled
            showsVerticalScrollIndicator={mode === 'SELECT'}>
            <View style={styles.optionGroup}>
              {options.map(option => {
              const isSelected = isMulti
                ? selectedValues.includes(option.value)
                : mode === 'CHECKBOX'
                  ? Boolean(currentValue) || currentValue === option.value
                  : currentValue === option.value;

              return (
                <Pressable
                  key={option.id}
                  style={styles.optionRow}
                  accessibilityRole="button"
                  onPress={() => {
                    if (isMulti) {
                      const next = isSelected
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      onChange(field.key, next);
                      return;
                    }
                    if (mode === 'CHECKBOX') {
                      onChange(field.key, !isSelected);
                      return;
                    }
                    onChange(field.key, option.value);
                  }}>
                  {mode === 'RADIO' || mode === 'SELECT' ? (
                    <View style={styles.radioOuter}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  ) : (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected ? <Text style={styles.checkMark}>✓</Text> : null}
                    </View>
                  )}
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
            </View>
          </ScrollView>
        )}
        {errors[field.key] ? (
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.error }}>
            {errors[field.key]}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderAddressField = (field: FormFieldConfig) => {
    const currentValue = values[field.key];
    return (
      <View style={styles.fieldGap} key={field.id}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required ? ' *' : ''}
        </Text>
        {field.helpText ? <Text style={styles.helpText}>{field.helpText}</Text> : null}
        {addressesLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : addresses.length === 0 ? (
          <Text style={styles.helpText}>{t.services.noAddresses}</Text>
        ) : (
          <View style={styles.optionGroup}>
            {addresses.map(address => {
              const isSelected =
                currentValue === address.id ||
                currentValue === formatAddressLabel(address);
              return (
                <Pressable
                  key={address.id}
                  style={styles.optionRow}
                  accessibilityRole="radio"
                  onPress={() => onChange(field.key, address.id)}>
                  <View style={styles.radioOuter}>
                    {isSelected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionLabel}>
                    {formatAddressLabel(address)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {errors[field.key] ? (
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.error }}>
            {errors[field.key]}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderFileField = (field: FormFieldConfig) => {
    const displayName = fileDisplayName(values[field.key]);
    return (
      <View style={styles.fieldGap} key={field.id}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required ? ' *' : ''}
        </Text>
        {field.helpText ? <Text style={styles.helpText}>{field.helpText}</Text> : null}
        <Pressable
          style={styles.fileButton}
          accessibilityRole="button"
          onPress={() => void handlePickFile(field)}>
          <Text style={styles.fileButtonText}>
            {displayName ? t.services.changeFile : t.services.chooseFile}
          </Text>
        </Pressable>
        {displayName ? <Text style={styles.fileName}>{displayName}</Text> : null}
        {errors[field.key] ? (
          <Text style={{ ...theme.typography.bodySmall, color: theme.colors.error }}>
            {errors[field.key]}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <>
      {visibleFields.map(field => {
        const fieldType = normalizeFieldType(field.type);
        const stringValue =
          values[field.key] != null ? String(values[field.key]) : '';

        if (fieldType === 'ADDRESS') {
          return renderAddressField(field);
        }

        if (
          fieldType === 'FILE' ||
          fieldType === 'IMAGE' ||
          fieldType === 'DOCUMENT'
        ) {
          return renderFileField(field);
        }

        if (fieldType === 'RADIO') {
          return renderOptionField(field, 'RADIO');
        }

        if (fieldType === 'SELECT') {
          return renderOptionField(field, 'SELECT');
        }

        if (fieldType === 'MULTI_SELECT') {
          return renderOptionField(field, 'MULTI_SELECT');
        }

        if (fieldType === 'CHECKBOX') {
          if (field.options.length > 0) {
            return renderOptionField(field, 'CHECKBOX');
          }
          const checked = Boolean(values[field.key]);
          return (
            <View style={styles.fieldGap} key={field.id}>
              <Pressable
                style={styles.optionRow}
                accessibilityRole="checkbox"
                onPress={() => onChange(field.key, !checked)}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <Text style={styles.optionLabel}>
                  {field.label}
                  {field.required ? ' *' : ''}
                </Text>
              </Pressable>
              {field.helpText ? <Text style={styles.helpText}>{field.helpText}</Text> : null}
            </View>
          );
        }

        const keyboardType =
          fieldType === 'NUMBER'
            ? 'numeric'
            : fieldType === 'PHONE'
              ? 'phone-pad'
              : fieldType === 'EMAIL'
                ? 'email-address'
                : 'default';

        const multiline = fieldType === 'TEXTAREA';
        const placeholder =
          field.placeholder ??
          (fieldType === 'DATE' ? 'YYYY-MM-DD' : undefined);

        return (
          <View style={styles.fieldGap} key={field.id}>
            <Input
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={stringValue}
              onChangeText={text =>
                onChange(field.key, sanitizeFieldInput(field, text))
              }
              placeholder={placeholder}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              textAlignVertical={multiline ? 'top' : 'auto'}
              error={errors[field.key]}
            />
            {field.helpText ? <Text style={styles.helpText}>{field.helpText}</Text> : null}
            {fieldType === 'DATE' && !field.helpText ? (
              <Text style={styles.helpText}>{t.services.dateHint}</Text>
            ) : null}
          </View>
        );
      })}
    </>
  );
};
