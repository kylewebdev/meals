import { ContributionCard } from './contribution-card';

interface Contribution {
  id: string;
  dishName: string | null;
  recipeId: string | null;
  notes: string | null;
  servings: number | null;
  household: { id: string; name: string };
  recipe: {
    id: string;
    name: string;
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

interface ContributionListProps {
  contributions: Contribution[];
}

export function ContributionList({ contributions }: ContributionListProps) {
  if (contributions.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No contributions yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((c) => (
        <ContributionCard
          key={c.id}
          householdName={c.household.name}
          dishName={c.dishName}
          recipeId={c.recipeId}
          recipeName={c.recipe?.name ?? null}
          notes={c.notes}
          servings={c.servings}
          calories={c.recipe?.calories ?? null}
          proteinG={c.recipe?.proteinG ?? null}
          carbsG={c.recipe?.carbsG ?? null}
          fatG={c.recipe?.fatG ?? null}
        />
      ))}
    </div>
  );
}
