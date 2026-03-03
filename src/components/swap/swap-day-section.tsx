import { ContributionList } from '@/components/contributions/contribution-list';
import { SwapDayInfo } from './swap-day-info';

interface Contribution {
  id: string;
  dishName: string | null;
  recipeId: string | null;
  notes: string | null;
  servings: number | null;
  household: { id: string; name: string };
  recipe: {
    id: string;
    name: string;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

interface SwapDaySectionProps {
  label: string;
  dayOfWeek: number;
  coversFrom: number;
  coversTo: number;
  location: string | null;
  time: string | null;
  notes: string | null;
  contributions: Contribution[];
  weekId?: string;
}

export function SwapDaySection({
  label,
  dayOfWeek,
  coversFrom,
  coversTo,
  location,
  time,
  notes,
  contributions,
  weekId,
}: SwapDaySectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold pb-3">{label}</h3>
      <div className="space-y-4">
        <SwapDayInfo
          label={label}
          dayOfWeek={dayOfWeek}
          coversFrom={coversFrom}
          coversTo={coversTo}
          location={location}
          time={time}
          notes={notes}
        />
        <ContributionList contributions={contributions} weekId={weekId} />
      </div>
    </div>
  );
}
