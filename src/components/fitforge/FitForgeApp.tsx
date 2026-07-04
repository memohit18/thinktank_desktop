'use client';

import { useState } from 'react';
import type { FitForgeNavId } from '@/lib/fitforge/dietPlannerTypes';
import DietPlannerPage from '@/components/fitforge/DietPlannerPage';
import FitForgeShell from '@/components/fitforge/FitForgeShell';

export default function FitForgeApp() {
  const [activeNav, setActiveNav] = useState<FitForgeNavId>('diet-planner');

  return (
    <FitForgeShell activeNav={activeNav} onNavChange={setActiveNav}>
      {activeNav === 'diet-planner' ? (
        <DietPlannerPage />
      ) : (
        <PlaceholderView nav={activeNav} />
      )}
    </FitForgeShell>
  );
}

function PlaceholderView({ nav }: { nav: FitForgeNavId }) {
  const label = nav.replace('-', ' ');
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg font-bold capitalize text-foreground">{label}</p>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon in FitForge Elite.</p>
      </div>
    </div>
  );
}
