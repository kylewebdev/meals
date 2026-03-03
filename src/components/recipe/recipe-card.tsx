import type { RecipeRatingSummary } from '@/lib/queries/ratings';
import { RatingSummary } from '@/components/recipe/rating-summary';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface RecipeCardProps {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  tags: string[] | null;
  ratingAggregate?: RecipeRatingSummary;
}

export function RecipeCard({
  id,
  name,
  description,
  imageUrl,
  servings,
  prepTimeMinutes,
  cookTimeMinutes,
  calories,
  tags,
  ratingAggregate,
}: RecipeCardProps) {
  const totalTime = (prepTimeMinutes ?? 0) + (cookTimeMinutes ?? 0);

  return (
    <Link href={`/recipes/${id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {imageUrl && (
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        )}
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
          {ratingAggregate && ratingAggregate.total > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                {ratingAggregate.love > 0 && (
                  <div
                    className="bg-green-500"
                    style={{ width: `${(ratingAggregate.love / ratingAggregate.total) * 100}%` }}
                  />
                )}
                {ratingAggregate.fine > 0 && (
                  <div
                    className="bg-zinc-400 dark:bg-zinc-500"
                    style={{ width: `${(ratingAggregate.fine / ratingAggregate.total) * 100}%` }}
                  />
                )}
                {ratingAggregate.dislike > 0 && (
                  <div
                    className="bg-red-500"
                    style={{ width: `${(ratingAggregate.dislike / ratingAggregate.total) * 100}%` }}
                  />
                )}
              </div>
              <RatingSummary {...ratingAggregate} compact />
            </div>
          )}
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
