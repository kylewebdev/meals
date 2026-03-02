import Link from 'next/link';

export function OptOutBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      You&apos;ve opted out of this week&apos;s meals.{' '}
      <Link href="/profile" className="font-medium underline underline-offset-2 hover:no-underline">
        Manage
      </Link>
    </div>
  );
}
