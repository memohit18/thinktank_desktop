# FitForge Elite Module

Unified fitness module replacing the separate Workout and Meal modules. UI matches the **Diet Planner** mockup with an internal FitForge sidebar.

## Route

| Path | Component |
|------|-----------|
| `/fitforge` | `FitForgeApp` → `DietPlannerPage` (default) |

## Structure

```
src/components/fitforge/
  FitForgeApp.tsx
  FitForgeShell.tsx     # Sidebar + Daily Check-in
  DietPlannerPage.tsx   # Main diet planner UI

src/lib/fitforge/
  dietPlannerTypes.ts
  dietPlannerApiTypes.ts
  dietPlannerMapper.ts

src/lib/services/fitforgeApi.ts
```

## API usage on Diet Planner screen

| UI element | Method | Endpoint | Wired |
|------------|--------|----------|-------|
| Load screen | GET | `/diet/planner` | Yes |
| History button | GET | `/diet/history` | Yes |
| Edit Plan button | GET | `/diet/active` + `/meal-plans/active` | Yes |
| Search nutrients | GET | `/foods?search=...` | Yes |
| Meal checkbox | POST | `/meal-logs` (`completed`) | Yes |
| Skip meal | POST | `/meal-logs` (`skipped`) | Yes |
| Swap meal (⇄) | POST | `/meal-logs` (`replaced`) | Yes |
| Hydration +buttons | PATCH | `/diet/planner/hydration` | Yes |
| Macro swap hub | GET | `/diet/planner` → `swapSuggestion` | Yes |
| Explore alternatives | GET | `/foods?search=...` | Yes |
| Coach Apply | POST | `/ai/sessions` + `/ai/chat` | Yes |
| Vitals | GET | `/diet/planner` → `vitals` | Yes |
| Generate meal plan | POST | `/meal-plans/generate-ai` | Yes |
| Daily Check-in (sidebar) | POST | `/checkins` | Yes |

## APIs defined but not used on this screen

| Endpoint | Reason |
|----------|--------|
| `GET /meal-plans/history` | Optional; History modal uses `/diet/history` only |
| `PUT /meal-plans/items/:id` | Edit Plan flow shows raw plan JSON; item editor not built yet |
| `GET /checkins?page=1&limit=7` | Check-in history not shown in UI |
| `GET /profile` | Optional sidebar context — not wired |
| `GET /transformation/active` | Roadmap tab placeholder — not wired |
| `POST /fitness-profile` | First-time setup only (planner 404) |
| `POST /transformation/generate` | First-time setup only |
| `POST /diet/generate-targets` | First-time setup only |
| `POST /diet/:id/activate` | First-time setup only |
| `POST /meal-plans/:id/activate` | First-time setup only |
| `POST /workouts/generate-ai` | Workouts tab not built |

Setup mutations (`generateDietTargets`, `activateDietPlan`, `generateTransformation`, `activateMealPlan`) are exported from `fitforgeApi.ts` for future onboarding UI.

## Proxy routes

`/api/diet`, `/api/meal-plans`, `/api/meal-logs`, `/api/checkins`, `/api/foods`, `/api/ai`, `/api/transformation`, `/api/fitness-profile`

## ThinkTank sidebar

Registered as **FitForge** module (`fitforge`) in Settings → Modules.
