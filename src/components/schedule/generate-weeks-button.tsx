'use client';

import { generateWeeks } from '@/actions/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function GenerateWeeksButton() {
  const [count, setCount] = useState('4');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    const res = await generateWeeks(parseInt(count) || 4);

    if (res.success) {
      setResult({ message: `Generated ${res.data.generated} weeks` });
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div>
          <Label htmlFor="week-count">Weeks to generate</Label>
          <Input
            id="week-count"
            type="number"
            min="1"
            max="52"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-24"
          />
        </div>
        <Button onClick={handleGenerate} loading={loading}>Generate</Button>
      </div>
      {result?.message && (
        <p className="text-sm text-green-600">{result.message}</p>
      )}
      {result?.error && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
    </div>
  );
}
