import { apiSlice } from './apiSlice';

export type CodeSessionResponse = {
  authenticated: boolean;
  module: string;
  userId: string;
  email: string | null;
  role: string;
  sessionStartedAt: string;
  track: {
    name: string;
    totalProblems: number;
    categories: number;
  };
  message: string;
};

export const codeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCodeSession: builder.query<CodeSessionResponse, void>({
      query: () => '/code/session',
      providesTags: ['CodeSession'],
    }),
  }),
});

export const { useGetCodeSessionQuery } = codeApi;
