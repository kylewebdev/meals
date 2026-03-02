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
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={goToPrev}>
        &larr;
      </Button>
      <h3 className="min-w-[160px] text-center text-lg font-semibold">
        {MONTH_NAMES[month]} {year}
      </h3>
      <Button variant="secondary" size="sm" onClick={goToNext}>
        &rarr;
      </Button>
      <Button variant="secondary" size="sm" onClick={goToToday}>
        Today
      </Button>
    </div>
  );
}
