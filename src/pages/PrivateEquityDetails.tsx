import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Building2,
  ChevronLeft,
  LayoutDashboard,
  Brain,
  ShieldCheck,
  TrendingUp,
  Users,
  Target,
  Plus,
  Download,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Menu,
  Loader2,
  Zap
} from 'lucide-react';
import {
  getFinanceAccounts,
  getFinanceAccountById,
  getPrivateEquityById,
  deleteFinanceAccount
} from '@/services/api';
import { Account } from '@/types/finance-database';
import { FinancialAccountCard } from '@/components/accounts/FinancialAccountCard';


interface PeInsight {
  generated_at?: string | number;
  raw_output?: string | Record<string, unknown>;
  executive_summary?: string;
  summary?: string;
  recommended_actions?: any[];
  strategic_recommendations?: any[];
}

interface PrivateEquity {
  id: string;
  name: string;
  overview?: string;
  pe_insights?: PeInsight;
}

const PrivateEquityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<PrivateEquity | null>(null);
  const [insights, setInsights] = useState<PeInsight | null>(null);


  const [accountSearchTerm, setAccountSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [duFilter, setDuFilter] = useState("All");
  const [revRange, setRevRange] = useState<[number, number]>([0, 1000000]);
  const [aiRevRange, setAiRevRange] = useState<[number, number]>([0, 1000000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [accData, firmData] = await Promise.all([
          getFinanceAccounts(),
          getPrivateEquityById(id)
        ]);
        const matchedAccountsBasic = accData.filter((a: Account) => a.private_equity_id === id);

        const fullAccounts = await Promise.all(matchedAccountsBasic.map(a => getFinanceAccountById(a.id)));
        setAccounts(fullAccounts);
        setFirm(firmData);
        if (firmData.pe_insights) {
          try {
            const cleanStr = typeof firmData.pe_insights.raw_output === 'string'
              ? firmData.pe_insights.raw_output.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
              : firmData.pe_insights.raw_output;
            const parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
            setInsights({ ...firmData.pe_insights, ...parsed });
          } catch (e) {
            setInsights(firmData.pe_insights);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGenerateInsights = async () => {
    if (!id) return;
    navigate(`/private-equity/${id}/insights`);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteFinanceAccount(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (err) {
      console.error("Failed to delete account", err);
    }
  };

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

  useEffect(() => {
    if (accounts.length > 0) {
      setRevRange([0, maxPossibleRev]);
      setAiRevRange([0, maxPossibleAiRev]);
    }
  }, [accounts.length, maxPossibleRev, maxPossibleAiRev]);

  const filteredAccounts = useMemo(() => {
    return sortedAccounts.filter(acc => {
      const matchName = acc.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
        acc.delivery_unit?.name?.toLowerCase().includes(accountSearchTerm.toLowerCase());
      if (!matchName) return false;

      const isActive = (acc.active_project_count || 0) > 0;
      if (statusFilter === "Active" && !isActive) return false;
      if (statusFilter === "Inactive" && isActive) return false;

      if (managerFilter !== "All" && acc.account_manager !== managerFilter) return false;
      if (duFilter !== "All" && acc.delivery_unit?.name !== duFilter) return false;

      const rev = acc.current_revenue || acc.total_revenue || 0;
      if (rev < revRange[0] || rev > revRange[1]) return false;

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

  return (
    <MainLayout>
      <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
        {loading && <div className="text-center py-10 text-slate-500">Loading details...</div>}
        {!loading && firm && (
          <>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-2">
              <div
                onClick={() => navigate('/private-equity')}
                className="p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors mr-1 shadow-sm"
              >
                <Menu className="w-4 h-4" />
              </div>
              <a
                onClick={() => navigate('/private-equity')}
                className="text-blue-600 hover:underline cursor-pointer font-medium"
              >
                Private Equity
              </a>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{firm.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 mt-2">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-950 uppercase tracking-tight">{firm.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Tier 1 Investor</Badge>
                      <Badge variant="outline" className="text-slate-500 border-slate-200">{accounts.length} Portfolio Companies</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateInsights}
                  className="bg-purple-600 hover:bg-purple-700 gap-2 shadow-lg"
                >
                  <Brain className="w-4 h-4" /> View Strategic Insights
                </Button>
              </div>
            </div>

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Overview Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-blue-50 bg-white overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-50">
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-blue-600" /> Firm Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {firm.overview || 'No overview available.'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
                        <p className="text-2xl font-extrabold text-slate-950">$14.2B</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Investment Phase</p>
                        <p className="text-2xl font-extrabold text-blue-600">Expansion</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success Rate</p>
                        <p className="text-2xl font-extrabold text-emerald-600">92%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-blue-50 bg-white">
                  <CardHeader className="border-b border-blue-50">
                    <CardTitle className="text-blue-900 flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-blue-600" /> Investment Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Technology', value: 85 },
                        { label: 'Healthcare', value: 65 },
                        { label: 'Fintech', value: 45 },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-sm font-bold text-slate-700">
                            <span>{item.label}</span>
                            <span>{item.value}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights Section */}
              <Card className="shadow-lg border-t-4 border-t-purple-500 bg-gradient-to-br from-white to-purple-50/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-3 text-purple-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="w-6 h-6" />
                    </div>
                    Strategic AI Insights
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {insights && (
                      <span className="text-[10px] text-slate-400 italic mr-2">
                        Updated: {new Date(insights.generated_at || Date.now()).toLocaleDateString()}
                      </span>
                    )}
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">AI Powered</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!insights ? (
                    <div className="py-8 text-center">
                      <p className="text-slate-500 italic mb-4">No portfolio insights generated yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateInsights}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        Generate First Insights
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-4 p-5 bg-white rounded-xl border border-purple-100 shadow-sm transition-hover hover:shadow-md">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" /> Portfolio Growth Analysis
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                          {insights.executive_summary || insights.summary || "Analysis in progress..."}
                        </p>
                      </div>
                      <div className="space-y-4 p-5 bg-white rounded-xl border border-purple-100 shadow-sm transition-hover hover:shadow-md">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Strategic Recommendations
                        </h4>
                        <ul className="text-slate-600 text-sm leading-relaxed space-y-1">
                          {Array.isArray(insights.recommended_actions) ? insights.recommended_actions.slice(0, 3).map((action: { text?: string, recommendation?: string } | string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                              <span className="line-clamp-1">{typeof action === 'string' ? action : action.text || action.recommendation}</span>
                            </li>
                          )) : <li>Monitor digital transformation delays to maintain target success rate.</li>}
                          {Array.isArray(insights.recommended_actions) && insights.recommended_actions.length > 3 && (
                            <li className="text-xs text-purple-600 font-bold mt-1 cursor-pointer hover:underline" onClick={handleGenerateInsights}>
                              + {insights.recommended_actions.length - 3} more recommendations
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Portfolio Accounts Section */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <h2 className="text-2xl font-extrabold text-slate-950 flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-600" /> Portfolio Accounts
                    </h2>
                    <p className="text-slate-500 mt-1">Managing {filteredAccounts.length} strategic accounts under {firm.name}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button onClick={() => navigate('/financials/import', { state: { backUrl: `/private-equity/${id}` } })} variant="outline" className="gap-2 bg-white flex-1 sm:flex-none border-blue-200 hover:bg-blue-50 text-blue-700 font-medium whitespace-nowrap shadow-sm">
                      <Download className="w-4 h-4" /> Import Data
                    </Button>
                    <Button onClick={() => navigate('/financials/new', { state: { backUrl: `/private-equity/${id}`, private_equity_id: id } })} className="bg-blue-600 hover:bg-blue-700 gap-2 flex-1 sm:flex-none text-white font-medium whitespace-nowrap shadow-sm">
                      <Plus className="w-4 h-4" /> Add Account
                    </Button>
                  </div>
                </div>

                {/* Filter and Search */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedAccounts.map((account) => (
                    <FinancialAccountCard
                      key={account.id}
                      account={account}
                      backUrl={`/private-equity/${id}`}
                      onDelete={handleDeleteAccount}
                    />
                  ))}
                  {filteredAccounts.length === 0 && !loading && (
                    <div className="col-span-full py-24 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
                      No accounts found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PrivateEquityDetails;
