import type { BulkUploadPayload, BulkUploadResponse } from '@/lib/code/bulkUpload';
import type { QuestionSubmissionPayload } from '@/lib/code/submissionMapper';
import type {
  QuestionSubmissionsParams,
  QuestionSubmissionsResponse,
} from '@/lib/code/submissionTypes';
import { apiSlice } from './apiSlice';
import type { CodeQuestion } from '@/lib/code/questions';
import type { ProblemListResponse } from '@/lib/code/problemTypes';
import {
  mapRemoteQuestionDetailToCodeQuestion,
  mapRemoteQuestionsResponse,
  type RemoteQuestionDetail,
  type RemoteQuestionsResponse,
} from '@/lib/code/questionMappers';

export type ProblemListParams = {
  category?: string;
  difficulty?: string;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type QuestionFiltersResponse = {
  categories: string[];
  tags: string[];
  difficulties: string[];
};

function resolveCategoryParam(category?: string) {
  if (!category || category === 'all') return undefined;
  return category;
}

export function buildProblemsQueryString(params: ProblemListParams = {}) {
  const searchParams = new URLSearchParams();

  const category = resolveCategoryParam(params.category);
  if (category) searchParams.set('category', category);
  if (params.difficulty && params.difficulty !== 'all') {
    searchParams.set('difficulty', params.difficulty);
  }
  if (params.tags) searchParams.set('tags', params.tags);
  if (params.search) searchParams.set('search', params.search);
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 20));

  return searchParams.toString();
}

export function buildSubmissionsQueryString(
  params: Pick<QuestionSubmissionsParams, 'page' | 'limit'> = {},
) {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 20));
  return searchParams.toString();
}

export const problemsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionFilters: builder.query<QuestionFiltersResponse, void>({
      query: () => '/questions/filters',
      providesTags: ['QuestionFilters'],
    }),
    getProblems: builder.query<ProblemListResponse, ProblemListParams | void>({
      query: (params) => {
        const query = buildProblemsQueryString(params ?? {});
        return `/questions?${query}`;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const query = buildProblemsQueryString((queryArgs ?? {}) as ProblemListParams);
        return `${endpointName}?${query}`;
      },
      transformResponse: (response: RemoteQuestionsResponse) =>
        mapRemoteQuestionsResponse(response),
      providesTags: ['Problems'],
    }),
    getQuestionById: builder.query<CodeQuestion, number | string>({
      query: (questionId) => `/questions/${questionId}`,
      transformResponse: (response: RemoteQuestionDetail) =>
        mapRemoteQuestionDetailToCodeQuestion(response),
      providesTags: (_result, _error, questionId) => [
        { type: 'Problems', id: String(questionId) },
      ],
    }),
    submitQuestion: builder.mutation<
      unknown,
      { questionId: number | string; body: QuestionSubmissionPayload }
    >({
      query: ({ questionId, body }) => ({
        url: `/questions/${questionId}/submissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { questionId }) => [
        { type: 'Submissions', id: String(questionId) },
        'UserProgress',
      ],
    }),
    getQuestionSubmissions: builder.query<
      QuestionSubmissionsResponse,
      QuestionSubmissionsParams
    >({
      query: ({ questionId, page, limit }) => {
        const query = buildSubmissionsQueryString({ page, limit });
        return `/questions/${questionId}/submissions?${query}`;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const query = buildSubmissionsQueryString({
          page: queryArgs.page,
          limit: queryArgs.limit,
        });
        return `${endpointName}-${queryArgs.questionId}?${query}`;
      },
      providesTags: (_result, _error, { questionId }) => [
        { type: 'Submissions', id: String(questionId) },
      ],
    }),
    bulkUploadQuestions: builder.mutation<BulkUploadResponse, BulkUploadPayload>({
      query: (body) => ({
        url: '/questions/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Problems', 'QuestionFilters'],
    }),
  }),
});

export const {
  useGetQuestionFiltersQuery,
  useGetProblemsQuery,
  useGetQuestionByIdQuery,
  useGetQuestionSubmissionsQuery,
  useSubmitQuestionMutation,
  useBulkUploadQuestionsMutation,
} = problemsApi;
