import { useEffect, useState } from "react";

/**
 * The value, once it has stopped changing for `delay` ms.
 *
 * Every search box used to fire a counted query on each keystroke, so typing a
 * nine-letter name sent nine `count: exact` requests.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
