import type {
  CreateRoadmapPayload,
  Roadmap,
  RoadmapsParams,
  RoadmapsResponse,
} from '@/lib/code/roadmapTypes';
import { apiSlice } from './apiSlice';

export function buildRoadmapsQueryString(params: RoadmapsParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 20));
  return searchParams.toString();
}

export const roadmapsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<RoadmapsResponse, RoadmapsParams | void>({
      query: (params) => {
        const query = buildRoadmapsQueryString(params ?? {});
        return `/roadmaps?${query}`;
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const query = buildRoadmapsQueryString((queryArgs ?? {}) as RoadmapsParams);
        return `${endpointName}?${query}`;
      },
      providesTags: ['Roadmaps'],
    }),
    activateRoadmap: builder.mutation<Roadmap, string>({
      query: (roadmapId) => ({
        url: `/roadmaps/${roadmapId}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['Roadmaps', 'Problems', 'QuestionFilters', 'UserProgress'],
    }),
    createRoadmap: builder.mutation<Roadmap, CreateRoadmapPayload>({
      query: (body) => ({
        url: '/roadmaps',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roadmaps', 'Problems', 'QuestionFilters', 'UserProgress'],
    }),
  }),
});

export const {
  useGetRoadmapsQuery,
  useActivateRoadmapMutation,
  useCreateRoadmapMutation,
} = roadmapsApi;
