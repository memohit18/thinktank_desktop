import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return fallback;
  }

  const fetchError = error as FetchBaseQueryError;

  if (fetchError.status === 'FETCH_ERROR') {
    return 'Network error. Please try again.';
  }

  if (fetchError.status === 'PARSING_ERROR') {
    return 'Unexpected server response. Please try again.';
  }

  if (
    typeof fetchError.data === 'object' &&
    fetchError.data !== null &&
    'message' in fetchError.data
  ) {
    return String((fetchError.data as { message: string }).message);
  }

  if (typeof fetchError.data === 'string' && fetchError.data) {
    return fetchError.data;
  }

  return fallback;
}
