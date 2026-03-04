import Image from 'next/image';
import { type ReactNode } from 'react';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { UserMenu } from './user-menu';
import { ViewAsBanner } from './view-as-banner';

interface AppShellProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  notificationSlot?: ReactNode;
  pendingRecipeCount?: number;
  hasUpcomingCook?: boolean;
  viewAsName?: string | null;
}

export function AppShell({
  children,
  userName,
  userRole,
  notificationSlot,
  pendingRecipeCount,
  hasUpcomingCook,
  viewAsName,
}: AppShellProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-6">
            <Image
              src="/meal-logo.svg"
              alt=""
              width={28}
              height={19}
              className="dark:invert"
            />
            <span className="text-lg font-semibold">Meals</span>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/up-next" dot={hasUpcomingCook}>Up Next</NavLink>
              <NavLink href="/recipes" badge={isAdmin ? pendingRecipeCount : undefined}>
                Recipes
              </NavLink>
              <NavLink href="/co-op">Co-op</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {notificationSlot}
            <UserMenu userName={userName} isAdmin={isAdmin} />
          </div>
        </div>
      </header>
      {viewAsName && <ViewAsBanner name={viewAsName} />}
      <main className="px-4 pt-6 pb-20 md:px-6 md:pt-8 md:pb-12">{children}</main>
      <MobileNav
        pendingRecipeCount={isAdmin ? pendingRecipeCount : undefined}
        hasUpcomingCook={hasUpcomingCook}
      />
    </div>
  );
}
