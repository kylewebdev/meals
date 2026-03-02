interface HeadcountDisplayProps {
  count: number;
}

export function HeadcountDisplay({ count }: HeadcountDisplayProps) {
  return (
    <div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
      <span className="text-sm text-zinc-500">Portions per meal: </span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}
