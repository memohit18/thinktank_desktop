'use client';

import { useEffect, useState } from 'react';
import type { Roadmap } from '@/lib/code/roadmapTypes';
import { getApiErrorMessage } from '@/lib/services/getApiErrorMessage';
import {
  useActivateRoadmapMutation,
  useGetRoadmapsQuery,
} from '@/lib/services/roadmapsApi';
import RoadmapCreateForm from '@/components/code/RoadmapCreateForm';
import { useToast } from '@/components/ui/Toast';

type RoadmapModalProps = {
  open: boolean;
  onClose: () => void;
};

type ModalTab = 'list' | 'create';

export default function RoadmapModal({ open, onClose }: RoadmapModalProps) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<ModalTab>('list');
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);

  const { data, isLoading, isError, refetch } = useGetRoadmapsQuery(
    { page: 1, limit: 20 },
    { skip: !open },
  );
  const [activateRoadmap] = useActivateRoadmapMutation();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleActivate(roadmap: Roadmap) {
    if (roadmap.isActive || activatingId) return;

    setActivatingId(roadmap.roadmapId);

    try {
      await activateRoadmap(roadmap.roadmapId).unwrap();
      showToast(`"${roadmap.name}" is now active.`);
      void refetch();
    } catch (error) {
      showToast(
        getApiErrorMessage(error, 'Failed to activate roadmap.'),
        'error',
      );
    } finally {
      setActivatingId(null);
    }
  }

  function handleCreated() {
    setCreateFormKey((value) => value + 1);
    setTab('list');
    void refetch();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close roadmap dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Roadmaps</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View, activate, or create a question roadmap for your track.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex gap-1 border-b border-border">
            <TabButton active={tab === 'list'} onClick={() => setTab('list')}>
              Your roadmaps
            </TabButton>
            <TabButton active={tab === 'create'} onClick={() => setTab('create')}>
              Create
            </TabButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'list' ? (
            <div className="space-y-3">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading roadmaps...
                </p>
              ) : null}
              {isError ? (
                <p className="py-8 text-center text-sm text-red-500">
                  Failed to load roadmaps.
                </p>
              ) : null}
              {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No roadmaps yet. Create one to get started.
                </p>
              ) : null}
              {data?.items.map((roadmap) => (
                <div
                  key={roadmap.roadmapId}
                  className={`rounded-xl border p-4 ${
                    roadmap.isActive
                      ? 'border-accent/40 bg-accent/5'
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {roadmap.name}
                        </h3>
                        {roadmap.isActive ? (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground dark:text-black">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {roadmap.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {roadmap.questionCount} questions ·{' '}
                        <span className="font-mono">{roadmap.slug}</span>
                      </p>
                    </div>
                    {!roadmap.isActive ? (
                      <button
                        type="button"
                        onClick={() => void handleActivate(roadmap)}
                        disabled={activatingId === roadmap.roadmapId}
                        className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {activatingId === roadmap.roadmapId
                          ? 'Activating...'
                          : 'Activate'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RoadmapCreateForm
              key={createFormKey}
              onCreated={handleCreated}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-accent text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
