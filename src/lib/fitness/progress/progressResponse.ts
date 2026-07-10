import { unwrapFitnessData, isFitnessErrorEnvelope } from '@/lib/fitness/fitnessResponse';
import type {
  AddProgressPayload,
  ChartPoint,
  PresignedUploadResult,
  ProgressAnalytics,
  ProgressDashboard,
  ProgressEntry,
  ProgressHistoryMeta,
  ProgressHistoryResponse,
  ProgressInsights,
  ProgressPhotoSet,
  ProgressPhotosResponse,
} from '@/lib/fitness/progress/types';

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatChartLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function normalizeTrendPoints(raw: unknown): ChartPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const date = readString(record.date ?? record.recordedAt ?? record.createdAt);
      const value = readNullableNumber(record.value ?? record.weightKg ?? record.amount);
      if (!date || value == null) return null;
      return {
        date,
        label: formatChartLabel(date),
        value,
      } satisfies ChartPoint;
    })
    .filter((item): item is ChartPoint => item !== null);
}

export function normalizeProgressEntry(raw: unknown): ProgressEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id =
    readString(record.id ?? record.progressId ?? record.progress_id) ||
    readString(record.createdAt ?? record.recordedAt ?? record.date);
  if (!id) return null;

  const recordedAt =
    readString(
      record.createdAt ??
        record.created_at ??
        record.recordedAt ??
        record.recorded_at ??
        record.date,
    ) || new Date().toISOString();

  return {
    id,
    recordedAt,
    weightKg: readNullableNumber(record.weightKg ?? record.weight_kg ?? record.weight),
    bodyFatPercentage: readNullableNumber(
      record.bodyFatPercentage ??
        record.body_fat_percentage ??
        record.bodyFat ??
        record.body_fat,
    ),
    waistCm: readNullableNumber(record.waistCm ?? record.waist_cm ?? record.waist),
    chestCm: readNullableNumber(record.chestCm ?? record.chest_cm ?? record.chest),
    armCm: readNullableNumber(
      record.armCm ?? record.arm_cm ?? record.armsCm ?? record.arms,
    ),
    thighCm: readNullableNumber(
      record.thighCm ?? record.thigh_cm ?? record.thighsCm ?? record.thighs,
    ),
    notes: readString(record.notes ?? record.note) || null,
  };
}

export function unwrapProgressHistory(
  response: unknown,
): ProgressHistoryResponse {
  if (isFitnessErrorEnvelope(response)) return { items: [] };
  const data = unwrapFitnessData<
    | ProgressEntry[]
    | {
        items?: unknown[];
        data?: unknown[];
        history?: unknown[];
        meta?: ProgressHistoryMeta;
        pagination?: ProgressHistoryMeta;
      }
  >(response);

  if (!data) return { items: [] };

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.history)
        ? data.history
        : Array.isArray(data.data)
          ? data.data
          : [];

  return {
    items: list
      .map((item) => normalizeProgressEntry(item))
      .filter((item): item is ProgressEntry => item !== null)
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      ),
    meta: !Array.isArray(data) ? data.meta ?? data.pagination : undefined,
  };
}

export function unwrapLatestProgress(response: unknown): ProgressEntry | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data) return null;
  if (typeof data === 'object' && data !== null && 'latest' in data) {
    return normalizeProgressEntry((data as { latest: unknown }).latest);
  }
  return normalizeProgressEntry(data);
}

export function unwrapProgressEntry(response: unknown): ProgressEntry | null {
  if (isFitnessErrorEnvelope(response)) return null;
  return normalizeProgressEntry(unwrapFitnessData(response) ?? response);
}

function normalizeInsights(raw: unknown): ProgressInsights | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const bullets = Array.isArray(record.bullets)
    ? record.bullets.map((item) => String(item)).filter(Boolean)
    : [];

  return {
    headline: readString(record.headline) || null,
    complianceLine: readString(record.complianceLine ?? record.compliance_line) || null,
    paceLine: readString(record.paceLine ?? record.pace_line) || null,
    summary: readString(record.summary) || null,
    bullets,
    tone: readString(record.tone) || null,
  };
}

