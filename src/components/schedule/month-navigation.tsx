'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

interface MonthNavigationProps {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthNavigation({ year, month }: MonthNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', String(newYear));
    params.set('month', String(newMonth + 1));
    router.push(`/schedule?${params.toString()}`);
  };

  const goToPrev = () => {
    const prev = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
    navigate(prev.year, prev.month);
  };

  const goToNext = () => {
    const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
    navigate(next.year, next.month);
  };

  const goToToday = () => {
    const now = new Date();
    navigate(now.getFullYear(), now.getMonth());
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrev}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Previous month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5l-5 5 5 5" />
        </svg>
      </button>
      <h3 className="min-w-[160px] text-center text-lg font-semibold">
        {MONTH_NAMES[month]} {year}
      </h3>
      <button
        onClick={goToNext}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-300 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Next month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 5l5 5-5 5" />
        </svg>
      </button>
      <Button variant="secondary" size="sm" onClick={goToToday}>
        Today
      </Button>
    </div>
  );
}
