"use client";

import { motion } from "motion/react";
import { Counter, EASE } from "@/components/motion";
import {
  experience,
  projects,
  skillCount,
  stack,
  yearsOfExperience,
} from "@/lib/content";

/**
 * Bento-grid stat cards for the homepage numbers section.
 *
 * A 4-column masonry-ish grid where each tile has:
 *   - A label + short description on the left
 *   - A large number anchored to the right
 *
 * Hovering a card scales it up with a soft glow while siblings dim — CSS :has()
 * keeps this off the React render path.
 */

type CardDatum = {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  /** Tailwind grid-column span. */
  span: string;
  large?: boolean;
};

const roleCount = experience.reduce((n, c) => n + c.roles.length, 0);
const cloudCount = stack.find((g) => g.id === "clouds")?.items.length ?? 0;
const companyCount = experience.length;

export function NumbersBento() {
  const cards: CardDatum[] = [
    {
      value: yearsOfExperience(),
      suffix: "+",
      label: "Years on call",
      detail:
        "Career started October 2022. Every year counted in production incidents, not calendar months.",
      span: "lg:col-span-2",
      large: true,
    },
    {
      value: companyCount,
      label: "Companies",
      detail:
        "Startups, research labs, data centres — remote, on-site, hybrid. Availability does not care where the desk is.",
      span: "lg:col-span-1",
    },
    {
      value: roleCount,
      label: "Roles held",
      detail:
        "Platform, DevOps, SRE, Infrastructure, Architecture. Different titles, same mission.",
      span: "lg:col-span-1",
    },
    {
      value: cloudCount,
      label: "Cloud providers",
      detail:
        "AWS, GCP, Azure, Cloudflare, Huawei, Alibaba, Oracle, IBM, DigitalOcean, OpenStack. One pattern, zero snowflakes.",
      span: "lg:col-span-1",
    },
    {
      value: skillCount,
      label: "Tools mastered",
      detail:
        "From kernel to browser — everything on the /stack page has seen production. Nothing listed from a tutorial.",
      span: "lg:col-span-1",
    },
    {
      value: projects.length,
      label: "Projects shipped",
      detail:
        "Products people use, infrastructure that stays up. Every one has a story and a diagram.",
      span: "lg:col-span-2",
      large: true,
    },
  ];

  return (
    <div
      className="
        bento-grid group/bento
        grid grid-cols-1 gap-3
        sm:grid-cols-2 sm:gap-4
        lg:grid-cols-4
        [&:has(.bento-card:hover)_.bento-card:not(:hover)]:opacity-50
      "
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          className={`
            bento-card glass group/card relative cursor-default
            rounded-[1.5rem] p-5 sm:p-6
            flex flex-col justify-between
            transition-[border-color,background-color] duration-500
            border border-white/60
            hover:border-sakura-300/70
            hover:bg-white/90
            ${card.span}
          `}
          whileHover={{
            scale: 1.015,
            boxShadow:
              "0 0 0 1px rgba(214,51,108,0.12), 0 12px 40px -14px rgba(214,51,108,0.18)",
          }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {/* Top row: label + description (left) and number (right) */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`
                  font-display font-extrabold tracking-[-0.01em] text-sakura-800
                  ${card.large ? "text-lg sm:text-xl" : "text-sm sm:text-base"}
                `}
              >
                {card.label}
              </p>
              <p
                className={`
                  mt-1.5 leading-relaxed text-ink-400
                  ${card.large ? "text-sm max-w-[28ch]" : "text-xs max-w-[22ch]"}
                `}
              >
                {card.detail}
              </p>
            </div>

            {/* Number — right-anchored, never shrinks */}
            <p
              className={`
                shrink-0 font-display font-extrabold leading-none tracking-[-0.03em]
                text-gradient
                ${card.large ? "text-[clamp(2.6rem,7vw,4.2rem)]" : "text-[clamp(2rem,5vw,2.8rem)]"}
              `}
            >
              <Counter
                to={card.value}
                suffix={card.suffix}
                duration={card.value > 20 ? 2.0 : 1.4}
              />
            </p>
          </div>

          {/* Subtle decorative glow on hover */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0 rounded-[inherit]
              bg-radial from-sakura-400/6 to-transparent opacity-0
              transition-opacity duration-500
              group-hover/card:opacity-100
            "
          />
        </motion.div>
      ))}
    </div>
  );
}
