import { ViewTransition } from "react";

/**
 * Wraps a route's content so navigating between pages wipes rather than cuts.
 *
 * The wipe runs along the same up-and-to-the-right diagonal the dandelions take
 * on the way in, so moving around the site feels like the same wind is still
 * blowing. Animation lives in `globals.css` under `::view-transition-*`.
 *
 * Goes in each `page.tsx`, never the layout — layouts persist across
 * navigation, so enter and exit would never fire there. Browsers without the
 * View Transitions API simply cut, which is the pre-existing behaviour.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
