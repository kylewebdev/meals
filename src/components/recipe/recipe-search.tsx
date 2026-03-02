'use client';

import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useRef, useState } from 'react';

export function RecipeSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const deferredQuery = useDeferredValue(query);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  useEffect(() => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (deferredQuery) {
      params.set('q', deferredQuery);
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
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
