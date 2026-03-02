import { Badge } from '@/components/ui/badge';

interface DietarySummaryProps {
  allergies: Record<string, string[]>;
  preferences: Record<string, string[]>;
  notes: { name: string; notes: string }[];
}

export function DietarySummary({ allergies, preferences, notes }: DietarySummaryProps) {
  const hasData =
    Object.keys(allergies).length > 0 ||
    Object.keys(preferences).length > 0 ||
    notes.length > 0;

  if (!hasData) {
    return <p className="text-sm text-zinc-500">No dietary information on file.</p>;
  }

  return (
    <div className="space-y-4">
      {Object.keys(allergies).length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">Allergies</h4>
          <div className="space-y-1">
            {Object.entries(allergies).map(([allergy, names]) => (
              <div key={allergy} className="flex items-center gap-2">
                <Badge variant="destructive">{allergy}</Badge>
                <span className="text-sm text-zinc-500">{names.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(preferences).length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">Preferences</h4>
          <div className="space-y-1">
            {Object.entries(preferences).map(([pref, names]) => (
              <div key={pref} className="flex items-center gap-2">
                <Badge variant="success">{pref}</Badge>
                <span className="text-sm text-zinc-500">{names.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Notes</h4>
          <ul className="space-y-1 text-sm">
            {notes.map((n) => (
              <li key={n.name}>
                <span className="font-medium">{n.name}:</span>{' '}
                <span className="text-zinc-500">{n.notes}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
