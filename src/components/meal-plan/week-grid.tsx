import { getDayName } from '@/lib/schedule-utils';
import { MealSlot } from './meal-slot';

interface MealEntry {
  id: string;
  dayOfWeek: number;
  mealType: string;
  name: string | null;
  recipeId: string | null;
  isModified: boolean;
  modificationNotes: string | null;
  recipe: {
    id: string;
    name: string;
    calories: number | null;
  } | null;
}

interface WeekGridProps {
  entries: MealEntry[];
}

export function WeekGrid({ entries }: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => i);

  const getEntry = (day: number, mealType: string) =>
    entries.find((e) => e.dayOfWeek === day && e.mealType === mealType);

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <div key={day} className="grid grid-cols-[120px_1fr_1fr] gap-3">
          <div className="flex items-center text-sm font-medium">{getDayName(day)}</div>
          <MealSlot entry={getEntry(day, 'lunch')} mealType="lunch" />
          <MealSlot entry={getEntry(day, 'dinner')} mealType="dinner" />
        </div>
      ))}
      <div className="grid grid-cols-[120px_1fr_1fr] gap-3 text-center text-xs text-zinc-400">
        <div />
        <div>Lunch</div>
        <div>Dinner</div>
      </div>
    </div>
  );
}
