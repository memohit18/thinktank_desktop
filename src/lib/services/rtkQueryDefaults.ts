export type QuerySubscriptionOptions = {
  refetchOnMountOrArgChange?: boolean | number;
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
  pollingInterval?: number;
  skipPollingIfUnfocused?: boolean;
};

/** Default RTK Query behavior for most app data. */
export const RTK_QUERY_DEFAULTS = {
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: true,
} as const;

/** Drop cached query data as soon as no component is subscribed. */
export const RTK_QUERY_FRESH_CACHE = {
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 0,
} as const;

/** Keep cached data and avoid refetching on routine UI interactions. */
export const RTK_QUERY_STABLE_CACHE = {
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  keepUnusedDataFor: 300,
} as const;

const QUERY_OPTION_KEYS = new Set([
  'refetchOnMountOrArgChange',
  'refetchOnFocus',
  'refetchOnReconnect',
  'pollingInterval',
  'skipPollingIfUnfocused',
  'skip',
  'selectFromResult',
]);

function isQueryOptions(value: unknown): value is QuerySubscriptionOptions {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).some((key) => QUERY_OPTION_KEYS.has(key))
  );
}

function mergeQueryOptions(
  defaults: QuerySubscriptionOptions,
  options?: QuerySubscriptionOptions,
) {
  if (!options) return defaults;
  return { ...defaults, ...options };
}

export function withQueryDefaults<Hook extends (...args: any[]) => any>(
  useQuery: Hook,
  defaults: QuerySubscriptionOptions,
): Hook {
  return ((arg?: unknown, options?: QuerySubscriptionOptions) => {
    if (isQueryOptions(arg)) {
      return useQuery(undefined, mergeQueryOptions(defaults, arg));
    }

    return useQuery(arg, mergeQueryOptions(defaults, options));
  }) as Hook;
}

type InvalidationTag = string | { type: string; id?: string | number };

/** RTK Query still invalidates static tags on failed mutations unless guarded. */
export function invalidateTagsOnSuccess<const T extends readonly InvalidationTag[]>(
  tags: T | ((result: unknown, arg: unknown) => T),
) {
  return (result: unknown, error: unknown, arg: unknown): T | [] => {
    if (error) return [];
    return typeof tags === 'function' ? tags(result, arg) : tags;
  };
}
