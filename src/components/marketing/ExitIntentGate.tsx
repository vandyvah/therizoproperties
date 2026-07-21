import { useLocation } from "react-router-dom";
import { ExitIntent } from "./ExitIntent";

// High-value routes where an exit-intent briefing offer makes sense.
const MATCHERS: Array<RegExp> = [
  /^\/calculator(\/.*)?$/,
  /^\/team\/?$/,
  /^\/locations\/[a-z-]+\/?$/,
  /^\/guides\/[a-z-]+\/?$/,
  /^\/properties\/[a-z0-9-]+\/?$/, // property detail (not the /properties index)
];

/** Mounts <ExitIntent /> only on high-value marketing pages. */
export function ExitIntentGate() {
  const { pathname } = useLocation();
  const active = MATCHERS.some((r) => r.test(pathname));
  if (!active) return null;
  return <ExitIntent />;
}
