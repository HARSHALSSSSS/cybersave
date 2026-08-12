/**
 * Motion tokens. Durations are intentionally short (150–250ms) so the UI
 * feels immediate — components should stay subtle and never over-animate.
 */

export const duration = {
  fast: 150,
  base: 200,
  slow: 250,
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

export const transition = {
  fast: `${duration.fast}ms ${easing.standard}`,
  base: `${duration.base}ms ${easing.standard}`,
  slow: `${duration.slow}ms ${easing.standard}`,
} as const;

/** Ready-to-spread framer-motion variants for subtle enter/exit motion. */
export const motion = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.base / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: { duration: duration.base / 1000, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
    transition: { duration: duration.fast / 1000, ease: [0.2, 0, 0, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 12 },
    transition: { duration: duration.base / 1000, ease: [0.4, 0, 0.2, 1] },
  },
} as const;
