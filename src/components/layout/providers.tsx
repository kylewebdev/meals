'use client';

import { SmoothScroll } from '@/components/layout/smooth-scroll';
import { ToastProvider } from '@/components/ui/toast';
import { type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <ToastProvider>{children}</ToastProvider>
    </SmoothScroll>
  );
}
