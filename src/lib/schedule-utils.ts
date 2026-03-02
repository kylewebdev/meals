export function getNextMonday(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const day = date.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

interface SwapDayDefault {
  dayOfWeek: number;
  label: string;
  coversFrom: number;
  coversTo: number;
}

export function getSwapDayDefaults(mode: 'single' | 'dual'): SwapDayDefault[] {
  if (mode === 'dual') {
    return [
      { dayOfWeek: 6, label: 'Saturday Swap', coversFrom: 1, coversTo: 2 },
      { dayOfWeek: 3, label: 'Wednesday Swap', coversFrom: 3, coversTo: 5 },
    ];
  }
  return [{ dayOfWeek: 0, label: 'Sunday Swap', coversFrom: 1, coversTo: 5 }];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

export function formatWeekRange(startDate: Date): string {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}
