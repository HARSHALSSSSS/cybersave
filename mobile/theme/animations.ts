export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

export const easing = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
} as const;

export const animations = {
  duration,
  easing,
  fadeIn: {
    duration: duration.normal,
  },
  slideUp: {
    duration: duration.normal,
  },
  scalePress: {
    duration: duration.fast,
    scale: 0.97,
  },
  splashDelay: 2500,
  pageTransition: duration.normal,
} as const;

export type Animations = typeof animations;
