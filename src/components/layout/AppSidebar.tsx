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
            ? 'bg-primary/10 text-primary hover:bg-primary/15 border-l-2 border-primary rounded-l-none'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          collapsed && 'justify-center px-0'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {!collapsed && (
          <>
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
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
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="p-2 bg-gradient-to-br from-primary to-chart-4 rounded-lg shadow-lg shadow-primary/20">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-sm">OrgManager</span>
              <span className="text-[10px] text-muted-foreground">AI Penetration</span>
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

        <Separator className="my-4 mx-3" />

        <nav className="px-3 space-y-1">
          {secondaryNavItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </nav>
      </ScrollArea>

      {/* Account Section */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer',
            collapsed && 'justify-center p-2'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
            TC
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">TechCorp Global</p>
              <p className="text-xs text-muted-foreground truncate">Enterprise Account</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-card shadow-md hover:bg-muted"
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
