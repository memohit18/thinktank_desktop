import { apiSlice } from '@/lib/services/apiSlice';
import type { ApiFitnessProfile } from '@/lib/fitness/fitForgeApiTypes';
import {
  type FitForgeResponse,
  unwrapFitForgeData,
} from '@/lib/fitness/fitForgeResponse';

export type FitnessMetrics = {
  bmi: number;
  bmr: number;
  tdee: number;
  proteinTarget: number;
  dailyCalorieTarget: number;
};

export type PhysiqueGoal = {
  id: string;
  name: string;
  description: string;
  targetBodyFatMin: number;
  targetBodyFatMax: number;
  imageUrl: string | null;
  createdAt: string;
};

export type CreateFitnessProfilePayload = {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  dietType: string;
  fitnessGoal: string;
  physiqueGoalId: string;
  targetWeightKg?: number;
  targetBodyFat?: number;
  workoutDaysPerWeek: number;
  experienceLevel: string;
  budgetPreference: string;
  workoutMode: string;
};

export type UpdateFitnessProfilePayload = Partial<CreateFitnessProfilePayload>;

export const fitnessProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFitnessProfile: builder.query<ApiFitnessProfile, void>({
      query: () => '/fitness-profile',
      transformResponse: (response: FitForgeResponse<ApiFitnessProfile>) =>
        unwrapFitForgeData(response),
      providesTags: ['FitnessProfile'],
    }),
    getFitnessMetrics: builder.query<FitnessMetrics, void>({
      query: () => '/fitness-profile/metrics',
      transformResponse: (response: FitForgeResponse<FitnessMetrics>) =>
        unwrapFitForgeData(response),
      providesTags: ['FitnessProfile'],
    }),
    getPhysiqueGoals: builder.query<PhysiqueGoal[], void>({
      query: () => '/physique-goals',
      transformResponse: (response: FitForgeResponse<PhysiqueGoal[]>) =>
        unwrapFitForgeData(response),
      providesTags: ['PhysiqueGoals'],
    }),
    createFitnessProfile: builder.mutation<
      ApiFitnessProfile,
      CreateFitnessProfilePayload
    >({
      query: (body) => ({
        url: '/fitness-profile',
        method: 'POST',
        body,
      }),
      transformResponse: (response: FitForgeResponse<ApiFitnessProfile>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitnessProfile', 'FitForge'],
    }),
    updateFitnessProfile: builder.mutation<
      ApiFitnessProfile,
      UpdateFitnessProfilePayload
    >({
      query: (body) => ({
        url: '/fitness-profile',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: FitForgeResponse<ApiFitnessProfile>) =>
        unwrapFitForgeData(response),
      invalidatesTags: ['FitnessProfile', 'FitForge'],
    }),
  }),
});

export const {
  useGetFitnessProfileQuery,
  useGetFitnessMetricsQuery,
  useGetPhysiqueGoalsQuery,
  useCreateFitnessProfileMutation,
  useUpdateFitnessProfileMutation,
} = fitnessProfileApi;
