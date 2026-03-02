interface PortionDisplayProps {
  portions: number;
}

export function PortionDisplay({ portions }: PortionDisplayProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{portions}</span>
      <span>{portions === 1 ? 'portion' : 'portions'}</span>
    </div>
  );
}
