"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeIn, fadeUp, scaleIn, stagger, VIEWPORT } from "@/lib/motion";

/*
 * Scroll reveal wrappers. Use these instead of writing motion code in sections.
 *
 *   <Reveal>…</Reveal>                     fade up once when 20% is visible
 *   <Reveal variant="scale">…</Reveal>     images: fade in from 96% scale
 *   <RevealGroup><RevealItem/>…</RevealGroup>  children enter one after another
 *
 * Reduced motion is handled once, in MotionProvider: movement is removed and
 * the fade stays.
 */

const variants = { up: fadeUp, fade: fadeIn, scale: scaleIn };

type RevealProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  as?: "div" | "li" | "article";
  className?: string;
};

export function Reveal({ children, variant = "up", as = "div", className }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={variants[variant]} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </Tag>
  );
}

type RevealGroupProps = { children: ReactNode; as?: "div" | "ul"; className?: string };

export function RevealGroup({ children, as = "div", className }: RevealGroupProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={stagger} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </Tag>
  );
}

/** A child of RevealGroup. Inherits the group's trigger, so no viewport of its own. */
export function RevealItem({ children, variant = "up", as = "div", className }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={variants[variant]}>
      {children}
    </Tag>
  );
}
