'use client';

import { disableViewAs } from '@/actions/view-as';
import { useRouter } from 'next/navigation';

export function ViewAsBanner({ name }: { name: string }) {
  const router = useRouter();

  async function handleExit() {
    await disableViewAs();
    router.refresh();
  }

  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
      <span>Viewing as {name}</span>
      <button
        onClick={handleExit}
        className="ml-3 rounded-md bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-300 dark:bg-amber-800 dark:text-amber-100 dark:hover:bg-amber-700"
      >
        Exit
      </button>
    </div>
  );
}
