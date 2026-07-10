export type ProgressEntry = {
  id: string;
  recordedAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  waistCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes?: string | null;
};

export type ProgressHistoryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProgressHistoryResponse = {
  items: ProgressEntry[];
  meta?: ProgressHistoryMeta;
};

export type ProgressInsightTone =
  | 'ahead'
  | 'on_track'
  | 'behind'
  | 'starting'
  | 'insufficient_data'
  | string;

export type ProgressInsights = {
  headline?: string | null;
  complianceLine?: string | null;
  paceLine?: string | null;
  summary?: string | null;
  bullets?: string[];
  tone?: ProgressInsightTone | null;
};

export type ChartPoint = {
  date: string;
  label: string;
  value: number;
};

export type ProgressAnalytics = {
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  remainingWeightKg: number | null;
  startWeightKg: number | null;
  weightChangeKg: number | null;
  bodyFatChange: number | null;
  waistChangeCm: number | null;
  goalCompletionPercent: number | null;
  transformationPercent: number | null;
  weeklyAverageWeightChangeKg: number | null;
  consistencyPercent: number | null;
  compliancePercent: number | null;
  currentStreakDays: number | null;
  estimatedWeeksRemaining: number | null;
  etaWeeksDelta: number | null;
  weeksElapsed: number | null;
  plannedEtaWeeks: number | null;
  estimatedCompletionDate?: string | null;
  sampleSize?: number | null;
  weightTrend: ChartPoint[];
  bodyFatTrend: ChartPoint[];
  measurementTrends: {
    waist: ChartPoint[];
    chest: ChartPoint[];
    arm: ChartPoint[];
    thigh: ChartPoint[];
  };
  averageMeasurementChange?: {
    waist?: number | null;
    chest?: number | null;
    arm?: number | null;
    thigh?: number | null;
  } | null;
  insights?: ProgressInsights | null;
  insightMessage?: string | null;
};

export type ProgressPhotoAngle = 'front' | 'side' | 'back';

export type ProgressPhotoSet = {
  id: string;
  frontImageUrl?: string | null;
  sideImageUrl?: string | null;
  backImageUrl?: string | null;
  recordedAt: string;
};

export type ProgressPhotosResponse = {
  items: ProgressPhotoSet[];
  meta?: ProgressHistoryMeta;
};

export type SaveProgressPhotosPayload = {
  frontImageUrl?: string;
  sideImageUrl?: string;
  backImageUrl?: string;
};

export type AddProgressPayload = {
  weightKg?: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
};

export type PresignedUploadPayload = {
  fileName: string;
  contentType: string;
  size: number;
  photoType: ProgressPhotoAngle;
  category?: 'progress';
};

export type PresignedUploadResult = {
  uploadId?: string | null;
  uploadUrl: string;
  publicUrl?: string | null;
  key?: string | null;
};

export type ProgressDashboard = {
  latest: ProgressEntry | null;
  photoCount: number;
  analytics: ProgressAnalytics | null;
  insights: ProgressInsights | null;
  transformation?: {
    goalCompletionPercent?: number | null;
    transformationPercent?: number | null;
    estimatedCompletionDate?: string | null;
    etaWeeks?: number | null;
    weeksAheadOfPlan?: number | null;
    plannedEtaWeeks?: number | null;
    startWeightKg?: number | null;
    latestWeightKg?: number | null;
    targetWeightKg?: number | null;
  } | null;
};
