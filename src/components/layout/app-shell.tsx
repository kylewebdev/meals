import { type ReactNode } from 'react';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { UserMenu } from './user-menu';

interface AppShellProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  notificationSlot?: ReactNode;
}

export function AppShell({ children, userName, userRole, notificationSlot }: AppShellProps) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-6">
            <MobileNav />
            <span className="text-lg font-semibold">Meals</span>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/dashboard">My Cooks</NavLink>
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
      <main className="px-4 pt-6 pb-12 md:px-6 md:pt-8">{children}</main>
    </div>
  );
}
