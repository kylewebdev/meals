import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700">
      <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0z" clipRule="evenodd" /></svg>
      {children}
    </Link>
  );
}