export function normalizeProgressAnalytics(
  raw: unknown,
  fallback?: {
    currentWeightKg?: number | null;
    targetWeightKg?: number | null;
    estimatedWeeks?: number | null;
  },
): ProgressAnalytics | null {
  if (!raw || typeof raw !== 'object') {
    if (!fallback) return null;
    return {
      currentWeightKg: fallback.currentWeightKg ?? null,
      targetWeightKg: fallback.targetWeightKg ?? null,
      remainingWeightKg:
        fallback.currentWeightKg != null && fallback.targetWeightKg != null
          ? fallback.targetWeightKg - fallback.currentWeightKg
          : null,
      startWeightKg: null,
      weightChangeKg: null,
      bodyFatChange: null,
      waistChangeCm: null,
      goalCompletionPercent: null,
      transformationPercent: null,
      weeklyAverageWeightChangeKg: null,
      consistencyPercent: null,
      compliancePercent: null,
      currentStreakDays: null,
      estimatedWeeksRemaining: fallback.estimatedWeeks ?? null,
      etaWeeksDelta: null,
      weeksElapsed: null,
      plannedEtaWeeks: null,
      weightTrend: [],
      bodyFatTrend: [],
      measurementTrends: { waist: [], chest: [], arm: [], thigh: [] },
      insights: null,
      insightMessage: null,
    };
  }

  const record = raw as Record<string, unknown>;
  const measurementTrendsRaw =
    record.measurementTrends && typeof record.measurementTrends === 'object'
      ? (record.measurementTrends as Record<string, unknown>)
      : {};
  const avgMeasurement =
    record.averageMeasurementChange &&
    typeof record.averageMeasurementChange === 'object'
      ? (record.averageMeasurementChange as Record<string, unknown>)
      : null;

  const currentWeightKg = readNullableNumber(
    record.latestWeightKg ??
      record.currentWeightKg ??
      record.current_weight_kg ??
      fallback?.currentWeightKg,
  );
  const targetWeightKg = readNullableNumber(
    record.targetWeightKg ??
      record.target_weight_kg ??
      fallback?.targetWeightKg,
  );
  const startWeightKg = readNullableNumber(
    record.startWeightKg ?? record.start_weight_kg,
  );
  const remainingWeightKg =
    currentWeightKg != null && targetWeightKg != null
      ? targetWeightKg - currentWeightKg
      : null;

  const insights = normalizeInsights(record.insights);
  const insightMessage =
    insights?.summary ||
    [insights?.headline, insights?.complianceLine, insights?.paceLine]
      .filter(Boolean)
      .join(' ') ||
    null;

  const sampleSize = readNullableNumber(
    record.sampleSize ?? record.sample_size,
  );
  // API returns 0 placeholders when there are no logs; treat as empty for UI.
  const hasSamples = (sampleSize ?? 0) > 0;
  const insufficient =
    !hasSamples || insights?.tone === 'insufficient_data';

  const weightChangeKg = insufficient
    ? null
    : readNullableNumber(
        record.weightDifference ??
          record.weightChangeKg ??
          record.weight_change ??
          record.weightChange,
      );
  const bodyFatChange = insufficient
    ? null
    : readNullableNumber(
        record.bodyFatDifference ??
          record.bodyFatChange ??
          record.body_fat_change,
      );
  const weeklyAverageWeightChangeKg = insufficient
    ? null
    : readNullableNumber(
        record.averageWeeklyWeightChange ??
          record.weeklyAverageWeightChangeKg ??
          record.weeklyAverage,
      );
  const consistencyPercent = insufficient
    ? null
    : readNullableNumber(
        record.consistencyScore ??
          record.consistencyPercent ??
          record.consistency,
      );
  const compliancePercent = insufficient
    ? null
    : readNullableNumber(record.compliancePercent ?? record.compliance);
  const currentStreakDays = insufficient
    ? null
    : readNullableNumber(
        record.currentStreak ??
          record.currentStreakDays ??
          record.streak,
      );
  const weeksElapsed = insufficient
    ? null
    : readNullableNumber(
        record.weeksTracked ?? record.weeksElapsed ?? record.weeks,
      );
  const waistChangeCm = insufficient
    ? null
    : readNullableNumber(
        avgMeasurement?.waist ?? record.waistChange ?? record.waist_change,
      );

  return {
    currentWeightKg,
    targetWeightKg,
    remainingWeightKg,
    startWeightKg,
    weightChangeKg,
    bodyFatChange,
    waistChangeCm,
    goalCompletionPercent: readNullableNumber(
      record.goalCompletionPercent ?? record.goalCompletion,
    ),
    transformationPercent: readNullableNumber(
      record.transformationPercent ?? record.transformation_percent,
    ),
    weeklyAverageWeightChangeKg,
    consistencyPercent,
    compliancePercent,
    currentStreakDays,
    estimatedWeeksRemaining: readNullableNumber(
      record.etaWeeks ??
        record.estimatedWeeksRemaining ??
        fallback?.estimatedWeeks,
    ),
    etaWeeksDelta: readNullableNumber(
      record.weeksAheadOfPlan ??
        record.etaWeeksDelta ??
        record.weeks_ahead,
    ),
    weeksElapsed,
    plannedEtaWeeks: readNullableNumber(
      record.plannedEtaWeeks ?? record.planned_eta_weeks,
    ),
    estimatedCompletionDate:
      readString(
        record.estimatedCompletionDate ?? record.estimated_completion_date,
      ) || null,
    sampleSize,
    weightTrend: normalizeTrendPoints(record.weightTrend ?? record.weight_trend),
    bodyFatTrend: normalizeTrendPoints(
      record.bodyFatTrend ?? record.body_fat_trend,
    ),
    measurementTrends: {
      waist: normalizeTrendPoints(measurementTrendsRaw.waist),
      chest: normalizeTrendPoints(measurementTrendsRaw.chest),
      arm: normalizeTrendPoints(measurementTrendsRaw.arm),
      thigh: normalizeTrendPoints(measurementTrendsRaw.thigh),
    },
    averageMeasurementChange:
      avgMeasurement && !insufficient
        ? {
            waist: readNullableNumber(avgMeasurement.waist),
            chest: readNullableNumber(avgMeasurement.chest),
            arm: readNullableNumber(avgMeasurement.arm),
            thigh: readNullableNumber(avgMeasurement.thigh),
          }
        : null,
    insights,
    insightMessage,
  };
}

