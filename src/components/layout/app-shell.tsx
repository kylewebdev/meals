import { type ReactNode } from 'react';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { UserMenu } from './user-menu';

interface AppShellProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  notificationSlot?: ReactNode;
  optOutBanner?: ReactNode;
}

export function AppShell({ children, userName, userRole, notificationSlot, optOutBanner }: AppShellProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 md:gap-6">
            <MobileNav />
            <span className="text-lg font-semibold">Meals</span>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/schedule">Schedule</NavLink>
              <NavLink href="/recipes">Recipes</NavLink>
              <NavLink href="/household">Household</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {notificationSlot}
            <UserMenu userName={userName} isAdmin={isAdmin} />
          </div>
        </div>
      </header>
      {optOutBanner}
      <main className="p-6">{children}</main>
    </div>
  );
}
