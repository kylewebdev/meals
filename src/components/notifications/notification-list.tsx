'use client';

import {
  markAsRead,
  markAllAsRead,
  archiveNotification,
  archiveAllRead,
  unarchiveNotification,
} from '@/actions/notifications';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './notification-item';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
}

interface NotificationListProps {
  notifications: Notification[];
  mode: 'inbox' | 'archive';
  onMutate?: () => void;
}

export function NotificationList({ notifications, mode, onMutate }: NotificationListProps) {
  const hasUnread = notifications.some((n) => !n.readAt);
  const hasRead = notifications.some((n) => n.readAt);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    onMutate?.();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    onMutate?.();
  };

  const handleArchive = async (id: string) => {
    await archiveNotification(id);
    onMutate?.();
  };

  const handleArchiveAllRead = async () => {
    await archiveAllRead();
    onMutate?.();
  };

  const handleUnarchive = async (id: string) => {
    await unarchiveNotification(id);
    onMutate?.();
  };

  if (notifications.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-zinc-500">
        {mode === 'inbox' ? 'No notifications' : 'No archived notifications'}
      </p>
    );
  }

  return (
    <div>
      {mode === 'inbox' && (hasUnread || hasRead) && (
        <div className="flex gap-1 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          {hasUnread && (
            <Button variant="ghost" size="sm" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
          {hasRead && (
            <Button variant="ghost" size="sm" onClick={handleArchiveAllRead}>
              Archive read
            </Button>
          )}
        </div>
      )}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            {...n}
            onMarkRead={handleMarkRead}
            onArchive={mode === 'inbox' ? handleArchive : undefined}
            onUnarchive={mode === 'archive' ? handleUnarchive : undefined}
          />
        ))}
      </div>
    </div>
  );
}