export function unwrapProgressAnalytics(
  response: unknown,
  fallback?: {
    currentWeightKg?: number | null;
    targetWeightKg?: number | null;
    estimatedWeeks?: number | null;
  },
): ProgressAnalytics | null {
  if (isFitnessErrorEnvelope(response)) {
    return normalizeProgressAnalytics(null, fallback);
  }
  const data = unwrapFitnessData(response);
  return normalizeProgressAnalytics(data ?? response, fallback);
}

export function normalizeProgressPhotoSet(raw: unknown): ProgressPhotoSet | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = readString(record.id);
  const frontImageUrl =
    readString(record.frontImageUrl ?? record.front_image_url) || null;
  const sideImageUrl =
    readString(record.sideImageUrl ?? record.side_image_url) || null;
  const backImageUrl =
    readString(record.backImageUrl ?? record.back_image_url) || null;

  if (!id && !frontImageUrl && !sideImageUrl && !backImageUrl) return null;

  return {
    id: id || `${frontImageUrl ?? sideImageUrl ?? backImageUrl}`,
    frontImageUrl,
    sideImageUrl,
    backImageUrl,
    recordedAt:
      readString(
        record.createdAt ??
          record.created_at ??
          record.recordedAt ??
          record.date,
      ) || new Date().toISOString(),
  };
}

export function unwrapProgressPhotos(
  response: unknown,
): ProgressPhotosResponse {
  if (isFitnessErrorEnvelope(response)) return { items: [] };
  const data = unwrapFitnessData<
    | ProgressPhotoSet[]
    | { items?: unknown[]; photos?: unknown[]; meta?: ProgressHistoryMeta }
  >(response);

  if (!data) return { items: [] };
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.photos)
        ? data.photos
        : [];

  return {
    items: list
      .map((item) => normalizeProgressPhotoSet(item))
      .filter((item): item is ProgressPhotoSet => item !== null)
      .sort(
        (a, b) =>
          new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
      ),
    meta: !Array.isArray(data) ? data.meta : undefined,
  };
}

export function unwrapPresignedUpload(
  response: unknown,
): PresignedUploadResult | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const uploadUrl = readString(
    record.uploadUrl ?? record.upload_url ?? record.url,
  );
  if (!uploadUrl) return null;
  return {
    uploadId: readString(record.uploadId ?? record.upload_id) || null,
    uploadUrl,
    publicUrl:
      readString(record.fileUrl ?? record.publicUrl ?? record.public_url) || null,
    key: readString(record.key ?? record.objectKey) || null,
  };
}

