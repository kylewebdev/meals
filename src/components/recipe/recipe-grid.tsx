import type { RecipeRatingSummary } from '@/lib/queries/ratings';
import { RecipeCard } from './recipe-card';

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  calories: number | null;
  tags: string[] | null;
}

interface RecipeGridProps {
  recipes: Recipe[];
  ratingsMap?: Map<string, RecipeRatingSummary>;
}

export function RecipeGrid({ recipes, ratingsMap }: RecipeGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          {...recipe}
          ratingAggregate={ratingsMap?.get(recipe.id)}
        />
      ))}
    </div>
  );
}
