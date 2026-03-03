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
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

export function NotificationItem({
  id,
  title,
  body,
  linkUrl,
  readAt,
  createdAt,
  onMarkRead,
  onArchive,
  onUnarchive,
}: NotificationItemProps) {
  const isUnread = !readAt;
  const timeAgo = getTimeAgo(createdAt);

  const content = (
    <div
      className={cn(
        'group relative px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
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
        {(onArchive || onUnarchive) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onArchive) onArchive(id);
              if (onUnarchive) onUnarchive(id);
            }}
            className="mt-0.5 flex-shrink-0 rounded p-1 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-600 group-hover:opacity-100 dark:hover:text-zinc-300"
            title={onArchive ? 'Archive' : 'Unarchive'}
          >
            {onArchive ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 14 2 2 4-4" />
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
              </svg>
            )}
          </button>
        )}
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
