interface RatingSummaryProps {
  love: number;
  fine: number;
  dislike: number;
  total: number;
  compact?: boolean;
}

export function RatingSummary({ love, fine, dislike, total, compact }: RatingSummaryProps) {
  if (total === 0) return null;

  if (compact) {
    if (love > 0) {
      return (
        <span className="text-xs text-green-600">
          {love}/{total} loved
        </span>
      );
    }
    if (dislike > 0) {
      return (
        <span className="text-xs text-red-500">
          {dislike}/{total} disliked
        </span>
      );
    }
    return (
      <span className="text-xs text-zinc-500">
        {fine}/{total} fine
      </span>
    );
  }

  const parts: string[] = [];
  if (love > 0) parts.push(`${love} loved`);
  if (fine > 0) parts.push(`${fine} fine`);
  if (dislike > 0) parts.push(`${dislike} disliked`);

  return (
    <span className="text-sm text-zinc-600 dark:text-zinc-400">
      {parts.join(' · ')}
    </span>
  );
}
