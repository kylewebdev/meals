interface PickupInfoProps {
  location: string | null;
  times: string | null;
  notes: string | null;
}

export function PickupInfo({ location, times, notes }: PickupInfoProps) {
  if (!location && !times && !notes) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
        Pickup Information
      </h4>
      <div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
        {location && (
          <p>
            <span className="font-medium">Location:</span> {location}
          </p>
        )}
        {times && (
          <p>
            <span className="font-medium">Times:</span> {times}
          </p>
        )}
        {notes && (
          <p>
            <span className="font-medium">Notes:</span> {notes}
          </p>
        )}
      </div>
    </div>
  );
}
