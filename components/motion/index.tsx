"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * The site's motion vocabulary.
 *
 * Every page is built from these, so the whole thing moves with one accent
 * instead of five. Two rules hold throughout:
 *
 *   1. `prefers-reduced-motion` collapses each of these to its final state.
 *      Not a shorter animation — no animation.
 *   2. Anything that runs per-frame writes to a ref or a MotionValue, never to
 *      React state, so scrolling never triggers a render.
 */

/** The house easing. Same curve as the dandelion transition. */
export const EASE = [0.22, 1, 0.36, 1] as const;

// ── reveal ──────────────────────────────────────────────────────────────

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Travel distance in px. Negative comes from below. */
  y?: number;
  x?: number;
  /** Adds a soft focus-in. Costs a filter, so it's off by default. */
  blur?: boolean;
  /** Fraction of the element that must be visible. */
  amount?: number;
  style?: CSSProperties;
  id?: string;
};

/** Fades and lifts into place the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  x = 0,
  blur = false,
  amount = 0.25,
  style,
  id,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      initial={{
        opacity: 0,
        y,
        x,
        filter: blur ? "blur(10px)" : undefined,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        filter: blur ? "blur(0px)" : undefined,
      }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const PARENT_TAGS = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  section: motion.section,
} as const;

const CHILD_TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
} as const;

/** Wraps a list so its `StaggerItem` children arrive one after another. */
export function Stagger({
  children,
  className,
  amount = 0.15,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  as?: keyof typeof PARENT_TAGS;
}) {
  const reduced = usePrefersReducedMotion();
  const Component = PARENT_TAGS[as];
  const Plain = as;

  if (reduced) return <Plain className={className}>{children}</Plain>;

  return (
    <Component
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: keyof typeof CHILD_TAGS;
  style?: CSSProperties;
}) {
  const reduced = usePrefersReducedMotion();
  const Component = CHILD_TAGS[as];
  const Plain = as;

  if (reduced)
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    );

  return (
    <Component className={className} style={style} variants={staggerChild}>
      {children}
    </Component>
  );
}

// ── counter ─────────────────────────────────────────────────────────────

/**
 * Counts up when it scrolls into view.
 *
 * Writes straight to `textContent` rather than through state — a counter that
 * re-rendered sixty times a second would drag the whole section with it.
 */
export function Counter({
  to,
  from = 0,
  duration = 1.6,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (v: number) =>
      (el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`);

    // Reduced motion lands on the answer immediately; off-screen counters wait
    // at their starting value.
    if (reduced) {
      write(to);
      return;
    }
    if (!inView) {
      write(from);
      return;
    }

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate: write,
    });
    return () => controls.stop();
  }, [inView, reduced, from, to, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {from.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ── tilt ────────────────────────────────────────────────────────────────

/**
 * A card that leans towards the pointer, with a specular sheen tracking the
 * same position — the trading-card treatment on the Projects page.
 *
 * The rotation runs through springs so a fast flick across the grid settles
 * instead of snapping, and the sheen is a CSS custom property so the browser
 * composites it without a React render.
 */
export function TiltCard({
  children,
  className = "",
  strength = 8,
  sheen = true,
  glare = "rgba(255,255,255,0.55)",
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  strength?: number;
  sheen?: boolean;
  glare?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [strength, -strength]), {
    stiffness: 220,
    damping: 26,
  });
  const ry = useSpring(useTransform(px, [0, 1], [-strength, strength]), {
    stiffness: 220,
    damping: 26,
  });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx);
    py.set(ny);
    el.style.setProperty("--mx", `${nx * 100}%`);
    el.style.setProperty("--my", `${ny * 100}%`);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    ref.current?.style.setProperty("--mx", "50%");
    ref.current?.style.setProperty("--my", "50%");
  };

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(38% 44% at var(--mx,50%) var(--my,50%), ${glare} 0%, transparent 72%)`,
            mixBlendMode: "soft-light",
          }}
        />
      )}
    </motion.div>
  );
}

// ── magnetic ────────────────────────────────────────────────────────────

/** Drifts towards the cursor and springs back. For the one or two big CTAs. */
export function Magnetic({
  children,
  className = "",
  radius = 26,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20 });

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set(((e.clientX - (r.left + r.width / 2)) / r.width) * radius * 2);
        y.set(((e.clientY - (r.top + r.height / 2)) / r.height) * radius * 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

// ── scroll progress ─────────────────────────────────────────────────────

/** The thin XP bar pinned under the header. */
export function ScrollProgressBar({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={`origin-left ${className}`}
      style={{ scaleX }}
    />
  );
}

/** Parallax helper: returns a style object that drifts as `ref` crosses view. */
export function useParallax(distance = 60) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [distance, -distance],
  );
  return { ref, y };
}

// ── split text ──────────────────────────────────────────────────────────

/**
 * Reveals a line word by word.
 *
 * Words are wrapped in an overflow-hidden span so each one rises out of its own
 * mask rather than fading in place — the difference between "animated text" and
 * text that feels typeset.
 */
export function SplitReveal({
  text,
  className = "",
  wordClassName = "",
  delay = 0,
  stagger = 0.045,
  lang,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  lang?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return (
      <span className={className} lang={lang}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      lang={lang}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
        >
          <motion.span
            className={`inline-block ${wordClassName}`}
            variants={{
              hidden: { y: "115%", opacity: 0 },
              shown: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.72, ease: EASE },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ── marquee ─────────────────────────────────────────────────────────────

/**
 * An endless horizontal ticker.
 *
 * Pure CSS translation of a duplicated track — no JS in the loop at all, so it
 * keeps running smoothly while the main thread is busy elsewhere. The copy is
 * `aria-hidden`, so a screen reader hears the list once.
 */
export function Marquee({
  children,
  speed = 38,
  reverse = false,
  className = "",
  pauseOnHover = true,
}: {
  children: ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className={`marquee group/marquee relative flex w-full overflow-hidden ${className}`}
      data-paused={reduced ? "true" : undefined}
      data-hoverpause={pauseOnHover ? "true" : undefined}
    >
      <div
        className="marquee-track flex shrink-0 items-center gap-4 pr-4"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="marquee-track flex shrink-0 items-center gap-4 pr-4"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}
