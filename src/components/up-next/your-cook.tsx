import { formatDateRange, getSwapDate } from '@/lib/schedule-utils';
import type { UpcomingSwapDay } from '@/lib/queries/contributions';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface YourCookProps {
  upcomingCooks: UpcomingSwapDay[];
}

const dateFmt: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };

export function YourCook({ upcomingCooks }: YourCookProps) {
  if (upcomingCooks.length === 0) {
    return (
      <section>
        <h3 className="text-lg font-semibold pb-3">Your Cook</h3>
        <p className="text-sm text-zinc-500">You're off for the next few weeks.</p>
      </section>
    );
  }

  const [next, ...rest] = upcomingCooks;
  const swapDate = getSwapDate(next.weekStartDate, next.dayOfWeek);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Your Cook</h3>

      {/* Primary card */}
      <div className="relative overflow-hidden rounded-lg border-2 border-zinc-900 p-4 dark:border-zinc-100">
        {next.assignedRecipe?.imageUrl && (
          <>
            <Image
              src={next.assignedRecipe.imageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 0%, var(--background) 90%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, color-mix(in srgb, var(--background) 40%, transparent) 0%, var(--background) 100%)',
              }}
            />
          </>
        )}
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                {next.label} &middot; {swapDate.toLocaleDateString('en-US', dateFmt)}
              </p>
              <p className="text-xs text-zinc-400">
                Week of {formatDateRange(next.weekStartDate, next.coversFrom - 1, next.coversTo - 1)}
              </p>
            </div>
            <Link
              href={`/week/${next.weekId}`}
              className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-400"
            >
              View week
            </Link>
          </div>

          {next.assignedRecipe ? (
            <div className="mt-3 space-y-3">
              <p className="font-semibold">{next.assignedRecipe.name}</p>
              <div className="flex gap-2">
                <Link href={`/recipes/${next.assignedRecipe.id}?weekId=${next.weekId}`}>
                  <Button size="sm">View Recipe</Button>
                </Link>
                <Link href={`/recipes/${next.assignedRecipe.id}?weekId=${next.weekId}&tab=grocery`}>
                  <Button variant="secondary" size="sm">Shopping List</Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Recipe not yet assigned</p>
          )}
        </div>
      </div>

      {/* Upcoming list */}
      {rest.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-500">Coming up</h4>
          {rest.slice(0, 3).map((sd) => {
            const date = getSwapDate(sd.weekStartDate, sd.dayOfWeek);
            return (
              <Link
                key={sd.id}
                href={`/week/${sd.weekId}`}
                className="block rounded-lg border border-zinc-100 px-3 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <p className="text-sm">
                  {date.toLocaleDateString('en-US', dateFmt)}
                </p>
                {sd.assignedRecipe ? (
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {sd.assignedRecipe.name}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400">Recipe not yet assigned</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
