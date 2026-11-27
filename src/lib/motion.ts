/**
 * Shared GPU-composited motion presets for Steady.
 * All transitions animate only transform/opacity to avoid layout thrashing,
 * and respect `MotionConfig reducedMotion="user"` mounted in Providers.
 */
export const steadyTransitions = {
  snappy: {
    type: "spring" as const,
    stiffness: 460,
    damping: 32,
    mass: 0.8,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
  },
  tabIndicator: {
    type: "spring" as const,
    stiffness: 500,
    damping: 34,
  },
  smooth: {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  },
} as const;

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: steadyTransitions.gentle,
  },
};
