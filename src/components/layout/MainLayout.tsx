import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        {children}
      </main>
    </div>
  );
}
