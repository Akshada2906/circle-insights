import { Building2, RefreshCw, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  accountName: string;
  lastUpdated: string;
}

export function DashboardHeader({ accountName, lastUpdated }: DashboardHeaderProps) {
  return (
    <header className="dashboard-card mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-chart-4 rounded-xl shadow-lg shadow-primary/20">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{accountName}</h1>
              <Badge className="bg-success/20 text-success border-success/30 border">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Stakeholder & Circle Penetration Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Last synced: {lastUpdated}
          </span>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="icon" className="w-9 h-9">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
