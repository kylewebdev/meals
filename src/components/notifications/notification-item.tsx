import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationItemProps {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({
  id,
  title,
  body,
  linkUrl,
  readAt,
  createdAt,
  onMarkRead,
}: NotificationItemProps) {
  const isUnread = !readAt;
  const timeAgo = getTimeAgo(createdAt);

  const content = (
    <div
      className={cn(
        'px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
        isUnread && 'bg-blue-50/50 dark:bg-blue-950/20',
      )}
      onClick={() => isUnread && onMarkRead(id)}
    >
      <div className="flex items-start gap-2">
        {isUnread && (
          <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {body && <p className="mt-0.5 text-xs text-zinc-500">{body}</p>}
          <p className="mt-1 text-xs text-zinc-400">{timeAgo}</p>
        </div>
      </div>
    </div>
  );

  if (linkUrl) {
    return <Link href={linkUrl}>{content}</Link>;
  }
  return content;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
