import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Pencil, Plus, DollarSign, Search,
  Brain, TrendingUp, Briefcase, MoreVertical, Loader2, Building2, Target,
  Menu, ChevronRight, ShieldAlert, Bot, Users, Activity, Swords, Award, FileText, Map, List
} from 'lucide-react';
import {
  getFinanceAccountById,
  deleteFinanceProject
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoadmapViewer } from '@/components/accounts/RoadmapViewer';
import { AccountDocuments } from '@/components/accounts/AccountDocuments';
import { cn } from '@/lib/utils';
import { useAccounts } from '@/contexts/AccountContext';

const FinancialAccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || '/accounts';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  const { accounts, fetchAccount } = useAccounts();
  const [salesAccount, setSalesAccount] = useState<any>(null);
  const fetchedAccountIdRef = useRef<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleGenerateInsights = async () => {
    if (!id) return;
    navigate(`/financials/${id}/insights`);
  };

  useEffect(() => {
    if (id) {
      const fetchFinanceData = async () => {
        setLoading(true);
        try {
          const responseData = await getFinanceAccountById(id);
          setData(responseData);
        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFinanceData();
    }
  }, [id]);

  useEffect(() => {
    if (data && accounts) {
      // 1. Try to find by ID
      let match = accounts.find((a: any) => a.account_id === data.id);
      // 2. Try to find by name
      if (!match) {
        const searchName = (data.name || "").trim().toLowerCase();
        match = accounts.find((a: any) => {
          const accName = (a.account_name || "").trim().toLowerCase();
          return accName === searchName || accName.includes(searchName) || searchName.includes(accName);
        });
      }

      if (match) {
        setSalesAccount(match);
        if (fetchedAccountIdRef.current !== match.account_id) {
          fetchedAccountIdRef.current = match.account_id;
          fetchAccount(match.account_id);
        }
      } else {
        setSalesAccount({
          account_id: data.id,
          account_name: data.name,
          domain: '-',
          account_focus: '-',
          engagement_age: '-',
          account_research_link: '',
          delivery_owner: '-',
          team_size: '-',
          overall_delivery_health: '-',
          current_rate_card_health: '-',
          engagement_models: '-',
          current_engagement_areas: '-',
          company_revenue: '-',
          last_year_business_done: '-',
          target_projection_2026_accounts: '-',
          target_projection_2026_delivery: '-',
          current_pipeline_value: '-',
          revenue_attrition_possibility: '-',
          know_customer_value_chain: false,
          where_we_fit_in_value_chain: '-',
          identified_areas_cross_up_selling: '-',
          visibility_client_roadmap_2026: '-',
          growth_action_plan_30days_ready: false,
          client_partner: '-',
          champion_customer_side: '-',
          champion_profile: '-',
          nitor_executive_connect_frequency: '-',
          current_nps: '-',
          total_active_connects: '-',
          connect_with_decision_maker: false,
          account_review_cadence_frequency: '-',
          technical_audit_frequency: '-',
          qbr_happening: false,
          key_competitors: '-',
          incumbency_strength: '-',
          our_positioning_vs_competition: '-',
          areas_competition_stronger: '-',
          white_spaces_we_own: '-',
          strategic_profiles: []
        });
      }
    }
  }, [data, accounts, fetchAccount]);

  const SALES_SECTIONS = [
    { id: 'sales_info', label: 'Sales & Account Information', icon: Building2 },
    { id: 'delivery_ops', label: 'Delivery & Operations', icon: Activity },
    { id: 'financials', label: 'Sales Financials', icon: Target },
    { id: 'strategy', label: 'Strategy & Growth', icon: Target },
    { id: 'relationships', label: 'Relationships', icon: Users },
    { id: 'cadence', label: 'Readiness & Cadence', icon: Activity },
    { id: 'competition', label: 'Competitive Analysis', icon: Swords },
    { id: 'stakeholders', label: 'Strategic Stakeholders', icon: Users },
  ];
  const [salesActiveSection, setSalesActiveSection] = useState('sales_info');

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-2">Account not found</h2>
            <p className="text-muted-foreground mb-6">
              The financial account data you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/financials')}>Back to Financials</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const account = salesAccount || {};
  const stakeholders = account.strategic_profiles || [];
  const paginatedStakeholders = stakeholders;

  const projectsList = data.projects || [];
  const sortedProjects = [...projectsList].sort((a: any, b: any) => (b.total_revenue || 0) - (a.total_revenue || 0));

  const filteredProjects = sortedProjects.filter((p: any) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.overview || '').toLowerCase().includes(search.toLowerCase())
  );

  const displayedProjects = (showAllProjects || search !== '')
    ? filteredProjects
    : filteredProjects.slice(0, 10);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-2">
          <div
            onClick={() => navigate(backUrl)}
            className="p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors mr-1 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </div>
          <a
            onClick={() => navigate(backUrl === '/financials' ? '/accounts' : backUrl)}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            {backUrl.includes('private-equity') ? 'Private Equity' : 'Accounts'}
          </a>
          {backUrl.includes('private-equity') && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <a onClick={() => navigate(backUrl)} className="text-blue-600 hover:underline cursor-pointer font-medium">Portfolio</a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{data?.name || 'Account Details'}</span>
        </div>

        {/* Header section matching Updated-AI-Insight UI */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-2">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                {data.name}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
              onClick={handleGenerateInsights}
            >
              <Brain className="w-4 h-4" />
              View Strategic Insights
            </Button>
            <Button variant="outline" onClick={() => navigate(`/financials/${data.id}/edit`, { state: { backUrl } })} className="gap-2 bg-white">
              <Pencil className="w-4 h-4" />
              Edit Account
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => navigate(`/financials/${data.id}/projects/new`, { state: { backUrl } })}>
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Revenue</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.current_revenue || data.total_revenue || 0)}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">YTD Actual</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Revenue</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.target_revenue || 0)}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">FY2026 Goal</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Revenue</span>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.forecast_revenue || 0)}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">Q4 Proj.</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortfall</span>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(data.shortfall ?? ((data.target_revenue || 0) - (data.current_revenue || data.total_revenue || 0) - (data.forecast_revenue || 0)))}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">Risk High</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Revenue</span>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.ai_revenue)}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">Direct/Assist</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Penetration</span>
              <p className="text-2xl font-bold text-blue-600">{(data.ai_penetration_pct || 0).toFixed(1)}%</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">+2.1% MoM</span>
          </Card>
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</span>
              <p className="text-2xl font-bold text-slate-900">{data.active_project_count + data.inactive_project_count}</p>
            </div>
            <span className="text-[11px] text-slate-500 mt-4">{data.active_project_count} Active / {data.inactive_project_count} Inc.</span>
          </Card>
        </div>

        {/* Standardized 5 Tabs Interface */}
        <Tabs defaultValue="sales details" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full gap-2 h-auto mb-6">
            <TabsTrigger value="sales details" className="tab-blue h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Sales Details
            </TabsTrigger>
            <TabsTrigger value="ai recommendations" className="tab-purple h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="customer overview" className="tab-indigo h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Customer Overview
            </TabsTrigger>
            <TabsTrigger value="roadmaps" className="tab-emerald h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
              <Map className="w-4 h-4" />
              Roadmaps
            </TabsTrigger>
            <TabsTrigger value="account documents" className="tab-amber h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Account Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales details" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Vertical Sidebar Navigation */}
              <div className="w-full md:w-[260px] shrink-0 flex flex-col sticky top-6">
                <div className="px-3 pb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Categories
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {SALES_SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSalesActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                        salesActiveSection === section.id
                          ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                          : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                      )}
                    >
                      <section.icon className={cn(
                        "w-4 h-4",
                        salesActiveSection === section.id ? "text-blue-600" : "text-slate-400"
                      )} />
                      {section.label}
                      {salesActiveSection === section.id && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Content Area */}
              <div className="flex-1 w-full flex flex-col">
                {salesActiveSection === 'sales_info' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-indigo-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-indigo-50">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        Sales & Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Domain</span>
                        <p className="text-sm font-semibold text-slate-900">{account.domain || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Focus</span>
                        <p className="text-sm font-semibold text-slate-900">{account.account_focus || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engagement Age</span>
                        <p className="text-sm font-semibold text-slate-900">{account.engagement_age || '-'}</p>
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Research</span>
                        <div>
                          {account.account_research_link ? (
                            <a href={account.account_research_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline truncate block text-sm font-semibold">
                              View Market Report ↗
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400 font-medium">No link provided.</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'delivery_ops' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-blue-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-blue-50">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        Delivery & Operations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Owner</span>
                        <p className="text-sm font-semibold text-slate-900">{account.delivery_owner || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team Size</span>
                        <p className="text-sm font-semibold text-slate-900">{account.team_size || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
                        <p className="text-sm font-semibold text-slate-900">{account.number_of_active_projects || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Health</span>
                        <div className="mt-0.5">
                          <Badge variant="outline" className={cn(
                            "border-none px-2 py-0.5 text-xs font-semibold",
                            account.overall_delivery_health === 'Green' ? "bg-green-50 text-green-700" :
                              account.overall_delivery_health === 'Red' ? "bg-red-50 text-red-700" :
                                account.overall_delivery_health === 'Amber' ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
                          )}>
                            {account.overall_delivery_health || '-'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rate Card Health</span>
                        <p className="text-sm font-semibold text-slate-900">{account.current_rate_card_health || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engagement Models</span>
                        <p className="text-sm font-semibold text-slate-900">{account.engagement_models || '-'}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Engagement Areas</span>
                        <p className="text-sm font-semibold text-slate-900">{account.current_engagement_areas || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'financials' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-emerald-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-emerald-50">
                          <Target className="w-4 h-4 text-emerald-600" />
                        </div>
                        Sales Financials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Revenue</span>
                        <p className="text-sm font-semibold text-slate-900">{account.company_revenue || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Year Business</span>
                        <p className="text-sm font-semibold text-slate-900">{account.last_year_business_done || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target 2026 (Accounts)</span>
                        <p className="text-sm font-semibold text-slate-900">{account.target_projection_2026_accounts || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target 2026 (Delivery)</span>
                        <p className="text-sm font-semibold text-slate-900">{account.target_projection_2026_delivery || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Pipeline</span>
                        <p className="text-sm font-semibold text-slate-900">{account.current_pipeline_value || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attrition / Leakage Risk</span>
                        <p className="text-sm font-semibold text-slate-900">{account.revenue_attrition_possibility || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'strategy' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-indigo-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-indigo-50">
                          <Target className="w-4 h-4 text-indigo-600" />
                        </div>
                        Strategy & Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value Chain Known?</span>
                        <div className="mt-0.5">
                          <Badge variant={account.know_customer_value_chain ? 'default' : 'secondary'} className="bg-indigo-600">
                            {account.know_customer_value_chain ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value Chain Fit</span>
                        <p className="text-sm font-semibold text-slate-900">{account.where_we_fit_in_value_chain || 'Not detailed.'}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cross-Sell Areas</span>
                        <p className="text-sm font-semibold text-slate-900">{account.identified_areas_cross_up_selling || 'None identified.'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roadmap Visibility (2026)</span>
                        <p className="text-sm font-semibold text-slate-900">{account.visibility_client_roadmap_2026 || 'No visibility.'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">30 Days Growth Action Plan Ready?</span>
                        <div className="mt-0.5">
                          <Badge variant={account.growth_action_plan_30days_ready ? 'default' : 'secondary'} className="bg-indigo-600">
                            {account.growth_action_plan_30days_ready ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'relationships' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-violet-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-violet-50">
                          <Users className="w-4 h-4 text-violet-600" />
                        </div>
                        Relationships
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Partner</span><p className="text-sm font-semibold text-slate-900">{account.client_partner || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Champion</span><p className="text-sm font-semibold text-slate-900">{account.champion_customer_side || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Champion Profile</span><p className="text-sm font-semibold text-slate-900">{account.champion_profile || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exec Connect Frequency</span><p className="text-sm font-semibold text-slate-900">{account.nitor_executive_connect_frequency || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NPS</span><p className="text-sm font-semibold text-slate-900">{account.current_nps || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active Connects</span><p className="text-sm font-semibold text-slate-900">{account.total_active_connects || '-'}</p></div>
                      <div className="space-y-1"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Connect with Decision Maker</span><p className="text-sm font-semibold text-slate-900">{account.connect_with_decision_maker ? 'Yes' : 'No'}</p></div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'cadence' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-emerald-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-emerald-50">
                          <Award className="w-4 h-4 text-emerald-600" />
                        </div>
                        Readiness & Cadence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Cadence</span>
                        <p className="text-sm font-semibold text-slate-900">{account.account_review_cadence_frequency || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technical Audit</span>
                        <p className="text-sm font-semibold text-slate-900">{account.technical_audit_frequency || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">QBR Happening?</span>
                        <Badge variant={account.qbr_happening ? "default" : "secondary"}>
                          {account.qbr_happening ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'competition' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-rose-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-rose-50">
                          <Swords className="w-4 h-4 text-rose-600" />
                        </div>
                        Competitive Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Key Competitors</span>
                        <p className="text-sm font-semibold text-slate-900">{account.key_competitors || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incumbency Strength</span>
                        <p className="text-sm font-semibold text-slate-900">{account.incumbency_strength || '-'}</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Our Positioning</span>
                        <p className="text-sm leading-relaxed font-semibold text-slate-900">{account.our_positioning_vs_competition || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Areas Competition Stronger</span>
                        <p className="text-sm font-semibold text-slate-900">{account.areas_competition_stronger || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">White Spaces We Own</span>
                        <p className="text-sm font-semibold text-slate-900">{account.white_spaces_we_own || '-'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {salesActiveSection === 'stakeholders' && (
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="border-b border-slate-100 p-4 bg-indigo-50/30">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <div className="p-1 rounded bg-indigo-50">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        Strategic Stakeholders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 overflow-x-auto">
                      {!stakeholders || stakeholders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No stakeholders defined.</p>
                        </div>
                      ) : (
                        <div className="border rounded-md min-w-[800px]">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead>Executive Sponsor</TableHead>
                                <TableHead>Technical Decision Maker</TableHead>
                                <TableHead>Influencers</TableHead>
                                <TableHead>Neutral Stakeholders</TableHead>
                                <TableHead>Negative Stakeholder</TableHead>
                                <TableHead>Succession Risk</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedStakeholders.map((person: any, idx: number) => (
                                <TableRow key={person.id || idx}>
                                  <TableCell className="font-medium">{person.executive_sponsor || '-'}</TableCell>
                                  <TableCell>{person.technical_decision_maker || '-'}</TableCell>
                                  <TableCell>{person.influencer || '-'}</TableCell>
                                  <TableCell>{person.neutral_stakeholders || '-'}</TableCell>
                                  <TableCell>{person.negative_stakeholder || '-'}</TableCell>
                                  <TableCell className={person.succession_risk ? 'text-amber-700 font-medium' : ''}>{person.succession_risk || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai recommendations" className="space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-950">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 min-h-[200px] text-slate-700 leading-relaxed">
                  {data?.ai_recommendations || "No AI recommendations available for this account."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer overview" className="space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-950">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Customer Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 min-h-[200px] text-slate-700 leading-relaxed">
                  {data?.customer_overview || "No customer overview available for this account."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmaps" className="space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100">
                <CardTitle className="flex items-center gap-2 text-emerald-950">
                  <Map className="w-5 h-5 text-emerald-600" />
                  Account Roadmaps
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <RoadmapViewer title="Technical Roadmap" content={account.technical_roadmap} icon={Map} />
                <RoadmapViewer title="Product Roadmap" content={account.product_roadmap} icon={Map} />
                <RoadmapViewer title="AI Roadmap" content={account.ai_roadmap} icon={Map} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account documents" className="mt-6">
            <AccountDocuments accountId={account.account_id || id} readOnly={true} />
          </TabsContent>
        </Tabs>

        {/* Projects List section */}
        <div className="pt-8 space-y-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Projects ({data.active_project_count} active / {data.inactive_project_count} inactive)
            </h2>
            <div className="flex items-center gap-3">
              {filteredProjects.length > 10 && search === "" && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="h-10 px-4 font-semibold border-slate-200 hover:border-blue-300 hover:bg-white text-blue-600 transition-all whitespace-nowrap shadow-sm"
                >
                  {showAllProjects ? "Show Top 10" : `View All Projects (${filteredProjects.length})`}
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[250px] shadow-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
            {displayedProjects.map((project: any) => (
              <Card
                key={project.id}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300 border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-50/30"
                onClick={() => navigate(`/financials/${data.id}/projects/${project.id}`, { state: { backUrl } })}
              >
                <CardHeader className="p-4 pb-3 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-100/50 rounded-lg shrink-0 text-blue-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <h3 className="font-bold truncate text-base text-blue-950" title={project.name}>{project.name}</h3>
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 py-0 font-bold tracking-wider uppercase border-none ${project.status?.toLowerCase() === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {project.status?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => { e.stopPropagation(); }}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-blue-100/50 text-blue-900/40 hover:text-blue-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/financials/${data.id}/projects/${project.id}/edit`, { state: { backUrl } })}>
                          Edit Project
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                              Delete Project
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this project? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await deleteFinanceProject(project.id);
                                    const responseData = await getFinanceAccountById(data.id);
                                    setData(responseData);
                                  } catch (err) {
                                    console.error('Failed to delete project', err);
                                  }
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Rev</span>
                    <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(project.total_revenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">YTD Rev</span>
                    <p className="text-sm font-bold text-blue-600 truncate">{formatCurrency(project.ytd_revenue)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">AI Rev</span>
                    <p className="text-sm font-bold text-emerald-600 truncate">
                      {formatCurrency((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0) || project.total_ai_revenue)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">AI Pen.</span>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {((project.ai_penetration || project.ai_penetration_pct || (project.total_revenue > 0 ? (((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0)) / project.total_revenue) * 100 : 0)) || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Type</span>
                    <p className="text-sm font-bold text-slate-700 truncate">{project.project_type || 'T&M'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm">
                No projects found matching your search.
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default FinancialAccountDetails;

