import { EmptyState } from '@/components/ui/empty-state';
import { WeekRow } from './week-row';

interface Week {
  id: string;
  startDate: Date;
  status: string;
}

interface ScheduleCalendarProps {
  weeks: Week[];
  currentWeekId: string | null;
}

export function ScheduleCalendar({ weeks, currentWeekId }: ScheduleCalendarProps) {
  if (weeks.length === 0) {
    return (
      <EmptyState
        title="No weeks scheduled"
        description="An admin can generate weeks from the swap settings."
      />
    );
  }

  return (
    <div className="space-y-2">
      {weeks.map((week) => (
        <WeekRow
          key={week.id}
          id={week.id}
          startDate={week.startDate}
          status={week.status}
          isCurrent={week.id === currentWeekId}
        />
      ))}
    </div>
  );
}
