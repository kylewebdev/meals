import { cn } from '@/lib/utils';
import { getMonthCalendarDates } from '@/lib/schedule-utils';
import { SwapDayChip } from './swap-day-chip';
import type { ScheduleWeekWithContributions } from '@/lib/queries/schedule';
import Link from 'next/link';

interface MonthGridProps {
  year: number;
  month: number;
  weeks: ScheduleWeekWithContributions[];
  householdCount: number;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthGrid({ year, month, weeks, householdCount }: MonthGridProps) {
  const rows = getMonthCalendarDates(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a lookup: date string -> week data
  const weekByDate = new Map<string, ScheduleWeekWithContributions>();
  for (const week of weeks) {
    const start = new Date(week.startDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      weekByDate.set(dateKey(d), week);
    }
  }

  // Build a lookup: date string -> swap days on that date
  const swapDaysByDate = new Map<string, ScheduleWeekWithContributions['swapDays']>();
  for (const week of weeks) {
    const start = new Date(week.startDate);
    for (const sd of week.swapDays) {
      const d = new Date(start);
      d.setDate(d.getDate() + sd.dayOfWeek);
      const key = dateKey(d);
      const existing = swapDaysByDate.get(key) ?? [];
      existing.push(sd);
      swapDaysByDate.set(key, existing);
    }
  }

  // Current week check
  const todayDay = today.getDay();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
  const currentWeekKey = dateKey(currentMonday);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px rounded-t-lg bg-zinc-200 dark:bg-zinc-700">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="bg-zinc-50 px-2 py-1.5 text-center text-xs font-medium text-zinc-500 first:rounded-tl-lg last:rounded-tr-lg dark:bg-zinc-900"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px rounded-b-lg bg-zinc-200 dark:bg-zinc-700">
        {rows.flatMap((row, ri) =>
          row.map((date, ci) => {
            const key = dateKey(date);
            const week = weekByDate.get(key);
            const swapDays = swapDaysByDate.get(key);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = key === dateKey(today);

            // Check if this date's Monday matches current week
            const dateDow = date.getDay();
            const dateMonday = new Date(date);
            dateMonday.setDate(date.getDate() - (dateDow === 0 ? 6 : dateDow - 1));
            const isCurrentWeek = dateKey(dateMonday) === currentWeekKey;

            const cellContent = (
              <div
                className={cn(
                  'flex min-h-[72px] flex-col gap-1 bg-white px-1.5 py-1 dark:bg-zinc-950',
                  !isCurrentMonth && 'bg-zinc-50 dark:bg-zinc-900/50',
                  isCurrentWeek && week && 'bg-blue-50/50 dark:bg-blue-950/20',
                  ri === rows.length - 1 && ci === 0 && 'rounded-bl-lg',
                  ri === rows.length - 1 && ci === 6 && 'rounded-br-lg',
                )}
              >
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    !isCurrentMonth && 'text-zinc-300 dark:text-zinc-600',
                    isCurrentMonth && 'text-zinc-700 dark:text-zinc-300',
                    isToday &&
                      'inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
                  )}
                >
                  {date.getDate()}
                </span>
                {swapDays?.map((sd) => (
                  <SwapDayChip
                    key={sd.id}
                    label={sd.label}
                    contributionCount={sd.contributions.length}
                    totalHouseholds={householdCount}
                  />
                ))}
              </div>
            );

            if (week) {
              return (
                <Link key={key} href={`/week/${week.id}`} className="hover:ring-1 hover:ring-zinc-300">
                  {cellContent}
                </Link>
              );
            }

            return <div key={key}>{cellContent}</div>;
          }),
        )}
      </div>
    </div>
  );
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
