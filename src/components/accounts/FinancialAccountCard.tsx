import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Account } from '@/types/finance-database';

interface FinancialAccountCardProps {
  account: Account;
  onDelete?: (id: string) => Promise<void>;
  backUrl?: string;
}

export const FinancialAccountCard: React.FC<FinancialAccountCardProps> = ({ account, onDelete, backUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveBackUrl = backUrl || location.pathname + location.search;
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const totalRev = account.current_revenue || account.total_revenue || 0;
  const aiRev = account.ai_revenue || 0;
  const penetration = account.ai_penetration_pct || 0;

  const isClient = (() => {
    const nameLower = (account.name || '').toLowerCase();
    return nameLower.includes('gordian') || nameLower.includes('provation') || nameLower.includes('fluke');
  })();

  return (
    <Card
      className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300 border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-100/40"
      onClick={() => navigate(`/financials/${account.id}`, { state: { backUrl: effectiveBackUrl } })}
    >
      <CardHeader className="pb-3 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100/50 rounded-lg shrink-0 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate text-lg text-blue-950">{account.name}</h3>
                {/* {isClient ? (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">Client</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">Non-Client</Badge>
                )} */}
                {account.active_project_count > 0 ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">Active</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">Inactive</Badge>
                )}
                {account.is_sales && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">Sales</Badge>
                )}

              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-blue-100/50 text-blue-900/40 hover:text-blue-900">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/financials/${account.id}/edit`, { state: { backUrl: effectiveBackUrl } }); }}>
                Edit Account
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteAlert(true);
                  }}
                  className="text-red-500"
                >
                  Delete Account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Manager</p>
            <p className="text-xs font-bold text-slate-700 truncate" title={account.account_manager}>{account.account_manager || 'Unassigned'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Revenue</p>
            <p className="text-xs font-bold text-slate-900">{formatCurrency(account.target_revenue || 0)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Revenue</p>
            <p className="text-xs font-bold text-slate-900">{formatCurrency(totalRev)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Revenue</p>
            <p className="text-xs font-bold text-emerald-600">{formatCurrency(aiRev)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Projects</p>
            <p className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md w-fit border border-blue-100">{account.active_project_count || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inactive Projects</p>
            <p className="text-xs font-bold text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md w-fit border border-slate-200">{account.inactive_project_count || 0}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">AI Penetration</span>
            <span className="text-[10px] font-bold text-blue-700">{penetration.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-100/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-1000"
              style={{ width: `${Math.min(penetration, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 text-[10px] text-slate-400 font-medium">
          <span>Total Projects: {account.project_count || 0}</span>
        </div>
      </CardContent>

      {onDelete && (
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete <strong>{account.name}</strong>? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setShowDeleteAlert(false); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={async (e) => {
                  e.stopPropagation();
                  await onDelete(account.id);
                  setShowDeleteAlert(false);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
};
