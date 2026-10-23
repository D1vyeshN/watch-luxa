import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * false during server rendering and hydration, true afterwards — for reading
 * browser-only state (localStorage, the resolved theme) without the
 * "setMounted(true) in an effect" pattern.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
