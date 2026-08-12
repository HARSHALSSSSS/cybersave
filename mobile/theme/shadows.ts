import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color = '#1A2B56',
): ShadowStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: Platform.OS === 'android' ? elevation : 0,
});

export const shadows = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(1, 3, 0.06, 2),
  md: createShadow(4, 8, 0.08, 4),
  lg: createShadow(8, 16, 0.1, 8),
  xl: createShadow(12, 24, 0.12, 12),
  card: createShadow(4, 12, 0.08, 6),
  button: createShadow(4, 8, 0.15, 4, '#2563EB'),
} as const;

export type Shadows = typeof shadows;
