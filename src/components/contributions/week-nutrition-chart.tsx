'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Contribution {
  recipe: {
    calories: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  } | null;
}

interface SwapDay {
  contributions: Contribution[];
}

interface WeekNutritionChartProps {
  swapDays: SwapDay[];
}

const COLORS = {
  Calories: '#f59e0b',
  Protein: '#3b82f6',
  Carbs: '#10b981',
  Fat: '#ef4444',
};

export function WeekNutritionChart({ swapDays }: WeekNutritionChartProps) {
  const allContributions = swapDays.flatMap((sd) => sd.contributions);
  if (allContributions.length === 0) return null;

  const totals = allContributions.reduce(
    (acc, c) => ({
      calories: acc.calories + (c.recipe?.calories ?? 0),
      protein: acc.protein + (c.recipe?.proteinG ?? 0),
      carbs: acc.carbs + (c.recipe?.carbsG ?? 0),
      fat: acc.fat + (c.recipe?.fatG ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  if (totals.calories === 0 && totals.protein === 0 && totals.carbs === 0 && totals.fat === 0) {
    return null;
  }

  const data = [
    { name: 'Calories', value: totals.calories, unit: 'kcal' },
    { name: 'Protein', value: totals.protein, unit: 'g' },
    { name: 'Carbs', value: totals.carbs, unit: 'g' },
    { name: 'Fat', value: totals.fat, unit: 'g' },
  ];

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-zinc-500">Weekly Nutrition Breakdown</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} tickMargin={8} />
            <Tooltip
              formatter={(value, name, props) => {
                const unit = (props.payload as { unit?: string })?.unit ?? '';
                return [`${value} ${unit}`, name];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
