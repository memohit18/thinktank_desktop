'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useGetFoodCategoriesQuery,
  useGetFoodsQuery,
} from '@/lib/services/foodApi';

const DEFAULT_PAGE_SIZE = 20;

export function useFoods() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      category: categoryId !== 'all' ? categoryId : undefined,
    }),
    [categoryId, debouncedSearch, page],
  );

  const {
    data: foodsResult,
    isLoading: isFoodsLoading,
    isFetching: isFoodsFetching,
    isError: isFoodsError,
    refetch: refetchFoods,
  } = useGetFoodsQuery(queryParams);

  const {
    data: categoriesResult,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetFoodCategoriesQuery();

  const foods = foodsResult?.items ?? [];
  const meta = foodsResult?.meta;
  const categories = categoriesResult?.tabs ?? categoriesResult?.allowedCategories ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  return {
    foods,
    allFoods: foods,
    categories,
    categoriesResult,
    meta,
    search,
    setSearch: handleSearchChange,
    categoryId,
    setCategoryId: handleCategoryChange,
    page,
    setPage,
    canGoPrevious: (meta?.page ?? 1) > 1,
    canGoNext: (meta?.page ?? 1) < (meta?.totalPages ?? 0),
    isLoading: (isFoodsLoading && !foodsResult) || (isCategoriesLoading && !categoriesResult),
    isFetching: isFoodsFetching,
    isError: isFoodsError || isCategoriesError,
    refetch: () => {
      void refetchFoods();
      void refetchCategories();
    },
  };
}
