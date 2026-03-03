'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis } from 'lenis/react';
import { type ReactNode } from 'react';

export function SmoothScroll({ children }: { children: ReactNode }) {
  return <ReactLenis root>{children}</ReactLenis>;
}
