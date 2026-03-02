'use client';

import { markAsRead, markAllAsRead } from '@/actions/notifications';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './notification-item';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
}

interface NotificationListProps {
  notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.readAt);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    router.refresh();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    router.refresh();
  };

  if (notifications.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-zinc-500">No notifications</p>;
  }

  return (
    <div>
      {hasUnread && (
        <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          <Button variant="ghost" size="sm" onClick={handleMarkAll}>
            Mark all as read
          </Button>
        </div>
      )}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {notifications.map((n) => (
          <NotificationItem key={n.id} {...n} onMarkRead={handleMarkRead} />
        ))}
      </div>
    </div>
  );
}
