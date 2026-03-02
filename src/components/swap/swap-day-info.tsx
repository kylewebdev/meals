import { getDayName } from '@/lib/schedule-utils';

interface SwapDayInfoProps {
  label: string;
  dayOfWeek: number;
  coversFrom: number;
  coversTo: number;
  location: string | null;
  time: string | null;
  notes: string | null;
}

export function SwapDayInfo({
  label,
  coversFrom,
  coversTo,
  location,
  time,
  notes,
}: SwapDayInfoProps) {
  const coversRange = coversFrom === coversTo
    ? getDayName(coversFrom)
    : `${getDayName(coversFrom)} – ${getDayName(coversTo)}`;

  const hasLogistics = location || time || notes;

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500">
        Covers: <span className="font-medium text-zinc-700 dark:text-zinc-300">{coversRange}</span>
      </p>
      {hasLogistics && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            {location && (
              <p>
                <span className="font-medium">Location:</span> {location}
              </p>
            )}
            {time && (
              <p>
                <span className="font-medium">Time:</span> {time}
              </p>
            )}
            {notes && (
              <p>
                <span className="font-medium">Notes:</span> {notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
