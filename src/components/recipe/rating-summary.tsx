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
    const parts: React.ReactNode[] = [];

    if (love > 0) {
      parts.push(
        <span key="love" className="text-green-600">
          {love}/{total} loved
        </span>,
      );
    }
    if (fine > 0 && love === 0 && dislike === 0) {
      parts.push(
        <span key="fine" className="text-zinc-500">
          {fine}/{total} fine
        </span>,
      );
    }
    if (dislike > 0) {
      parts.push(
        <span key="dislike" className="text-red-600">
          {dislike}/{total} disliked
        </span>,
      );
    }

    return (
      <span className="text-xs">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span className="text-zinc-400"> · </span>}
            {part}
          </span>
        ))}
      </span>
    );
  }

  const parts: string[] = [];
  if (love > 0) parts.push(`${love} loved`);
  if (fine > 0) parts.push(`${fine} fine`);
  if (dislike > 0) parts.push(`${dislike} disliked`);

  return (
    <span className="text-sm font-normal text-zinc-500">
      — {parts.join(' · ')}
    </span>
  );
}
