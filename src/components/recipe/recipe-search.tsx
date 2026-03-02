'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useState } from 'react';

export function RecipeSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredQuery) {
      params.set('q', deferredQuery);
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      router.replace(pathname);
    }
  }, [deferredQuery, pathname, router]);

  return (
    <Input
      type="search"
      placeholder="Search recipes..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="max-w-xs"
    />
  );
}
