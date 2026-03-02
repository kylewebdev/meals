import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <h3 className="font-semibold">{label}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
