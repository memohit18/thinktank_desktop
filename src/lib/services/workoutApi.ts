import {
  isFitnessErrorEnvelope,
  isMissingFitnessProfileStatus,
} from '@/lib/fitness/fitnessResponse';
import {
  unwrapActiveWorkout,
  unwrapTodayWorkout,
  unwrapWorkoutHistory,
  unwrapWorkoutSession,
  unwrapWorkoutSet,
} from '@/lib/fitness/workout/workoutResponse';
import type {
  ActiveWorkoutPlan,
  CompleteExercisePayload,
  EndWorkoutSessionPayload,
  LogSetPayload,
  UpdateSetPayload,
  WorkoutDay,
  WorkoutHistoryResponse,
  WorkoutSession,
  WorkoutSetLog,
} from '@/lib/fitness/workout/types';
import {
  workoutService,
  type WorkoutHistoryParams,
} from '@/lib/services/workout.service';
import { apiSlice } from './apiSlice';
import {
  RTK_QUERY_FRESH_CACHE,
  invalidateTagsOnSuccess,
  withQueryDefaults,
} from './rtkQueryDefaults';

export type { WorkoutHistoryParams };

const workoutQueryOptions = {
  keepUnusedDataFor: RTK_QUERY_FRESH_CACHE.keepUnusedDataFor,
};

