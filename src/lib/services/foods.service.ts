import type {
  CreateFoodPayload,
  UpdateFoodPayload,
} from '@/lib/fitness/food/types';

export const foodsService = {
  createCustom(payload: CreateFoodPayload) {
    return {
      url: '/foods/custom',
      method: 'POST' as const,
      body: payload,
    };
  },
  createCatalog(payload: CreateFoodPayload) {
    return {
      url: '/foods',
      method: 'POST' as const,
      body: payload,
    };
  },
  update(foodId: string, payload: UpdateFoodPayload) {
    return {
      url: `/foods/${foodId}`,
      method: 'PATCH' as const,
      body: payload,
    };
  },
};
