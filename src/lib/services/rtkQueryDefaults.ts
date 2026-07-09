export const RTK_QUERY_DEFAULTS = {
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
} as const;

/** Drop cached query data as soon as no component is subscribed. */
export const RTK_QUERY_FRESH_CACHE = {
  ...RTK_QUERY_DEFAULTS,
  keepUnusedDataFor: 0,
} as const;