export const workoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayWorkout: builder.query<WorkoutDay | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(workoutService.today());
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: null };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapTodayWorkout(result.data) };
      },
      providesTags: ['Workout'],
      ...workoutQueryOptions,
    }),
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
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapActiveWorkout(result.data) };
      },
      providesTags: ['Workout'],
      ...workoutQueryOptions,
    }),
    getWorkoutHistory: builder.query<
      WorkoutHistoryResponse,
      WorkoutHistoryParams | void
    >({
      async queryFn(params, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(
          workoutService.history(params ?? undefined),
        );
        if (result.error) return { data: { items: [] } };
        if (isFitnessErrorEnvelope(result.data)) return { data: { items: [] } };
        return { data: unwrapWorkoutHistory(result.data) };
      },
      providesTags: ['Workout'],
      ...workoutQueryOptions,
    }),
    getActiveWorkoutSession: builder.query<WorkoutSession | null, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const result = await baseQuery(workoutService.activeSession());
        if (result.error) {
          if (
            isMissingFitnessProfileStatus(result.error.status) ||
            result.error.status === 404
          ) {
            return { data: null };
          }
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapWorkoutSession(result.data) };
      },
      providesTags: ['Workout'],
      ...workoutQueryOptions,
    }),
    getWorkoutSession: builder.query<WorkoutSession | null, string>({
      async queryFn(sessionId, _queryApi, _extraOptions, baseQuery) {
        if (!sessionId) return { data: null };
        const result = await baseQuery(workoutService.session(sessionId));
        if (result.error) {
          if (result.error.status === 404) return { data: null };
          return { error: result.error };
        }
        if (isFitnessErrorEnvelope(result.data)) return { data: null };
        return { data: unwrapWorkoutSession(result.data) };
      },
      providesTags: ['Workout'],
      ...workoutQueryOptions,
    }),
    generateWorkoutPlan: builder.mutation<ActiveWorkoutPlan | null, void>({
      query: () => workoutService.generate(),
      transformResponse: (response: unknown) => unwrapActiveWorkout(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data) return;
          dispatch(
            workoutApi.util.updateQueryData(
              'getActiveWorkout',
              undefined,
              () => data,
            ),
          );
          if (data.today) {
            dispatch(
              workoutApi.util.updateQueryData(
                'getTodayWorkout',
                undefined,
                () => data.today,
              ),
            );
          }
        } catch {
          // keep previous cache
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    activateWorkoutPlan: builder.mutation<ActiveWorkoutPlan | null, string>({
      query: (planId) => workoutService.activate(planId),
      transformResponse: (response: unknown) => unwrapActiveWorkout(response),
      async onQueryStarted(_planId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data) return;
          dispatch(
            workoutApi.util.updateQueryData(
              'getActiveWorkout',
              undefined,
              () => data,
            ),
          );
          if (data.today) {
            dispatch(
              workoutApi.util.updateQueryData(
                'getTodayWorkout',
                undefined,
                () => data.today,
              ),
            );
          }
        } catch {
          // keep previous cache
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    startWorkoutSession: builder.mutation<
      WorkoutSession | null,
      string | void
    >({
      query: (workoutPlanDayId) =>
        workoutService.start(
          typeof workoutPlanDayId === 'string' ? workoutPlanDayId : undefined,
        ),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin', 'Dashboard']),
    }),
    pauseWorkoutSession: builder.mutation<WorkoutSession | null, string>({
      query: (sessionId) => workoutService.pause(sessionId),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    resumeWorkoutSession: builder.mutation<WorkoutSession | null, string>({
      query: (sessionId) => workoutService.resume(sessionId),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    endWorkoutSession: builder.mutation<
      WorkoutSession | null,
      EndWorkoutSessionPayload
    >({
      query: (body) => workoutService.finish(body),
      transformResponse: (response: unknown) => unwrapWorkoutSession(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin', 'Dashboard']),
    }),
    logWorkoutSet: builder.mutation<WorkoutSetLog | null, LogSetPayload>({
      query: (body) => workoutService.completeSet(body),
      transformResponse: (response: unknown) => unwrapWorkoutSet(response),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const pushSet = (exercise: { loggedSets: WorkoutSetLog[]; restSeconds: number } | undefined) => {
          if (!exercise) return;
          exercise.loggedSets.push({
            id: `temp-${Date.now()}`,
            setNumber: body.setNumber ?? exercise.loggedSets.length + 1,
            reps: body.reps,
            weightKg: body.weight,
            completed: true,
            restSeconds: body.restSeconds ?? exercise.restSeconds,
          });
        };

        const patchToday = dispatch(
          workoutApi.util.updateQueryData(
            'getTodayWorkout',
            undefined,
            (draft) => {
              if (!draft) return;
              pushSet(
                draft.exercises.find((item) => item.id === body.exerciseId),
              );
            },
          ),
        );
        const patchSession = body.sessionId
          ? dispatch(
              workoutApi.util.updateQueryData(
                'getWorkoutSession',
                body.sessionId,
                (draft) => {
                  if (!draft) return;
                  if (!draft.exercises) draft.exercises = [];
                  pushSet(
                    draft.exercises.find((item) => item.id === body.exerciseId),
                  );
                },
              ),
            )
          : null;
        const patchActiveSession = dispatch(
          workoutApi.util.updateQueryData(
            'getActiveWorkoutSession',
            undefined,
            (draft) => {
              if (!draft) return;
              if (!draft.exercises) draft.exercises = [];
              pushSet(
                draft.exercises.find((item) => item.id === body.exerciseId),
              );
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchToday.undo();
          patchSession?.undo();
          patchActiveSession.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    updateWorkoutSet: builder.mutation<WorkoutSetLog | null, UpdateSetPayload>({
      query: (body) => workoutService.updateSet(body),
      transformResponse: (response: unknown) => unwrapWorkoutSet(response),
      invalidatesTags: invalidateTagsOnSuccess(['Workout']),
    }),
    completeWorkoutExercise: builder.mutation<
      unknown,
      CompleteExercisePayload
    >({
      query: (body) => workoutService.completeExercise(body),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const mark = (
          exercise:
            | { completed: boolean; skipped: boolean }
            | undefined,
        ) => {
          if (!exercise) return;
          if (body.skip) {
            exercise.skipped = true;
            exercise.completed = false;
          } else {
            exercise.completed = true;
            exercise.skipped = false;
          }
        };

        const patchToday = dispatch(
          workoutApi.util.updateQueryData(
            'getTodayWorkout',
            undefined,
            (draft) => {
              if (!draft) return;
              mark(draft.exercises.find((item) => item.id === body.exerciseId));
            },
          ),
        );
        const patchActive = dispatch(
          workoutApi.util.updateQueryData(
            'getActiveWorkout',
            undefined,
            (draft) => {
              if (!draft?.today) return;
              mark(
                draft.today.exercises.find(
                  (item) => item.id === body.exerciseId,
                ),
              );
            },
          ),
        );
        const patchSession = body.sessionId
          ? dispatch(
              workoutApi.util.updateQueryData(
                'getWorkoutSession',
                body.sessionId,
                (draft) => {
                  if (!draft) return;
                  if (!draft.exercises) draft.exercises = [];
                  let exercise = draft.exercises.find(
                    (item) => item.id === body.exerciseId,
                  );
                  if (!exercise) {
                    exercise = {
                      id: body.exerciseId,
                      name: 'Exercise',
                      targetSets: 0,
                      targetReps: null,
                      targetWeightKg: null,
                      restSeconds: 60,
                      order: draft.exercises.length,
                      completed: false,
                      skipped: false,
                      loggedSets: [],
                    };
                    draft.exercises.push(exercise);
                  }
                  mark(exercise);
                },
              ),
            )
          : null;
        const patchActiveSession = dispatch(
          workoutApi.util.updateQueryData(
            'getActiveWorkoutSession',
            undefined,
            (draft) => {
              if (!draft) return;
              if (!draft.exercises) draft.exercises = [];
              let exercise = draft.exercises.find(
                (item) => item.id === body.exerciseId,
              );
              if (!exercise) {
                exercise = {
                  id: body.exerciseId,
                  name: 'Exercise',
                  targetSets: 0,
                  targetReps: null,
                  targetWeightKg: null,
                  restSeconds: 60,
                  order: draft.exercises.length,
                  completed: false,
                  skipped: false,
                  loggedSets: [],
                };
                draft.exercises.push(exercise);
              }
              mark(exercise);
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch (err) {
          const error = err as { error?: { data?: unknown } };
          const data = error.error?.data;
          const message =
            data &&
            typeof data === 'object' &&
            'message' in data &&
            typeof (data as { message: unknown }).message === 'string'
              ? (data as { message: string }).message
              : '';
          // Keep optimistic state when backend already marked it done.
          if (/already completed|already skipped/i.test(message)) return;
          patchToday.undo();
          patchActive.undo();
          patchSession?.undo();
          patchActiveSession.undo();
        }
      },
      invalidatesTags: invalidateTagsOnSuccess(['Workout', 'Checkin', 'Dashboard']),
    }),
  }),
  overrideExisting: true,
});

export const useGetTodayWorkoutQuery = withQueryDefaults(
  workoutApi.useGetTodayWorkoutQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetActiveWorkoutQuery = withQueryDefaults(
  workoutApi.useGetActiveWorkoutQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetActiveWorkoutSessionQuery = withQueryDefaults(
  workoutApi.useGetActiveWorkoutSessionQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetWorkoutHistoryQuery = withQueryDefaults(
  workoutApi.useGetWorkoutHistoryQuery,
  RTK_QUERY_FRESH_CACHE,
);
export const useGetWorkoutSessionQuery = withQueryDefaults(
  workoutApi.useGetWorkoutSessionQuery,
  RTK_QUERY_FRESH_CACHE,
);

export const {
  useGenerateWorkoutPlanMutation,
  useActivateWorkoutPlanMutation,
  useStartWorkoutSessionMutation,
  usePauseWorkoutSessionMutation,
  useResumeWorkoutSessionMutation,
  useEndWorkoutSessionMutation,
  useLogWorkoutSetMutation,
  useUpdateWorkoutSetMutation,
  useCompleteWorkoutExerciseMutation,
} = workoutApi;