export function unwrapProgressDashboard(
  response: unknown,
): ProgressDashboard | null {
  if (isFitnessErrorEnvelope(response)) return null;
  const data = unwrapFitnessData(response);
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  const analytics = normalizeProgressAnalytics(record.analytics);
  const insights =
    normalizeInsights(record.insights) ?? analytics?.insights ?? null;
  const transformation =
    record.transformation && typeof record.transformation === 'object'
      ? (record.transformation as Record<string, unknown>)
      : null;

  return {
    latest: normalizeProgressEntry(record.latest),
    photoCount: readNullableNumber(record.photoCount ?? record.photo_count) ?? 0,
    analytics: analytics
      ? {
          ...analytics,
          insights: insights ?? analytics.insights,
          insightMessage:
            insights?.summary ||
            analytics.insightMessage ||
            null,
          currentWeightKg:
            analytics.currentWeightKg ??
            readNullableNumber(transformation?.latestWeightKg),
          targetWeightKg:
            analytics.targetWeightKg ??
            readNullableNumber(transformation?.targetWeightKg),
          startWeightKg:
            analytics.startWeightKg ??
            readNullableNumber(transformation?.startWeightKg),
          goalCompletionPercent:
            analytics.goalCompletionPercent ??
            readNullableNumber(transformation?.goalCompletionPercent),
          estimatedWeeksRemaining:
            analytics.estimatedWeeksRemaining ??
            readNullableNumber(transformation?.etaWeeks),
          etaWeeksDelta:
            analytics.etaWeeksDelta ??
            readNullableNumber(transformation?.weeksAheadOfPlan),
        }
      : null,
    insights,
    transformation: transformation
      ? {
          goalCompletionPercent: readNullableNumber(
            transformation.goalCompletionPercent,
          ),
          transformationPercent: readNullableNumber(
            transformation.transformationPercent,
          ),
          estimatedCompletionDate:
            readString(transformation.estimatedCompletionDate) || null,
          etaWeeks: readNullableNumber(transformation.etaWeeks),
          weeksAheadOfPlan: readNullableNumber(transformation.weeksAheadOfPlan),
          plannedEtaWeeks: readNullableNumber(transformation.plannedEtaWeeks),
          startWeightKg: readNullableNumber(transformation.startWeightKg),
          latestWeightKg: readNullableNumber(transformation.latestWeightKg),
          targetWeightKg: readNullableNumber(transformation.targetWeightKg),
        }
      : null,
  };
}

export function toChartPoints(
  entries: ProgressEntry[],
  key: keyof Pick<
    ProgressEntry,
    | 'weightKg'
    | 'bodyFatPercentage'
    | 'waistCm'
    | 'chestCm'
    | 'armCm'
    | 'thighCm'
  >,
): ChartPoint[] {
  return entries
    .filter((entry) => entry[key] != null)
    .map((entry) => ({
      date: entry.recordedAt,
      label: formatChartLabel(entry.recordedAt),
      value: Number(entry[key]),
    }));
}

export function buildAddProgressBody(payload: AddProgressPayload) {
  const body: Record<string, number | string> = {};
  if (payload.weightKg != null) body.weightKg = payload.weightKg;
  if (payload.bodyFatPercentage != null) {
    body.bodyFatPercentage = payload.bodyFatPercentage;
  }
  if (payload.waistCm != null) body.waistCm = payload.waistCm;
  if (payload.chestCm != null) body.chestCm = payload.chestCm;
  if (payload.armCm != null) body.armCm = payload.armCm;
  if (payload.thighCm != null) body.thighCm = payload.thighCm;
  if (payload.notes?.trim()) body.notes = payload.notes.trim();
  return body;
}

export function flattenPhotoSetAngles(sets: ProgressPhotoSet[]) {
  return sets.flatMap((set) => {
    const rows: Array<{
      id: string;
      setId: string;
      url: string;
      angle: 'front' | 'side' | 'back';
      recordedAt: string;
    }> = [];
    if (set.frontImageUrl) {
      rows.push({
        id: `${set.id}-front`,
        setId: set.id,
        url: set.frontImageUrl,
        angle: 'front',
        recordedAt: set.recordedAt,
      });
    }
    if (set.sideImageUrl) {
      rows.push({
        id: `${set.id}-side`,
        setId: set.id,
        url: set.sideImageUrl,
        angle: 'side',
        recordedAt: set.recordedAt,
      });
    }
    if (set.backImageUrl) {
      rows.push({
        id: `${set.id}-back`,
        setId: set.id,
        url: set.backImageUrl,
        angle: 'back',
        recordedAt: set.recordedAt,
      });
    }
    return rows;
  });
}
