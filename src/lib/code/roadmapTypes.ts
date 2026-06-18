export type RoadmapQuestionRef = {
  questionId: number;
  order: number;
  title?: string;
};

export type Roadmap = {
  roadmapId: string;
  userId?: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  questionCount: number;
  createdAt?: string;
  updatedAt?: string;
  questions?: RoadmapQuestionRef[];
};

export type RoadmapsResponse = {
  items: Roadmap[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RoadmapsParams = {
  page?: number;
  limit?: number;
};

export type CreateRoadmapPayload = {
  name: string;
  slug: string;
  description: string;
  isActive?: boolean;
  questions: Array<{ questionId: number; order: number }>;
};
