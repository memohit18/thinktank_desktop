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

export function withQueryDefaults<Hook extends (...args: any[]) => any>(
  useQuery: Hook,
  defaults: QuerySubscriptionOptions,
): Hook {
  return ((arg: Parameters<Hook>[0], options?: QuerySubscriptionOptions) =>
    useQuery(arg, { ...defaults, ...options })) as Hook;
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
