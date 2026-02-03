import { useState } from 'react';
import { AccountFinancials } from '@/types/dashboard';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AccountFinancialsTrackerProps {
  financials: AccountFinancials[];
  onUpdate: (financials: AccountFinancials) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function AccountFinancialsTracker({ financials, onUpdate }: AccountFinancialsTrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<AccountFinancials>>({});

  const handleValueChange = (field: keyof AccountFinancials, value: number) => {
    const newValues = { ...editValues, [field]: value };
    
    // Auto-calculate shortfall
    if (field === 'target_2026' || field === 'forecast') {
      const target = field === 'target_2026' ? value : (editValues.target_2026 ?? 0);
      const forecast = field === 'forecast' ? value : (editValues.forecast ?? 0);
      newValues.shortfall = target - forecast;
    }
    
    setEditValues(newValues);
  };

  const startEditing = (item: AccountFinancials) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      const original = financials.find(f => f.id === editingId)!;
      onUpdate({ ...original, ...editValues });
      setEditingId(null);
      setEditValues({});
    }
  };

  const getShortfallStatus = (shortfall: number, target: number) => {
    const percentage = (shortfall / target) * 100;
    if (percentage <= 10) return { color: 'text-success', bg: 'bg-success/10', label: 'On Track' };
    if (percentage <= 25) return { color: 'text-warning', bg: 'bg-warning/10', label: 'At Risk' };
    return { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critical' };
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Account Financials</h2>
            <p className="text-sm text-muted-foreground">Track targets, forecasts, and shortfalls</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {financials.map((item) => {
          const status = getShortfallStatus(item.shortfall, item.target_2026);
          const isEditing = editingId === item.id;
          
          return (
            <div
              key={item.id}
              className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-border transition-colors cursor-pointer"
              onClick={() => !isEditing && startEditing(item)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{item.account_name}</h3>
                  <Badge className={`${status.bg} ${status.color} border-0`}>
                    {status.label}
                  </Badge>
                </div>
                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEdit();
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Target 2026</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.target_2026 || 0}
                      onChange={(e) => handleValueChange('target_2026', parseInt(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                      className="editable-cell w-full text-lg font-semibold text-foreground bg-secondary/50 rounded px-2 py-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(item.target_2026)}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.current || 0}
                      onChange={(e) => handleValueChange('current', parseInt(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                      className="editable-cell w-full text-lg font-semibold text-primary bg-secondary/50 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <p className="text-lg font-semibold text-primary">{formatCurrency(item.current)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Forecast</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValues.forecast || 0}
                      onChange={(e) => handleValueChange('forecast', parseInt(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                      className="editable-cell w-full text-lg font-semibold text-success bg-secondary/50 rounded px-2 py-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <p className="text-lg font-semibold text-success">{formatCurrency(item.forecast)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Shortfall</p>
                  <div className="flex items-center gap-2">
                    {(isEditing ? editValues.shortfall : item.shortfall)! > 0 ? (
                      <AlertTriangle className={`w-4 h-4 ${status.color}`} />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-success" />
                    )}
                    <p className={`text-lg font-semibold ${status.color}`}>
                      {formatCurrency(isEditing ? editValues.shortfall ?? 0 : item.shortfall)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to Target</span>
                  <span>{Math.round((item.forecast / item.target_2026) * 100)}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill bg-gradient-to-r from-primary to-success"
                    style={{ width: `${Math.min((item.forecast / item.target_2026) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
