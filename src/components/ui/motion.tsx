'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from 'cn';

/**
 * Animation foundation.
 *
 * Everything here is intentionally restrained: short distances, short
 * durations, one easing curve. The goal is to make the interface feel
 * responsive, never busy. All primitives collapse to a plain fade (or
 * render statically) when the user prefers reduced motion.
 *
 * Motion is opt-in per surface — it is never applied to data grids or
 * anything that re-renders on every keystroke.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

type MotionProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Optional viewport margin for scroll-triggered reveals. */
  once?: boolean;
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.32, ease: EASE },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: EASE },
  },
};

/** Parent that releases children one after another. */
export const staggerContainer = (stagger = 0.05, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/**
 * Fade + rise on mount. The default entrance for page content.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  once = true,
}: MotionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={reduced ? { duration: 0 } : { delay }}
      whileInView={once ? 'visible' : undefined}
      viewport={once ? { once: true, margin: '-64px' } : undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide-up entrance for lists and sections.
 */
export function SlideUp({
  children,
  className,
  delay = 0,
  once = true,
}: MotionProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={slideUp}
      initial="hidden"
      animate="visible"
      whileInView={once ? 'visible' : undefined}
      viewport={once ? { once: true, margin: '-64px' } : undefined}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list entrance. Wrap items in <StaggerItem>.
 */
export function Stagger({
  children,
  className,
  stagger = 0.05,
  delay = 0,
}: MotionProps & { stagger?: number }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={slideUp}>
      {children}
    </motion.div>
  );
}

/**
 * Gentle lift on hover. Use on interactive cards only — applying it to
 * dense lists makes the page feel jittery.
 */
export function ScaleHover({
  children,
  className,
  lift = 2,
}: {
  children: ReactNode;
  className?: string;
  /** Pixels to lift. 0 disables the effect. */
  lift?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduced || lift === 0 ? undefined : { y: -lift }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slow breathing pulse for "AI is working" indicators.
 */
export function PulseGlow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={cn('inline-flex', className)}
      animate={reduced ? undefined : { opacity: [1, 0.55, 1] }}
      transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.span>
  );
}

export { motion, AnimatePresence } from 'framer-motion';
