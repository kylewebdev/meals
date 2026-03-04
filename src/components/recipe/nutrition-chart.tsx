'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface NutritionChartProps {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  servings?: number | null;
  layout?: 'stacked' | 'split';
}

const COLORS = {
  Protein: '#3b82f6',
  Carbs: '#10b981',
  Fat: '#ef4444',
};

function AnimatedCalories({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useRef(false);
  const targetValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    const animate = (from: number, to: number) => {
      cancelAnimationFrame(rafId);
      const duration = from === 0 ? 600 : 400;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        if (progress < 1) rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    };

    if (isVisible.current) {
      if (targetValue.current !== value) {
        const from = targetValue.current;
        targetValue.current = value;
        animate(from, value);
      }
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.current = true;
          targetValue.current = value;
          observer.disconnect();
          animate(0, value);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <div ref={ref} className="flex items-baseline gap-1.5">
      <span className="text-4xl font-bold tabular-nums text-amber-500">
        {display.toLocaleString()}
      </span>
      <span className="text-sm font-medium text-zinc-400">kcal</span>
    </div>
  );
}

export function NutritionChart({
  calories,
  proteinG,
  carbsG,
  fatG,
  servings,
  layout = 'stacked',
}: NutritionChartProps) {
  const cal = calories ?? 0;
  const protein = proteinG ?? 0;
  const carbs = carbsG ?? 0;
  const fat = fatG ?? 0;

  if (cal === 0 && protein === 0 && carbs === 0 && fat === 0) return null;

  const macrosData = [
    { name: 'Protein', value: protein, unit: 'g' },
    { name: 'Carbs', value: carbs, unit: 'g' },
    { name: 'Fat', value: fat, unit: 'g' },
  ].filter((d) => d.value > 0);

  const hasMacros = macrosData.length > 0;

  if (layout === 'split') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cal > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-500">Calories</h3>
            <div className="flex h-52 flex-col items-center justify-center gap-1">
              <AnimatedCalories value={cal} />
              {servings && servings > 1 && (
                <span className="text-sm text-zinc-400">
                  {Math.round(cal / servings)} kcal / serving
                </span>
              )}
            </div>
          </div>
        )}
        {hasMacros && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-500">Macros</h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={macrosData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    innerRadius={20}
                    paddingAngle={2}
                    label={({ name, value }) => `${name} ${value}g`}
                  >
                    {macrosData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}g`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cal > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500">Calories</h3>
          <AnimatedCalories value={cal} />
          {servings && servings > 1 && (
            <span className="mt-1 text-sm text-zinc-400">
              {Math.round(cal / servings)} kcal / serving
            </span>
          )}
        </div>
      )}
      {hasMacros && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-500">Macros</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={macrosData} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} tickMargin={8} />
                <Tooltip
                  formatter={(value, name, props) => {
                    const unit = (props.payload as { unit?: string })?.unit ?? '';
                    return [`${value} ${unit}`, name];
                  }}
                />
                <Bar dataKey="value" radius={0}>
                  {macrosData.map((entry) => (
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
      )}
    </div>
  );
}
