"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as [number, number, number, number];

type RevealMode = "scroll" | "load";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  className?: string;
  mode?: RevealMode;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.55,
  y = 16,
  x = 0,
  className,
  mode = "scroll",
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const from = { opacity: 0, y, x };
  const to = { opacity: 1, y: 0, x: 0 };
  const transition = { duration, ease: EASE_OUT_QUART, delay };

  if (mode === "load") {
    return (
      <motion.div initial={from} animate={to} transition={transition} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={from}
      whileInView={to}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: RevealMode;
  as?: "div" | "section" | "ul" | "dl";
}

export function StaggerGroup({
  children,
  className,
  delay = 0,
  stagger = 0.07,
  mode = "scroll",
  as = "div",
}: StaggerGroupProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delay,
      },
    },
  };

  const commonProps = {
    initial: reduce ? undefined : "hidden",
    variants: reduce ? undefined : variants,
    className,
  } as const;

  const inViewProps =
    mode === "scroll"
      ? {
          whileInView: reduce ? undefined : "show",
          viewport: { once: true, margin: "0px 0px -80px 0px" },
        }
      : { animate: reduce ? undefined : "show" };

  if (as === "section") {
    return (
      <motion.section {...commonProps} {...inViewProps}>
        {children}
      </motion.section>
    );
  }
  if (as === "ul") {
    return (
      <motion.ul {...commonProps} {...inViewProps}>
        {children}
      </motion.ul>
    );
  }
  if (as === "dl") {
    return (
      <motion.dl {...commonProps} {...inViewProps}>
        {children}
      </motion.dl>
    );
  }
  return (
    <motion.div {...commonProps} {...inViewProps}>
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  hover?: boolean;
}

export function StaggerItem({
  children,
  className,
  y = 16,
  duration = 0.5,
  hover = false,
}: StaggerItemProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT_QUART } },
  };

  return (
    <motion.div
      variants={variants}
      whileHover={hover && !reduce ? { y: -3, transition: { duration: 0.25, ease: EASE_OUT_QUART } } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
