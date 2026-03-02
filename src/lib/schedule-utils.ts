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

/**
 * Returns a 2D array of dates for a month calendar grid (Mon-Sun columns).
 * Pads with adjacent month dates to fill complete rows.
 */
export function getMonthCalendarDates(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the Monday of the week containing the 1st
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - startOffset);

  // Get the Sunday of the week containing the last day
  const endOffset = (7 - ((lastDay.getDay() + 6) % 7 + 1)) % 7;
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(gridEnd.getDate() + endOffset);

  const rows: Date[][] = [];
  const current = new Date(gridStart);

  while (current <= gridEnd) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    rows.push(row);
  }

  return rows;
}

/**
 * Calculate total portions for a swap day.
 * headcount x number of days covered.
 */
export function getPortionCount(headcount: number, coversFrom: number, coversTo: number): number {
  const days = coversTo - coversFrom + 1;
  return headcount * days;
}
