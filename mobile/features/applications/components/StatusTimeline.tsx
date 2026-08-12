import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TimelineStep } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';

type StatusTimelineProps = {
  steps: TimelineStep[];
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps }) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: theme.spacing.sm,
        },
        stepRow: {
          flexDirection: 'row',
          minHeight: 64,
        },
        indicatorCol: {
          width: 24,
          alignItems: 'center',
        },
        dot: {
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 2,
        },
        dotCompleted: {
          backgroundColor: '#10B981',
          borderColor: '#10B981',
        },
        dotActive: {
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
        },
        dotPending: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        line: {
          width: 2,
          flex: 1,
          minHeight: 40,
        },
        lineCompleted: {
          backgroundColor: '#10B981',
        },
        linePending: {
          backgroundColor: theme.colors.border,
        },
        content: {
          flex: 1,
          paddingLeft: theme.spacing.md,
          paddingBottom: theme.spacing.lg,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        labelActive: {
          color: '#F59E0B',
        },
        labelPending: {
          color: theme.colors.textSecondary,
        },
        timestamp: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        subtext: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const dotStyle =
          step.state === 'completed'
            ? styles.dotCompleted
            : step.state === 'active'
              ? styles.dotActive
              : styles.dotPending;
        const lineStyle =
          step.state === 'completed' ? styles.lineCompleted : styles.linePending;
        const labelStyle = [
          styles.label,
          step.state === 'active' && styles.labelActive,
          step.state === 'pending' && styles.labelPending,
        ];

        return (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.indicatorCol}>
              <View style={[styles.dot, dotStyle]} />
              {!isLast ? <View style={[styles.line, lineStyle]} /> : null}
            </View>
            <View style={styles.content}>
              <Text style={labelStyle}>{step.label}</Text>
              {step.timestamp ? (
                <Text style={styles.timestamp}>{step.timestamp}</Text>
              ) : null}
              {step.subtext ? (
                <Text style={styles.subtext}>{step.subtext}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};
