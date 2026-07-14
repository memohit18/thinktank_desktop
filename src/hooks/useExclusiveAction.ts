'use client';

import { useCallback, useRef, useState } from 'react';

type ExclusiveActionOptions = {
  /** Ignore repeat clicks for this long after an action finishes. Default 400ms. */
  cooldownMs?: number;
};

/**
 * Prevents double-submits / double API calls from rapid button clicks.
 * Locks synchronously on the first call (before awaits), then keeps a short cooldown.
 */
export function useExclusiveAction(options: ExclusiveActionOptions = {}) {
  const cooldownMs = options.cooldownMs ?? 400;
  const lockedRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const clearCooldown = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const releaseAfterCooldown = useCallback(() => {
    clearCooldown();
    cooldownTimerRef.current = setTimeout(() => {
      lockedRef.current = false;
      setIsLocked(false);
      cooldownTimerRef.current = null;
    }, cooldownMs);
  }, [clearCooldown, cooldownMs]);

  const runExclusive = useCallback(
    async <T,>(action: () => Promise<T> | T): Promise<T | undefined> => {
      if (lockedRef.current) return undefined;

      lockedRef.current = true;
      setIsLocked(true);
      clearCooldown();

      try {
        return await action();
      } finally {
        releaseAfterCooldown();
      }
    },
    [clearCooldown, releaseAfterCooldown],
  );

  /** Wrap an event handler so duplicate clicks are ignored. */
  const exclusiveHandler = useCallback(
    <TArgs extends unknown[]>(
      handler: (...args: TArgs) => Promise<unknown> | unknown,
    ) => {
      return (...args: TArgs) => {
        void runExclusive(() => handler(...args));
      };
    },
    [runExclusive],
  );

  return {
    isLocked,
    runExclusive,
    exclusiveHandler,
  };
}

/**
 * Module-level in-flight guard for async fns that must not overlap
 * (e.g. hooks that expose upload/save methods).
 */
export function createInFlightGuard() {
  let inFlight = false;

  return async function runGuarded<T>(
    action: () => Promise<T>,
  ): Promise<T | undefined> {
    if (inFlight) return undefined;
    inFlight = true;
    try {
      return await action();
    } finally {
      inFlight = false;
    }
  };
}
