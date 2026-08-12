import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { getScrollBottomPadding, getScreenBottomPadding } from '@utils/layout';

type TabStackScreenLayoutProps = {
  header?: React.ReactNode;
  /** Primary action rendered at the end of scroll content (not pinned). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  /** When true (default), scroll content clears the floating tab bar. */
  aboveTabBar?: boolean;
};

/**
 * Stack screen shell: header → single scroll area with optional inline action at the bottom.
 * CTAs scroll naturally with content (standard consumer-app pattern).
 */
export const TabStackScreenLayout: React.FC<TabStackScreenLayoutProps> = ({
  header,
  footer,
  children,
  scroll = true,
  keyboardAvoiding = false,
  contentContainerStyle,
  bodyStyle,
  aboveTabBar = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const scrollBottomPadding = aboveTabBar
    ? getScrollBottomPadding(insets, theme.spacing.lg)
    : getScreenBottomPadding(insets, theme.spacing['2xl']);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        body: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: scrollBottomPadding,
        },
        staticBody: {
          flex: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: scrollBottomPadding,
        },
        inlineAction: {
          marginTop: theme.spacing['2xl'],
        },
      }),
    [theme, scrollBottomPadding],
  );

  const scrollBody = (
    <>
      {children}
      {footer ? <View style={styles.inlineAction}>{footer}</View> : null}
    </>
  );

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {scrollBody}
    </ScrollView>
  ) : (
    <View style={[styles.staticBody, bodyStyle]}>
      {scrollBody}
    </View>
  );

  return (
    <View style={styles.root}>
      {header}
      <View style={styles.body}>
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}>
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </View>
    </View>
  );
};
