'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { fetchNotifications } from '@/actions/notifications';
import { NotificationList } from './notification-list';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
}

interface NotificationBellProps {
  unreadCount: number;
}

type Tab = 'inbox' | 'archive';

export function NotificationBell({ unreadCount: initialCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('inbox');
  const [inbox, setInbox] = useState<Notification[]>([]);
  const [archived, setArchived] = useState<Notification[]>([]);
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Sync server-rendered count when it changes (e.g. after navigation)
  useEffect(() => {
    setDisplayCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpen() {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      loadNotifications();
    }
  }

  function loadNotifications() {
    startTransition(async () => {
      const data = await fetchNotifications();
      setInbox(data.inbox as Notification[]);
      setArchived(data.archived as Notification[]);
      setDisplayCount(data.unreadCount);
      setLoaded(true);
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {displayCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setTab('inbox')}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === 'inbox'
                  ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
              )}
            >
              Inbox
              {displayCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {displayCount > 99 ? '99+' : displayCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('archive')}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === 'archive'
                  ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
              )}
            >
              Archive
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!loaded && isPending ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">Loading...</p>
            ) : (
              <NotificationList
                notifications={tab === 'inbox' ? inbox : archived}
                mode={tab}
                onMutate={loadNotifications}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
