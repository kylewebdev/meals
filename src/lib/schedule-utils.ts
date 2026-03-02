export function getNextMonday(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const day = date.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

interface HouseholdForSchedule {
  id: string;
  rotationPosition: number;
}

interface WeekAssignment {
  startDate: Date;
  householdId: string;
}

export function assignHouseholdsToWeeks(
  households: HouseholdForSchedule[],
  startDate: Date,
  count: number,
): WeekAssignment[] {
  if (households.length === 0) return [];

  const sorted = [...households].sort((a, b) => a.rotationPosition - b.rotationPosition);
  const assignments: WeekAssignment[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);

    assignments.push({
      startDate: weekStart,
      householdId: sorted[i % sorted.length].id,
    });
  }

  return assignments;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

export function formatWeekRange(startDate: Date): string {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
}
