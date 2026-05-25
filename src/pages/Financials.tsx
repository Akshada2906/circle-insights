import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Search, Building2, DollarSign, Brain, TrendingUp, Trash2,
  MoreVertical, Filter, Calendar as CalendarIcon, BarChart3, PieChart as PieChartIcon, Users,
  ArrowRight, Download, Activity, Target, ChevronDown, Check, Loader2, FolderKanban, SlidersHorizontal
} from 'lucide-react';
import {
  getFinanceAccounts,
  deleteFinanceAccount,
  getFinanceDashboardStats,
  getFinanceDeliveryUnits
} from '@/services/api';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MainLayout } from '@/components/layout/MainLayout';
import type { Account } from '@/types/finance-database';
import { FinancialAccountCard } from '@/components/accounts/FinancialAccountCard';

const Financials = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [duFilter, setDuFilter] = useState("All");

  const [revRange, setRevRange] = useState<[number, number]>([0, 1000000]);
  const [aiRevRange, setAiRevRange] = useState<[number, number]>([0, 1000000]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch accounts list
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const data = await getFinanceAccounts();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => ((b.current_revenue || b.total_revenue || 0) - (a.current_revenue || a.total_revenue || 0)));
  }, [accounts]);

  const availableManagers = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.account_manager).filter(Boolean))).sort() as string[];
  }, [accounts]);

  const availableDUs = useMemo(() => {
    return Array.from(new Set(accounts.map(a => a.delivery_unit?.name).filter(Boolean))).sort() as string[];
  }, [accounts]);

  const maxPossibleRev = useMemo(() => {
    if (!accounts.length) return 1000000;
    return Math.max(...accounts.map(a => (a.current_revenue || a.total_revenue || 0)), 1000000);
  }, [accounts]);

  const maxPossibleAiRev = useMemo(() => {
    if (!accounts.length) return 1000000;
    return Math.max(...accounts.map(a => a.ai_revenue || 0), 1000000);
  }, [accounts]);

  // Set ranges on initial load
  useEffect(() => {
    if (accounts.length > 0) {
      setRevRange([0, maxPossibleRev]);
      setAiRevRange([0, maxPossibleAiRev]);
    }
  }, [accounts.length, maxPossibleRev, maxPossibleAiRev]);

  const filteredAccounts = useMemo(() => {
    return sortedAccounts.filter(acc => {
      // 1. Name Match
      const matchName = acc.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        acc.delivery_unit?.name?.toLowerCase().includes(accountSearchTerm.toLowerCase());
      if (!matchName) return false;

      // 2. Status Match
      const isActive = (acc.active_project_count || 0) > 0;
      if (statusFilter === "Active" && !isActive) return false;
      if (statusFilter === "Inactive" && isActive) return false;

      // 3. Manager Match
      if (managerFilter !== "All" && acc.account_manager !== managerFilter) return false;

      // 4. DU Match
      if (duFilter !== "All" && acc.delivery_unit?.name !== duFilter) return false;

      // 5. Current Rev Match
      const rev = acc.current_revenue || acc.total_revenue || 0;
      if (rev < revRange[0] || rev > revRange[1]) return false;

      // 6. AI Rev Match
      const aiRev = acc.ai_revenue || 0;
      if (aiRev < aiRevRange[0] || aiRev > aiRevRange[1]) return false;

      return true;
    });
  }, [sortedAccounts, accountSearchTerm, statusFilter, managerFilter, duFilter, revRange, aiRevRange]);

  const displayedAccounts = useMemo(() => {
    if (showAll || accountSearchTerm !== "") return filteredAccounts;
    return filteredAccounts.slice(0, 10);
  }, [filteredAccounts, showAll, accountSearchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

  if (loadingAccounts && accounts.length === 0) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Accounts</h1>
            <p className="text-slate-500 mt-1">Manage your strategic accounts and their records</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/financials/import')} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Import Data
            </Button>
            <Button onClick={() => navigate('/financials/new')} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> Add Account
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 animate-in fade-in duration-300 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search accounts by name..."
              className="pl-9 h-11 border-slate-200 bg-white"
              value={accountSearchTerm}
              onChange={(e) => setAccountSearchTerm(e.target.value)}
            />
          </div>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-11 px-4 gap-2 font-medium bg-white">
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {(statusFilter !== "All" || duFilter !== "All" || managerFilter !== "All" || revRange[0] > 0 || revRange[1] < maxPossibleRev || aiRevRange[0] > 0 || aiRevRange[1] < maxPossibleAiRev) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full">
                    {[statusFilter !== "All", duFilter !== "All", managerFilter !== "All", (revRange[0] > 0 || revRange[1] < maxPossibleRev), (aiRevRange[0] > 0 || aiRevRange[1] < maxPossibleAiRev)].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 space-y-6" align="start">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 leading-none">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("All");
                    setManagerFilter("All");
                    setDuFilter("All");
                    setRevRange([0, maxPossibleRev]);
                    setAiRevRange([0, maxPossibleAiRev]);
                  }}
                  className="text-slate-500 h-8 text-xs hover:text-slate-800"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Delivery Unit</Label>
                  <Select value={duFilter} onValueChange={setDuFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All DUs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All DUs</SelectItem>
                      {availableDUs.map(du => <SelectItem key={du} value={du}>{du}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Account Manager</Label>
                  <Select value={managerFilter} onValueChange={setManagerFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Managers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Managers</SelectItem>
                      {availableManagers.map(mgr => <SelectItem key={mgr} value={mgr}>{mgr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Current Revenue</Label>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatCurrency(revRange[0])} - {formatCurrency(revRange[1])}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={maxPossibleRev}
                    step={10000}
                    value={revRange}
                    onValueChange={(val) => setRevRange(val as [number, number])}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">AI Revenue</Label>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatCurrency(aiRevRange[0])} - {formatCurrency(aiRevRange[1])}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={maxPossibleAiRev}
                    step={10000}
                    value={aiRevRange}
                    onValueChange={(val) => setAiRevRange(val as [number, number])}
                    className="mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {filteredAccounts.length > 10 && accountSearchTerm === "" && statusFilter === "All" && duFilter === "All" && managerFilter === "All" && revRange[0] === 0 && revRange[1] === maxPossibleRev && aiRevRange[0] === 0 && aiRevRange[1] === maxPossibleAiRev && (
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="h-11 px-6 font-semibold border-slate-200 hover:border-blue-300 hover:bg-white text-blue-600 transition-all whitespace-nowrap ml-auto"
            >
              {showAll ? "Show Top 10 Only" : `View All Accounts (${filteredAccounts.length})`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {displayedAccounts.map((p) => (
            <FinancialAccountCard
              key={p.id}
              account={p}
              onDelete={async (id) => {
                try {
                  await deleteFinanceAccount(id);
                  setAccounts(prev => prev.filter(a => a.id !== id));
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          ))}
          {filteredAccounts.length === 0 && !loadingAccounts && (
            <div className="col-span-full py-24 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
              No accounts found.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Financials;
