import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, DollarSign, Brain, TrendingUp,
  Calendar as CalendarIcon, Activity, Target, ChevronDown, Check, Loader2, FolderKanban,
  BarChart3
} from 'lucide-react';
import { getFinanceDashboardStats } from '@/services/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { MainLayout } from '@/components/layout/MainLayout';
import type { ProjectSummary } from '@/types/finance-database';

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('revenue');

  // Filter state
  const [filters, setFilters] = useState({
    account: "All Accounts",
    project: "All Projects",
    status: "All Statuses",
    type: "All Types",
    department: "All Departments",
    dateRange: undefined as DateRange | undefined,
  });
  const [tempFilters, setTempFilters] = useState(filters);

  // Combobox open state
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  const applyFilters = () => setFilters(tempFilters);
  const resetFilters = () => {
    const def = { account: "All Accounts", project: "All Projects", status: "All Statuses", type: "All Types", department: "All Departments", dateRange: undefined };
    setFilters(def);
    setTempFilters(def);
  };

  // Fetch all data once on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFinanceDashboardStats();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setError("Invalid data received from server");
        }
      } catch (err) {
        setError("Failed to load finance dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter options built from all projects
  const filterOptions = useMemo(() => {
    if (!projects) return {};
    const accounts = Array.from(new Set(projects.map(p => p.account_name).filter(Boolean))).sort();
    const projectNames = Array.from(new Set(projects.map(p => p.project_name).filter(Boolean))).sort();
    const statuses = Array.from(new Set(projects.map(p => p.project_status).filter(Boolean))).sort();
    const types = Array.from(new Set(projects.map(p => p.project_type).filter(t => Boolean(t) && t !== "Unknown"))).sort();
    const departments = Array.from(new Set(projects.map(p => p.delivery_unit_name).filter(Boolean))).sort();
    return { accounts, projectNames, statuses, types, departments };
  }, [projects]);

  // Local filtering — same pattern as Update-AI-Insights
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      if (filters.account !== "All Accounts" && p.account_name !== filters.account) return false;
      if (filters.project !== "All Projects" && p.project_name !== filters.project) return false;
      if (filters.status !== "All Statuses" && p.project_status !== filters.status) return false;
      if (filters.type !== "All Types" && p.project_type !== filters.type) return false;
      if (filters.department !== "All Departments" && p.delivery_unit_name !== filters.department) return false;
      if (filters.dateRange) {
        const { from, to } = filters.dateRange;
        if (from || to) {
          if (!p.month || !p.year) return false;
          const projectDate = new Date(p.year, p.month - 1);
          if (from && projectDate < new Date(from)) return false;
          if (to && projectDate > new Date(to)) return false;
        }
      }
      return true;
    });
  }, [projects, filters]);

  // Account stats from filtered projects
  const accountStats = useMemo(() => {
    const accountMap = new Map<string, { activeCount: number }>();
    filteredProjects.forEach(p => {
      const name = p.account_name;
      if (!name) return;
      const existing = accountMap.get(name) || { activeCount: 0 };
      if (p.project_status?.toLowerCase() === 'active') existing.activeCount++;
      accountMap.set(name, existing);
    });
    const entries = Array.from(accountMap.values());
    const total = entries.length;
    const active = entries.filter(a => a.activeCount > 0).length;
    return { total, active, inactive: total - active };
  }, [filteredProjects]);

  // All chart stats from filtered projects
  const stats = useMemo(() => {
    const totalRevenue = filteredProjects.reduce((s, p) => s + (p.total_revenue || 0), 0);
    const aiRevenue = filteredProjects.reduce((s, p) => s + (p.total_ai_rev || 0) + (p.total_ai_assist_rev || 0), 0);
    const projectCount = new Set(filteredProjects.map(p => p.project_id).filter(Boolean)).size;

    // Revenue by Month
    const byMonthMap = new Map<string, any>();
    filteredProjects.forEach(p => {
      if (p.month && p.year && p.year !== 1900) {
        const key = `${new Date(0, p.month - 1).toLocaleString("default", { month: "short" })} ${p.year}`;
        const ex = byMonthMap.get(key) || { name: key, aiRevenue: 0, totalRevenue: 0, projectIds: new Set<string>(), sortKey: p.year * 100 + p.month };
        ex.aiRevenue += (p.total_ai_rev || 0) + (p.total_ai_assist_rev || 0);
        ex.totalRevenue += p.total_revenue || 0;
        if (p.project_id) ex.projectIds.add(p.project_id);
        byMonthMap.set(key, ex);
      }
    });
    const revenueByMonth = Array.from(byMonthMap.values()).map(m => ({ ...m, projects: m.projectIds.size })).sort((a, b) => a.sortKey - b.sortKey);

    // Revenue by Year
    const byYearMap = new Map();
    filteredProjects.forEach(p => {
      if (p.year && p.year !== 1900) {
        const key = p.year.toString();
        const ex = byYearMap.get(key) || { name: key, aiRevenue: 0, totalRevenue: 0, projectIds: new Set<string>() };
        ex.aiRevenue += (p.total_ai_rev || 0) + (p.total_ai_assist_rev || 0);
        ex.totalRevenue += p.total_revenue || 0;
        if (p.project_id) ex.projectIds.add(p.project_id);
        byYearMap.set(key, ex);
      }
    });
    const revenueByYear = Array.from(byYearMap.values()).map(y => ({ ...y, projects: y.projectIds.size })).sort((a, b) => parseInt(a.name) - parseInt(b.name));

    // Revenue by Delivery Unit
    const byRegionMap = new Map();
    filteredProjects.forEach(p => {
      const region = p.delivery_unit_name || "Unknown";
      const ex = byRegionMap.get(region) || { name: region, aiRevenue: 0, totalRevenue: 0, projectIds: new Set<string>() };
      ex.aiRevenue += (p.total_ai_rev || 0) + (p.total_ai_assist_rev || 0);
      ex.totalRevenue += p.total_revenue || 0;
      if (p.project_id) ex.projectIds.add(p.project_id);
      byRegionMap.set(region, ex);
    });
    const revenueByRegion = Array.from(byRegionMap.values()).map(r => ({ ...r, projects: r.projectIds.size })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Revenue by Type (Pie)
    const byTypeMap = new Map();
    filteredProjects.forEach(p => {
      const type = p.project_type;
      if (type && type !== "Unknown") {
        const ex = byTypeMap.get(type) || { name: type, value: 0, projectCount: 0 };
        ex.value += p.total_revenue || 0;
        ex.projectCount += 1;
        byTypeMap.set(type, ex);
      }
    });
    const revenueByType = Array.from(byTypeMap.values());

    // Top projects aggregated
    const projAgg = new Map();
    filteredProjects.forEach(p => {
      const ex = projAgg.get(p.project_id) || { ...p, total_revenue: 0, total_ai_rev: 0, total_ai_assist_rev: 0 };
      ex.total_revenue += p.total_revenue || 0;
      ex.total_ai_rev += p.total_ai_rev || 0;
      ex.total_ai_assist_rev += p.total_ai_assist_rev || 0;
      projAgg.set(p.project_id, ex);
    });
    const topProjects = Array.from(projAgg.values()).sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).slice(0, 10);

    // Top accounts aggregated
    const accAgg = new Map();
    filteredProjects.forEach(p => {
      const name = p.account_name || "Unknown";
      const ex = accAgg.get(name) || { account_name: name, total_revenue: 0, total_ai_rev: 0, total_ai_assist_rev: 0 };
      ex.total_revenue += p.total_revenue || 0;
      ex.total_ai_rev += p.total_ai_rev || 0;
      ex.total_ai_assist_rev += p.total_ai_assist_rev || 0;
      accAgg.set(name, ex);
    });
    const topAiAccounts = Array.from(accAgg.values()).filter(a => a.total_revenue > 0).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10);

    // Renewals
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const renewalProjects = Array.from(projAgg.values()).filter(p => {
      if (!p.to_date) return false;
      const d = new Date(p.to_date);
      return d >= nextMonth && d <= nextMonthEnd;
    }).sort((a, b) => new Date(a.to_date || '').getTime() - new Date(b.to_date || '').getTime()).slice(0, 10);

    return { totalRevenue, aiRevenue, projectCount, revenueByMonth, revenueByYear, revenueByRegion, revenueByType, topProjects, topAiAccounts, renewalProjects };
  }, [filteredProjects]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-destructive">
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance Dashboard</h1>
          <span className="text-sm text-muted-foreground">Real-time business insights</span>
        </div>

        {/* Filters — same layout as Update-AI-Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 card-enterprise p-6 bg-card/50 backdrop-blur-sm rounded-xl border">
          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Account Name</label>
            <Popover open={accountOpen} onOpenChange={(o) => { setAccountOpen(o); if (!o) setAccountSearch(''); }}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full h-8 text-xs justify-between">
                  {tempFilters.account}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search accounts..." value={accountSearch} onValueChange={setAccountSearch} />
                  <CommandList>
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="All Accounts" onSelect={() => { setTempFilters({ ...tempFilters, account: "All Accounts" }); setAccountOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", tempFilters.account === "All Accounts" ? "opacity-100" : "opacity-0")} />All Accounts
                      </CommandItem>
                      {filterOptions.accounts?.filter(a => !accountSearch || a.toLowerCase().includes(accountSearch.toLowerCase())).map(a => (
                        <CommandItem key={a} value={a} onSelect={() => { setTempFilters({ ...tempFilters, account: a }); setAccountOpen(false); setAccountSearch(''); }}>
                          <Check className={cn("mr-2 h-4 w-4", tempFilters.account === a ? "opacity-100" : "opacity-0")} />{a}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Project Name</label>
            <Popover open={projectOpen} onOpenChange={(o) => { setProjectOpen(o); if (!o) setProjectSearch(''); }}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full h-8 text-xs justify-between">
                  {tempFilters.project}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search projects..." value={projectSearch} onValueChange={setProjectSearch} />
                  <CommandList>
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="All Projects" onSelect={() => { setTempFilters({ ...tempFilters, project: "All Projects" }); setProjectOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", tempFilters.project === "All Projects" ? "opacity-100" : "opacity-0")} />All Projects
                      </CommandItem>
                      {filterOptions.projectNames?.filter(p => !projectSearch || p.toLowerCase().includes(projectSearch.toLowerCase())).map(p => (
                        <CommandItem key={p} value={p} onSelect={() => { setTempFilters({ ...tempFilters, project: p }); setProjectOpen(false); setProjectSearch(''); }}>
                          <Check className={cn("mr-2 h-4 w-4", tempFilters.project === p ? "opacity-100" : "opacity-0")} />{p}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Project Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Project Status</label>
            <Select value={tempFilters.status} onValueChange={v => setTempFilters({ ...tempFilters, status: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                {filterOptions.statuses?.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Project Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Project Type</label>
            <Select value={tempFilters.type} onValueChange={v => setTempFilters({ ...tempFilters, type: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {filterOptions.types?.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Department Name</label>
            <Select value={tempFilters.department} onValueChange={v => setTempFilters({ ...tempFilters, department: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Departments">All Departments</SelectItem>
                {filterOptions.departments?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-between text-left font-normal h-8 text-xs", !tempFilters.dateRange?.from && "text-muted-foreground")}>
                  {tempFilters.dateRange?.from ? format(tempFilters.dateRange.from, "LLL dd, y") : <span>Pick a date</span>}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={tempFilters.dateRange?.from} onSelect={date => date && setTempFilters({ ...tempFilters, dateRange: { from: date, to: new Date(date.getFullYear(), date.getMonth() + 1, 0) } })} initialFocus captionLayout="dropdown-buttons" fromYear={2020} toYear={2030} />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-between text-left font-normal h-8 text-xs", !tempFilters.dateRange?.to && "text-muted-foreground")}>
                  {tempFilters.dateRange?.to ? format(tempFilters.dateRange.to, "LLL dd, y") : <span>Pick a date</span>}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={tempFilters.dateRange?.to} onSelect={date => date && setTempFilters({ ...tempFilters, dateRange: { from: new Date(date.getFullYear(), date.getMonth(), 1), to: date } })} initialFocus captionLayout="dropdown-buttons" fromYear={2020} toYear={2030} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <Button onClick={applyFilters} className="w-auto h-8 px-6 py-1 text-xs bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-0 hover:from-indigo-600 hover:to-blue-700 shadow-md">
              Apply Filter
            </Button>
            <Button onClick={resetFilters} className="w-auto h-8 px-6 py-1 text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 hover:from-red-600 hover:to-orange-600 shadow-md">
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="revenue" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 shadow-sm">
              Revenue Dashboard
            </TabsTrigger>
            <TabsTrigger value="ai-penetration" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300 shadow-sm">
              AI Penetration
            </TabsTrigger>
          </TabsList>

          {/* ─── Revenue Tab ─── */}
          <TabsContent value="revenue" className="space-y-4">
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="metric-card bg-gradient-to-br from-cyan-500 to-blue-600 border-none text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Accounts</CardTitle>
                  <Building2 className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{accountStats.total}</div>
                  <p className="text-xs text-white/80">{accountStats.active} Active / {accountStats.inactive} Inactive</p>
                </CardContent>
              </Card>
              <Card className="metric-card bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-white/80">Across all projects</p>
                </CardContent>
              </Card>
              <Card className="metric-card bg-gradient-to-br from-amber-500 to-orange-600 border-none text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">AI Revenue</CardTitle>
                  <Brain className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats.aiRevenue)}</div>
                  <p className="text-xs text-white/80">
                    {stats.totalRevenue > 0 ? ((stats.aiRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}% of total
                  </p>
                </CardContent>
              </Card>
              <Card className="metric-card bg-gradient-to-br from-purple-500 to-pink-500 border-none text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Projects</CardTitle>
                  <FolderKanban className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.projectCount}</div>
                  <p className="text-xs text-white/80">Total project count</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-sm font-medium">Revenue by Month</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} domain={[0, "auto"]} />
                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                        <Tooltip formatter={(v) => typeof v === "number" && v > 1000 ? formatCurrency(v) : v} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="aiRevenue" name="AI Revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar yAxisId="left" dataKey="totalRevenue" name="Total Revenue" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="projects" name="Projects" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-sm font-medium">Revenue by Year</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.revenueByYear}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} domain={[0, "auto"]} />
                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                        <Tooltip formatter={(v) => typeof v === "number" && v > 1000 ? formatCurrency(v) : v} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="aiRevenue" name="AI Revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar yAxisId="left" dataKey="totalRevenue" name="Total Revenue" fill="#EC4899" radius={[4, 4, 0, 0]} barSize={30} />
                        <Line yAxisId="right" type="monotone" dataKey="projects" name="Projects" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts + Tables side by side */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">Top 10 Projects by Current Revenue</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100">
                        <TableHead className="font-bold text-slate-600">Project</TableHead>
                        <TableHead className="font-bold text-slate-600">Account</TableHead>
                        <TableHead className="font-bold text-slate-600">Status</TableHead>
                        <TableHead className="text-right font-bold text-slate-600">Current Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topProjects.map(p => (
                        <TableRow key={p.project_id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                          <TableCell className="font-bold text-slate-800 text-xs">{p.project_name}</TableCell>
                          <TableCell className="text-slate-500 text-xs">{p.account_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-bold border-none", 
                              p.project_status?.toLowerCase() === 'active' ? "bg-emerald-100 text-emerald-700" : 
                              p.project_status?.toLowerCase() === 'inactive' ? "bg-red-100 text-red-700" : 
                              "bg-slate-100 text-slate-500"
                            )}>
                              {p.project_status?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900 text-xs">{formatCurrency(p.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-sm font-medium">Revenue by Project Type</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.revenueByType} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {stats.revenueByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => formatCurrency(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Renewals Row */}
            {stats.renewalProjects.length > 0 && (
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-700">Renewals Next Month</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold text-slate-600">Project</TableHead>
                        <TableHead className="font-bold text-slate-600">Account</TableHead>
                        <TableHead className="font-bold text-slate-600">End Date</TableHead>
                        <TableHead className="text-right font-bold text-slate-600">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.renewalProjects.map(p => (
                        <TableRow key={p.project_id} className="hover:bg-amber-50/30 transition-colors">
                          <TableCell className="font-bold text-slate-800 text-xs">{p.project_name}</TableCell>
                          <TableCell className="text-slate-500 text-xs">{p.account_name}</TableCell>
                          <TableCell className="text-amber-700 font-bold text-xs">{p.to_date ? new Date(p.to_date).toLocaleDateString() : '—'}</TableCell>
                          <TableCell className="text-right font-bold text-xs">{formatCurrency(p.total_revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Key Insights Breakdown */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Key Portfolio Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                      <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">AI Momentum</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                           Total AI revenue contribution is <span className="text-blue-700 font-bold">{stats.totalRevenue ? ((stats.aiRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%</span>. This represents a mature integration level.
                        </p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                      <Target className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Leading Region</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                           {stats.revenueByRegion[0]?.name || 'Global'} leads with {formatCurrency(stats.revenueByRegion[0]?.totalRevenue || 0)}, managing {stats.revenueByRegion[0]?.projects || 0} projects with high resource utilization.
                        </p>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100/50">
                      <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Project Efficiency</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                           Average revenue per project is <span className="font-bold text-slate-800">{stats.projectCount ? formatCurrency(stats.totalRevenue / stats.projectCount) : '$0'}</span>, showing a healthy portfolio mix.
                        </p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Activity className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Portfolio Stability</p>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                           Current pipeline value and active contract distribution suggests strong revenue visibility for the next 2 quarters.
                        </p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── AI Penetration Tab ─── */}
          <TabsContent value="ai-penetration" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top 10 Accounts: Revenue vs GenAI Penetration</CardTitle>
                <CardDescription>Breakdown of AI direct vs assisted revenue per top account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.topAiAccounts} barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="account_name" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={100} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="total_revenue" name="Total Revenue" fill="#0088FE" barSize={12} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="total_ai_rev" name="GenAI Direct" fill="#8884d8" barSize={12} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="total_ai_assist_rev" name="GenAI Assisted" fill="#FFBB28" barSize={12} radius={[2, 2, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>


          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FinanceDashboard;
