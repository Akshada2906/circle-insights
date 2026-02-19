import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Target,
  GitBranch,
  Lightbulb,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  BarChart3,
  Bell,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Accounts', icon: Briefcase, href: '/accounts' },
  { title: 'Stakeholders', icon: Users, href: '/stakeholders' },
  { title: 'Financials', icon: DollarSign, href: '/financials' },
  { title: 'Circles', icon: Target, href: '/circles' },
  { title: 'Value Chain', icon: GitBranch, href: '/value-chain' },
  { title: 'Opportunities', icon: Lightbulb, href: '/opportunities', badge: 3 },
];

const secondaryNavItems: NavItem[] = [
  { title: 'Analytics', icon: BarChart3, href: '/analytics' },
  { title: 'Notifications', icon: Bell, href: '/notifications', badge: 5 },
  { title: 'Settings', icon: Settings, href: '/settings' },
  { title: 'Help', icon: HelpCircle, href: '/help' },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = currentPath === item.href;
    const Icon = item.icon;

    const handleClick = () => {
      navigate(item.href);
    };

    const button = (
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          'w-full justify-start gap-3 h-11 px-3 relative transition-all duration-200',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 border-l-2 border-sidebar-accent-foreground rounded-l-none'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          collapsed && 'justify-center px-0'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary-foreground')} />
        {!collapsed && (
          <>
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto text-xs px-2 py-0.5 rounded-full",
                isActive
                  ? "bg-sidebar-primary-foreground text-sidebar-primary"
                  : "bg-sidebar-accent text-sidebar-foreground"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 bg-sidebar-primary text-sidebar-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-sidebar-background">
            {item.badge}
          </span>
        )}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo Section */}
      <div className={cn("flex items-center justify-center border-b border-sidebar-border transition-all duration-300",
        collapsed ? "h-16 px-4" : "h-32 px-4"
      )}>
        <div className={cn('flex items-center overflow-hidden w-full transition-all duration-300', collapsed ? 'justify-center' : 'flex-col gap-2')}>
          <div className={cn("bg-white rounded-full flex items-center justify-center p-2 shadow-sm transition-all duration-300 hover:scale-105",
            collapsed ? "w-10 h-10" : "w-16 h-16"
          )}>
            <img
              src="/Nitor Logo.png"
              alt="Nitor Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <span className="font-bold text-sidebar-foreground text-lg">Smart Organization Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </nav>

        <Separator className="my-4 mx-3 bg-sidebar-border" />

        <nav className="px-3 space-y-1">
          {secondaryNavItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Account Section */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer',
            collapsed && 'justify-center p-2'
          )}
        >
        </div>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </aside>
  );
}
