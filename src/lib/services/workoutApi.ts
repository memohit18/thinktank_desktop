import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  unwrapActiveWorkout,
  unwrapWorkoutSession,
} from '@/lib/fitness/execution/executionResponse';
import type {
  ActiveWorkoutPlan,
  CompleteExercisePayload,
  EndWorkoutSessionPayload,
  WorkoutSession,
} from '@/lib/fitness/execution/types';
import { workoutService } from '@/lib/services/workout.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export const workoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveWorkout: builder.query<ActiveWorkoutPlan | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(workoutService.active());
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: null };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) {
          return { data: null };
        }
        return { data: unwrapActiveWorkout(result.data) };
      },
      providesTags: ['Workout'],
      keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
    }),
    startWorkoutSession: builder.mutation<WorkoutSession | null, string>({
      query: (workoutPlanDayId) =>
        workoutService.startSession(workoutPlanDayId),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin']),
    }),
    completeWorkoutExercise: builder.mutation<
      unknown,
      CompleteExercisePayload
    >({
      query: (body) => workoutService.completeExercise(body),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          workoutApi.util.updateQueryData(
            'getActiveWorkout',
            undefined,
            (draft) => {
              if (!draft) return;
              const mark = (day: typeof draft.today) => {
                if (!day) return;
                const exercise = day.exercises.find(
                  (item) => item.id === body.workoutPlanExerciseId,
                );
                if (exercise) exercise.completed = true;
              };
              mark(draft.today);
              for (const day of draft.days) mark(day);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin']),
    }),
    endWorkoutSession: builder.mutation<
      WorkoutSession | null,
      EndWorkoutSessionPayload
    >({
      query: (body) => workoutService.endSession(body),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin']),
    }),
  }),
  overrideExisting: true,
});

export const useGetActiveWorkoutQuery = withQueryDefaults(
  workoutApi.useGetActiveWorkoutQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const {
  useStartWorkoutSessionMutation,
  useCompleteWorkoutExerciseMutation,
  useEndWorkoutSessionMutation,
} = workoutApi;
