export type FitForgeResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type FitForgePaginatedData<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function unwrapFitForgeData<T>(response: FitForgeResponse<T> | T): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response
  ) {
    return (response as FitForgeResponse<T>).data;
  }

  return response as T;
}
