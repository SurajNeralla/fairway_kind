"use client";

import React, { useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * FrozenRouter:
 * Next.js App Router unmounts previous pages immediately on navigation.
 * To enable smooth exit transitions with AnimatePresence mode="wait",
 * FrozenRouter preserves the previous router context until the exit animation finishes.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: { children: PageTransitionProps['children'] }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Premium, calm, modern easing curve (cubic-bezier ease-out)
  const transitionEase = [0.22, 1, 0.36, 1];

  // Respect prefers-reduced-motion: minimal subtle opacity fade, zero movement
  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: {
          opacity: 0,
          y: 10,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        exit: {
          opacity: 0,
          y: -8,
        },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: shouldReduceMotion ? 0.15 : 0.35,
          ease: transitionEase,
        }}
        className="flex-1 flex flex-col w-full"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
