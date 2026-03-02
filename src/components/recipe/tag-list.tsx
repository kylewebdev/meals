import { Badge } from '@/components/ui/badge';

interface TagListProps {
  tags: string[] | null;
}

export function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">{tag}</Badge>
      ))}
    </div>
  );
}
