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

export function getSwapDayDefaults(): SwapDayDefault[] {
  return [{ dayOfWeek: 0, label: 'Swap Day', coversFrom: 1, coversTo: 5 }];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

export function getShortDayName(dayOfWeek: number): string {
  return SHORT_DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

const DATE_RANGE_FMT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

export function formatDateRange(baseDate: Date, startOffset: number, endOffset: number): string {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + startOffset);
  const end = new Date(baseDate);
  end.setDate(end.getDate() + endOffset);
  return `${start.toLocaleDateString('en-US', DATE_RANGE_FMT)} – ${end.toLocaleDateString('en-US', DATE_RANGE_FMT)}`;
}

export function formatWeekRange(startDate: Date): string {
  return formatDateRange(startDate, 0, 6);
}

/** Get the calendar date for a given dayOfWeek within a Monday-start week. */
export function getSwapDate(weekStartDate: Date, dayOfWeek: number): Date {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + (dayOfWeek - 1));
  return date;
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

/**
 * Returns the last day of the month after the given date's month.
 */
export function getEndOfNextMonth(from: Date = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  // month + 2 = next month + 1, day 0 = last day of previous month
  return new Date(year, month + 2, 0);
}

/**
 * Returns all Mondays between `from` and `through` (inclusive).
 */
export function getMondaysInRange(from: Date, through: Date): Date[] {
  const mondays: Date[] = [];
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);

  // Advance to next Monday if `from` isn't one
  const day = current.getDay();
  if (day !== 1) {
    const diff = day === 0 ? 1 : 8 - day;
    current.setDate(current.getDate() + diff);
  }

  while (current <= through) {
    mondays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return mondays;
}

/**
 * Deterministic per-household recipe index (Latin-square rotation).
 * Each household gets a different recipe on the same swap day.
 * Household 0 gets recipe G%R, household 1 gets (G+1)%R, etc.
 * Returns -1 if recipeCount is 0.
 */
export function computeHouseholdRecipeIndex(
  startDate: Date,
  weekStartDate: Date,
  swapDaysPerWeek: number,
  swapDayIndex: number,
  householdIndex: number,
  recipeCount: number,
): number {
  if (recipeCount === 0) return -1;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksBetween = Math.round(
    (weekStartDate.getTime() - startDate.getTime()) / msPerWeek,
  );
  const globalIndex = weeksBetween * swapDaysPerWeek + swapDayIndex;
  return (((globalIndex + householdIndex) % recipeCount) + recipeCount) % recipeCount;
}
