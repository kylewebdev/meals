import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

interface RecipeCardProps {
  id: string;
  name: string;
  description: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  tags: string[] | null;
}

export function RecipeCard({
  id,
  name,
  description,
  servings,
  prepTimeMinutes,
  cookTimeMinutes,
  calories,
  tags,
}: RecipeCardProps) {
  const totalTime = (prepTimeMinutes ?? 0) + (cookTimeMinutes ?? 0);

  return (
    <Link href={`/recipes/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <h3 className="font-semibold">{name}</h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
            {servings && <span>{servings} servings</span>}
            {totalTime > 0 && <span>{totalTime} min</span>}
            {calories && <span>{calories} cal</span>}
          </div>
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
