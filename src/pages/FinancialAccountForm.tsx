import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  Loader2, 
  Menu, 
  ChevronRight, 
  DollarSign, 
  Target, 
  Users, 
  Plus, 
  Trash2, 
  Activity, 
  Swords, 
  FileText, 
  Map, 
  Brain, 
  List 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  getFinanceAccountById, 
  createFinanceAccount, 
  updateFinanceAccount,
  getFinanceDeliveryUnits
} from '@/services/api';
import { useAccounts } from '@/contexts/AccountContext';
import { AccountDocuments } from '@/components/accounts/AccountDocuments';
import { RoadmapEditor } from '@/components/accounts/RoadmapEditor';
import { StrategicStakeholderProfile } from '@/types/account';

const FinancialAccountForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || '/financials';
  const privateEquityId = location.state?.private_equity_id || null;
  const { toast } = useToast();
  
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryUnits, setDeliveryUnits] = useState<{id: string, name: string}[]>([]);
  
  // Use generic accounts context to sync data with the base Account record
  const { accounts, addAccount, updateAccount, fetchAccount } = useAccounts();
  const [salesAccountId, setSalesAccountId] = useState<string | null>(null);
  const [finData, setFinData] = useState<any>(null);
  const fetchedAccountIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<any>({
    // Financial Account Core Fields
    name: '',
    delivery_unit_id: '',
    account_manager: '',
    customer_overview: '',
    ai_recommendations: '',
    target_revenue: 0,
    forecast_revenue: 0,
    total_revenue: 0,
    ai_revenue: 0,
    private_equity_id: privateEquityId,

    // Base Sales Account Core Fields
    account_name: '',
    domain: '',
    company_revenue: '',
    know_customer_value_chain: false,
    account_focus: 'Silver',
    delivery_owner: '',
    client_partner: '',
    where_we_fit_in_value_chain: '',
    engagement_age: '',
    last_year_business_done: '',
    target_projection_2026_accounts: '',
    target_projection_2026_delivery: '',
    current_pipeline_value: '',
    revenue_attrition_possibility: '',
    current_engagement_areas: '',
    team_size: '',
    engagement_models: '',
    current_rate_card_health: 'At',
    number_of_active_projects: '',
    overall_delivery_health: '',
    current_nps: '',
    champion_customer_side: '',
    champion_profile: '',
    connect_with_decision_maker: false,
    total_active_connects: '',
    visibility_client_roadmap_2026: '',
    identified_areas_cross_up_selling: '',
    nitor_executive_connect_frequency: '',
    growth_action_plan_30days_ready: false,
    account_research_link: '',
    technical_roadmap: '',
    product_roadmap: '',
    ai_roadmap: '',
  });

  const [profiles, setProfiles] = useState<StrategicStakeholderProfile[]>([]);

  const formatCurrency = (val: number | string | undefined | null) => {
    if (val === undefined || val === null) return "$0";
    if (typeof val === 'string' && val.includes('$')) return val;
    const numStr = typeof val === 'string' ? val.replace(/[$,]/g, '') : val;
    const num = parseFloat(numStr as string);
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  useEffect(() => {
    const fetchInitialFinance = async () => {
      try {
        const units = await getFinanceDeliveryUnits();
        setDeliveryUnits(units);
        
        if (isEditing && id) {
          const data = await getFinanceAccountById(id);
          setFinData(data);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message || "Failed to load account details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialFinance();
  }, [id, isEditing]);

  useEffect(() => {
    if ((finData || isEditing) && accounts) {
      // Try to match with an existing sales account by ID or Fuzzy Name
      const searchId = finData?.id || id;
      let matchedSalesAcc: any = accounts.find((a: any) => a.account_id === searchId);
      
      if (!matchedSalesAcc && finData?.name) {
        const searchName = finData.name.trim().toLowerCase();
        matchedSalesAcc = accounts.find((a: any) => {
          const accName = (a.account_name || "").trim().toLowerCase();
          return accName === searchName || accName.includes(searchName) || searchName.includes(accName);
        });
      }

      if (matchedSalesAcc) {
        setSalesAccountId(matchedSalesAcc.account_id);
        if (fetchedAccountIdRef.current !== matchedSalesAcc.account_id) {
          fetchedAccountIdRef.current = matchedSalesAcc.account_id;
          fetchAccount(matchedSalesAcc.account_id);
        }
        if (matchedSalesAcc.strategic_profiles) {
          setProfiles(matchedSalesAcc.strategic_profiles);
        }
      }

      setFormData((prev: any) => ({
        ...prev,
        // Financial mappings
        name: finData?.name || prev.name || '',
        delivery_unit_id: finData?.delivery_unit?.id || finData?.delivery_unit_id || prev.delivery_unit_id || '',
        account_manager: finData?.account_manager || matchedSalesAcc?.client_partner || prev.account_manager || '',
        customer_overview: finData?.customer_overview || prev.customer_overview || '',
        ai_recommendations: finData?.ai_recommendations || prev.ai_recommendations || '',
        target_revenue: finData?.target_revenue || prev.target_revenue || 0,
        forecast_revenue: finData?.forecast_revenue || prev.forecast_revenue || 0,
        total_revenue: finData?.total_revenue || prev.total_revenue || 0,
        ai_revenue: finData?.ai_revenue || prev.ai_revenue || 0,
        private_equity_id: finData?.private_equity_id || privateEquityId || null,

        // Base Sales mappings
        account_name: finData?.name || matchedSalesAcc?.account_name || prev.account_name || '',
        domain: matchedSalesAcc?.domain || prev.domain || '',
        company_revenue: matchedSalesAcc?.company_revenue || prev.company_revenue || '',
        know_customer_value_chain: matchedSalesAcc?.know_customer_value_chain || prev.know_customer_value_chain || false,
        account_focus: matchedSalesAcc?.account_focus || prev.account_focus || 'Silver',
        delivery_owner: matchedSalesAcc?.delivery_owner || prev.delivery_owner || '',
        client_partner: matchedSalesAcc?.client_partner || finData?.account_manager || prev.client_partner || '',
        where_we_fit_in_value_chain: matchedSalesAcc?.where_we_fit_in_value_chain || prev.where_we_fit_in_value_chain || '',
        engagement_age: matchedSalesAcc?.engagement_age || prev.engagement_age || '',
        last_year_business_done: formatCurrency(finData?.total_revenue || matchedSalesAcc?.last_year_business_done || 0),
        target_projection_2026_accounts: formatCurrency(finData?.target_revenue || matchedSalesAcc?.target_projection_2026_accounts || 0),
        target_projection_2026_delivery: matchedSalesAcc?.target_projection_2026_delivery || prev.target_projection_2026_delivery || '',
        current_pipeline_value: formatCurrency(finData?.forecast_revenue || matchedSalesAcc?.current_pipeline_value || 0),
        revenue_attrition_possibility: matchedSalesAcc?.revenue_attrition_possibility || prev.revenue_attrition_possibility || '',
        current_engagement_areas: matchedSalesAcc?.current_engagement_areas || prev.current_engagement_areas || '',
        team_size: matchedSalesAcc?.team_size || prev.team_size || '',
        engagement_models: matchedSalesAcc?.engagement_models || prev.engagement_models || '',
        current_rate_card_health: matchedSalesAcc?.current_rate_card_health || prev.current_rate_card_health || 'At',
        number_of_active_projects: finData?.project_count?.toString() || matchedSalesAcc?.number_of_active_projects || prev.number_of_active_projects || '',
        overall_delivery_health: matchedSalesAcc?.overall_delivery_health || prev.overall_delivery_health || '',
        current_nps: matchedSalesAcc?.current_nps || prev.current_nps || '',
        champion_customer_side: matchedSalesAcc?.champion_customer_side || prev.champion_customer_side || '',
        champion_profile: matchedSalesAcc?.champion_profile || prev.champion_profile || '',
        connect_with_decision_maker: matchedSalesAcc?.connect_with_decision_maker || prev.connect_with_decision_maker || false,
        total_active_connects: matchedSalesAcc?.total_active_connects || prev.total_active_connects || '',
        visibility_client_roadmap_2026: matchedSalesAcc?.visibility_client_roadmap_2026 || prev.visibility_client_roadmap_2026 || '',
        identified_areas_cross_up_selling: matchedSalesAcc?.identified_areas_cross_up_selling || prev.identified_areas_cross_up_selling || '',
        nitor_executive_connect_frequency: matchedSalesAcc?.nitor_executive_connect_frequency || prev.nitor_executive_connect_frequency || '',
        growth_action_plan_30days_ready: matchedSalesAcc?.growth_action_plan_30days_ready || prev.growth_action_plan_30days_ready || false,
        account_research_link: matchedSalesAcc?.account_research_link || prev.account_research_link || '',
        technical_roadmap: matchedSalesAcc?.technical_roadmap || prev.technical_roadmap || '',
        product_roadmap: matchedSalesAcc?.product_roadmap || prev.product_roadmap || '',
        ai_roadmap: matchedSalesAcc?.ai_roadmap || prev.ai_roadmap || '',
      }));
    }
  }, [finData, isEditing, id, accounts, fetchAccount, privateEquityId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Account name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields (marked with *).",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // 1. Prepare Finance API payload with a background default unit ID if omitted
      const defaultUnitId = formData.delivery_unit_id || (deliveryUnits.length > 0 ? deliveryUnits[0].id : undefined);
      const financePayload = {
        name: formData.name,
        delivery_unit_id: defaultUnitId,
        account_manager: formData.account_manager,
        customer_overview: formData.customer_overview,
        ai_recommendations: formData.ai_recommendations,
        target_revenue: parseFloat(formData.target_revenue) || 0,
        forecast_revenue: parseFloat(formData.forecast_revenue) || 0,
        total_revenue: parseFloat(formData.total_revenue) || 0,
        ai_revenue: parseFloat(formData.ai_revenue) || 0,
        private_equity_id: formData.private_equity_id
      };

      let resultingFinanceId = id;

      if (isEditing) {
        await updateFinanceAccount(id!, financePayload);
      } else {
        const createdFin = await createFinanceAccount(financePayload);
        resultingFinanceId = createdFin.id;
      }

      // 2. Prepare Base Sales API payload to fully sync metadata
      const salesUpdates: any = {
        account_name: formData.name, // keep synced
        domain: formData.domain,
        company_revenue: formData.company_revenue,
        know_customer_value_chain: formData.know_customer_value_chain,
        account_focus: formData.account_focus,
        delivery_owner: formData.delivery_owner,
        client_partner: formData.client_partner || formData.account_manager,
        where_we_fit_in_value_chain: formData.where_we_fit_in_value_chain,
        engagement_age: formData.engagement_age,
        last_year_business_done: formatCurrency(formData.total_revenue || formData.last_year_business_done),
        target_projection_2026_accounts: formatCurrency(formData.target_revenue || formData.target_projection_2026_accounts),
        target_projection_2026_delivery: formData.target_projection_2026_delivery,
        current_pipeline_value: formatCurrency(formData.forecast_revenue || formData.current_pipeline_value),
        revenue_attrition_possibility: formData.revenue_attrition_possibility,
        current_engagement_areas: formData.current_engagement_areas,
        team_size: formData.team_size,
        engagement_models: formData.engagement_models,
        current_rate_card_health: formData.current_rate_card_health,
        number_of_active_projects: formData.number_of_active_projects,
        overall_delivery_health: formData.overall_delivery_health,
        current_nps: formData.current_nps,
        champion_customer_side: formData.champion_customer_side,
        champion_profile: formData.champion_profile,
        connect_with_decision_maker: formData.connect_with_decision_maker,
        total_active_connects: formData.total_active_connects,
        visibility_client_roadmap_2026: formData.visibility_client_roadmap_2026,
        identified_areas_cross_up_selling: formData.identified_areas_cross_up_selling,
        nitor_executive_connect_frequency: formData.nitor_executive_connect_frequency,
        growth_action_plan_30days_ready: formData.growth_action_plan_30days_ready,
        account_research_link: formData.account_research_link,
        technical_roadmap: formData.technical_roadmap,
        product_roadmap: formData.product_roadmap,
        ai_roadmap: formData.ai_roadmap,
        strategic_profiles: profiles,
        updated_at: new Date().toISOString()
      };

      if (salesAccountId) {
        await updateAccount(salesAccountId, salesUpdates);
      } else if (resultingFinanceId) {
        // Create base linked sales account record
        await addAccount({
          ...salesUpdates,
          account_id: resultingFinanceId, // mirror ID perfectly
          created_at: new Date().toISOString(),
          projects: [],
          status: 'ACTIVE'
        });
      }

      toast({
        title: isEditing ? "Account Updated" : "Account Created",
        description: "Account details synced successfully across modules."
      });
      navigate(`/financials/${resultingFinanceId}`, { state: { backUrl } });

    } catch (error: any) {
      toast({
        title: "Error saving account",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Standard Bento-Box Tabs System
  const TABS = ['sales_details', 'ai_recommendations', 'customer_overview', 'roadmaps', 'account_documents'];
  const [activeTab, setActiveTab] = useState('sales_details');

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

  const handleNext = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const isLastTab = activeTab === TABS[TABS.length - 1];
  const isFirstTab = activeTab === TABS[0];

  // Calculated Risks / Revenue
  const parsedTarget = parseFloat((formData.target_revenue || "0").toString().replace(/[$,]/g, ''));
  const parsedActual = parseFloat((formData.total_revenue || formData.last_year_business_done || "0").toString().replace(/[$,]/g, ''));
  const parsedForecast = parseFloat((formData.forecast_revenue || formData.current_pipeline_value || "0").toString().replace(/[$,]/g, ''));
  const shortfall = Math.max(0, parsedTarget - parsedActual - parsedForecast);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

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
            onClick={() => navigate(backUrl)} 
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
          <span className="text-slate-600 font-semibold">{isEditing ? 'Edit Financial Account' : 'Create Financial Account'}</span>
        </div>

        {/* Header section matching Updated-AI-Insight UI */}
        <div className="flex items-start gap-4 pb-2 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Financial Account' : 'Create New Financial Account'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? 'Update synchronized account parameters across finance and sales views' : 'Initialize account structure with multi-tab configuration'}
            </p>
          </div>
        </div>

        {/* 7 Metric Cards Top Row for Bento Box Theme Consistency */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Revenue</span>
              <div className="relative">
                <Input
                  value={formData.total_revenue || ''}
                  onChange={(e) => setFormData({ ...formData, total_revenue: parseFloat(e.target.value) || 0 })}
                  className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                  placeholder="$0"
                  type="number"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">YTD Actual</span>
          </Card>
          
          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Revenue</span>
              <div className="relative">
                <Input
                  value={formData.target_revenue || ''}
                  onChange={(e) => setFormData({ ...formData, target_revenue: parseFloat(e.target.value) || 0 })}
                  className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                  placeholder="$0"
                  type="number"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">FY2026 Goal</span>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Revenue</span>
              <div className="relative">
                <Input
                  value={formData.forecast_revenue || ''}
                  onChange={(e) => setFormData({ ...formData, forecast_revenue: parseFloat(e.target.value) || 0 })}
                  className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                  placeholder="$0"
                  type="number"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">Q4 Proj.</span>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between bg-red-50/30">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortfall</span>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(shortfall)}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">Calculated Risk</span>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Revenue</span>
              <div className="relative">
                <Input
                  value={formData.ai_revenue || ''}
                  onChange={(e) => setFormData({ ...formData, ai_revenue: parseFloat(e.target.value) || 0 })}
                  className="text-xl font-bold text-blue-600 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                  placeholder="$0"
                  type="number"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">Direct/Assist</span>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Penetration</span>
              <p className="text-xl font-bold text-blue-600">
                {parsedActual > 0 ? ((parseFloat(formData.ai_revenue || 0) / parsedActual) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">+2.1% MoM</span>
          </Card>

          <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</span>
              <div className="relative">
                <Input
                  value={formData.number_of_active_projects || ''}
                  onChange={(e) => setFormData({ ...formData, number_of_active_projects: e.target.value })}
                  className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                  placeholder="0"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-4">Active Projects</span>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full gap-2 h-auto mb-6">
              <TabsTrigger value="sales_details" className="tab-blue h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Sales Details
              </TabsTrigger>
              <TabsTrigger value="ai_recommendations" className="tab-purple h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="customer_overview" className="tab-indigo h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Customer Overview
              </TabsTrigger>
              <TabsTrigger value="roadmaps" className="tab-emerald h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
                <Map className="w-4 h-4" />
                Roadmaps
              </TabsTrigger>
              <TabsTrigger value="account_documents" className="tab-amber h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Account Documents
              </TabsTrigger>
            </TabsList>

            <div className="pt-2">
              <TabsContent value="sales_details" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
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
                              <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            Sales & Account Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold">Account Name <span className="text-red-500">*</span></Label>
                            <Input 
                              id="name" 
                              value={formData.name} 
                              onChange={(e) => setFormData({ ...formData, name: e.target.value, account_name: e.target.value })} 
                              placeholder="Enter account name..." 
                              className={cn("h-11", errors.name ? 'border-destructive' : '')} 
                              required 
                            />
                            {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name}</p>}
                          </div>



                          <div className="space-y-2">
                            <Label htmlFor="account_manager" className="text-sm font-semibold">Account Manager / Partner</Label>
                            <Input 
                              id="account_manager" 
                              value={formData.account_manager} 
                              onChange={(e) => setFormData({ ...formData, account_manager: e.target.value, client_partner: e.target.value })} 
                              placeholder="Manager name..." 
                              className="h-11" 
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="domain" className="text-sm font-semibold">Domain</Label>
                            <Input id="domain" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. Healthcare, Finance" className="h-11" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account_focus_trigger" className="text-sm font-semibold">Account Focus</Label>
                            <Select value={formData.account_focus} onValueChange={(val: any) => setFormData({ ...formData, account_focus: val })}>
                              <SelectTrigger id="account_focus_trigger" className="h-11"><SelectValue placeholder="Focus Level" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Platinum">Platinum</SelectItem>
                                <SelectItem value="Gold">Gold</SelectItem>
                                <SelectItem value="Silver">Silver</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engagement_age" className="text-sm font-semibold">Engagement Age (Years)</Label>
                            <Input id="engagement_age" value={formData.engagement_age || ''} onChange={(e) => setFormData({ ...formData, engagement_age: e.target.value })} placeholder="e.g. 5" className="h-11" />
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="account_research_link" className="text-sm font-semibold">Account Research Link</Label>
                            <Input id="account_research_link" value={formData.account_research_link} onChange={(e) => setFormData({ ...formData, account_research_link: e.target.value })} placeholder="https://..." className="h-11" />
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
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="delivery_owner" className="text-sm font-semibold">Delivery Owner</Label>
                            <Input id="delivery_owner" value={formData.delivery_owner} onChange={(e) => setFormData({ ...formData, delivery_owner: e.target.value })} placeholder="Process owner name..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="overall_delivery_health" className="text-sm font-semibold">Overall Delivery Health</Label>
                            <Input id="overall_delivery_health" value={formData.overall_delivery_health} onChange={(e) => setFormData({ ...formData, overall_delivery_health: e.target.value })} placeholder="e.g. Green, Amber, Red..." className="h-11" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 md:col-span-2">
                            <div className="space-y-2">
                              <Label htmlFor="team_size" className="text-sm font-semibold">Team Size</Label>
                              <Input id="team_size" value={formData.team_size || ''} onChange={(e) => setFormData({ ...formData, team_size: e.target.value })} placeholder="0" className="h-11" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="number_of_active_projects" className="text-sm font-semibold">Active Projects</Label>
                              <Input id="number_of_active_projects" value={formData.number_of_active_projects || ''} onChange={(e) => setFormData({ ...formData, number_of_active_projects: e.target.value })} placeholder="0" className="h-11" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="rate_card_health_trigger" className="text-sm font-semibold">Rate Card Health</Label>
                            <Select value={formData.current_rate_card_health} onValueChange={(val: any) => setFormData({ ...formData, current_rate_card_health: val })}>
                              <SelectTrigger id="rate_card_health_trigger" className="h-11"><SelectValue placeholder="Rate Health" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Above">Above</SelectItem>
                                <SelectItem value="At">At</SelectItem>
                                <SelectItem value="Below">Below</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engagement_models" className="text-sm font-semibold">Engagement Model/s</Label>
                            <Input id="engagement_models" value={formData.engagement_models} onChange={(e) => setFormData({ ...formData, engagement_models: e.target.value })} placeholder="e.g. T&M, Fixed Price" className="h-11" />
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="current_engagement_areas" className="text-sm font-semibold">Current Engagement Areas</Label>
                            <Textarea id="current_engagement_areas" value={formData.current_engagement_areas} onChange={(e) => setFormData({ ...formData, current_engagement_areas: e.target.value })} rows={4} placeholder="Summary of what we do for them..." />
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
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="total_rev" className="text-sm font-semibold">Current Revenue / Last Year Business ($)</Label>
                            <Input 
                              id="total_rev" 
                              type="number" 
                              value={formData.total_revenue || ''} 
                              onChange={(e) => setFormData({ ...formData, total_revenue: parseFloat(e.target.value) || 0, last_year_business_done: e.target.value })} 
                              placeholder="Current actual revenue..." 
                              className="h-11" 
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ai_rev" className="text-sm font-semibold">Current AI Revenue ($)</Label>
                            <Input 
                              id="ai_rev" 
                              type="number" 
                              value={formData.ai_revenue || ''} 
                              onChange={(e) => setFormData({ ...formData, ai_revenue: parseFloat(e.target.value) || 0 })} 
                              placeholder="Direct AI integration revenue..." 
                              className="h-11" 
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="target_rev" className="text-sm font-semibold">Target Revenue 2026 ($)</Label>
                            <Input 
                              id="target_rev" 
                              type="number" 
                              value={formData.target_revenue || ''} 
                              onChange={(e) => setFormData({ ...formData, target_revenue: parseFloat(e.target.value) || 0, target_projection_2026_accounts: e.target.value })} 
                              placeholder="Goal revenue..." 
                              className="h-11" 
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="forecast_rev" className="text-sm font-semibold">Forecast Revenue / Pipeline ($)</Label>
                            <Input 
                              id="forecast_rev" 
                              type="number" 
                              value={formData.forecast_revenue || ''} 
                              onChange={(e) => setFormData({ ...formData, forecast_revenue: parseFloat(e.target.value) || 0, current_pipeline_value: e.target.value })} 
                              placeholder="Projected forecast..." 
                              className="h-11" 
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company_revenue" className="text-sm font-semibold">Client Company Revenue</Label>
                            <Input id="company_revenue" value={formData.company_revenue || ''} onChange={(e) => setFormData({ ...formData, company_revenue: e.target.value })} placeholder="e.g. 100M" className="h-11" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="revenue_attrition_possibility" className="text-sm font-semibold">Attrition / Leakage?</Label>
                            <Input id="revenue_attrition_possibility" value={formData.revenue_attrition_possibility} onChange={(e) => setFormData({ ...formData, revenue_attrition_possibility: e.target.value })} placeholder="None / Low / Specific projects..." className="h-11" />
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
                        <CardContent className="space-y-6 pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="know_customer_value_chain_trigger" className="text-sm font-semibold">Value Chain Known?</Label>
                              <Select
                                value={formData.know_customer_value_chain ? "yes" : "no"}
                                onValueChange={(val) => setFormData({ ...formData, know_customer_value_chain: val === "yes" })}
                              >
                                <SelectTrigger id="know_customer_value_chain_trigger" className="h-11 font-medium"><SelectValue placeholder="Select..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="where_we_fit_in_value_chain" className="text-sm font-semibold">Value Chain Fit</Label>
                              <Input id="where_we_fit_in_value_chain" value={formData.where_we_fit_in_value_chain} onChange={(e) => setFormData({ ...formData, where_we_fit_in_value_chain: e.target.value })} placeholder="Describe our role..." className="h-11" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visibility_client_roadmap_2026" className="text-sm font-semibold">Roadmap Visibility (2026)</Label>
                            <Input id="visibility_client_roadmap_2026" value={formData.visibility_client_roadmap_2026} onChange={(e) => setFormData({ ...formData, visibility_client_roadmap_2026: e.target.value })} placeholder="e.g. High, Q1 projects clear..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="identified_areas_cross_up_selling" className="text-sm font-semibold">Cross-Sell Areas</Label>
                            <Textarea id="identified_areas_cross_up_selling" value={formData.identified_areas_cross_up_selling} onChange={(e) => setFormData({ ...formData, identified_areas_cross_up_selling: e.target.value })} rows={3} placeholder="List potential opportunities..." />
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <input type="checkbox" id="growth_action_plan_30days_ready" checked={formData.growth_action_plan_30days_ready} onChange={(e) => setFormData({ ...formData, growth_action_plan_30days_ready: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <Label htmlFor="growth_action_plan_30days_ready" className="text-sm font-semibold cursor-pointer">30 Days Growth Action Plan Ready?</Label>
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
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="client_partner" className="text-sm font-semibold">Client Partner</Label>
                            <Input id="client_partner" value={formData.client_partner} onChange={(e) => setFormData({ ...formData, client_partner: e.target.value })} placeholder="Account manager name..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="champion_customer_side" className="text-sm font-semibold">Champion</Label>
                            <Input id="champion_customer_side" value={formData.champion_customer_side} onChange={(e) => setFormData({ ...formData, champion_customer_side: e.target.value })} placeholder="Key contact name..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="champion_profile" className="text-sm font-semibold">Champion Profile</Label>
                            <Input id="champion_profile" value={formData.champion_profile} onChange={(e) => setFormData({ ...formData, champion_profile: e.target.value })} placeholder="Title and role info..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nitor_executive_connect_frequency" className="text-sm font-semibold">Exec Connect Frequency</Label>
                            <Input id="nitor_executive_connect_frequency" value={formData.nitor_executive_connect_frequency} onChange={(e) => setFormData({ ...formData, nitor_executive_connect_frequency: e.target.value })} placeholder="e.g. Monthly, Quarterly..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="current_nps" className="text-sm font-semibold">NPS</Label>
                            <Input id="current_nps" value={formData.current_nps || ''} onChange={(e) => setFormData({ ...formData, current_nps: e.target.value })} placeholder="Score (0-10)..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="total_active_connects" className="text-sm font-semibold">Total Active Connects</Label>
                            <Input id="total_active_connects" value={formData.total_active_connects || ''} onChange={(e) => setFormData({ ...formData, total_active_connects: e.target.value })} placeholder="Number of stakeholders..." className="h-11" />
                          </div>
                          <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                            <input type="checkbox" id="connect_with_decision_maker" checked={formData.connect_with_decision_maker} onChange={(e) => setFormData({ ...formData, connect_with_decision_maker: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <Label htmlFor="connect_with_decision_maker" className="text-sm font-semibold cursor-pointer">Connect with Decision Maker</Label>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {salesActiveSection === 'cadence' && (
                      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <CardHeader className="border-b border-slate-100 p-4 bg-emerald-50/30">
                          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <div className="p-1 rounded bg-emerald-50">
                              <Activity className="w-4 h-4 text-emerald-600" />
                            </div>
                            Readiness & Cadence
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="account_review_cadence_frequency" className="text-sm font-semibold">Account Review Cadence</Label>
                            <Input id="account_review_cadence_frequency" value={formData.account_review_cadence_frequency} onChange={(e) => setFormData({ ...formData, account_review_cadence_frequency: e.target.value })} placeholder="e.g. Monthly, Bi-weekly..." className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="qbr_happening_trigger" className="text-sm font-semibold">QBR Happening?</Label>
                            <Select value={formData.qbr_happening ? "Yes" : "No"} onValueChange={(val: any) => setFormData({ ...formData, qbr_happening: val === "Yes" })}>
                              <SelectTrigger id="qbr_happening_trigger" className="h-11 font-medium"><SelectValue placeholder="Select..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="technical_audit_frequency" className="text-sm font-semibold">Technical Audit Frequency</Label>
                            <Input id="technical_audit_frequency" value={formData.technical_audit_frequency} onChange={(e) => setFormData({ ...formData, technical_audit_frequency: e.target.value })} placeholder="e.g. Quarterly, Yearly..." className="h-11" />
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
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <Label htmlFor="key_competitors" className="text-sm font-semibold">Key Competitors</Label>
                            <Textarea id="key_competitors" value={formData.key_competitors} onChange={(e) => setFormData({ ...formData, key_competitors: e.target.value })} rows={3} placeholder="List main competitors in this account..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="our_positioning_vs_competition" className="text-sm font-semibold">Positioning vs Competition</Label>
                            <Textarea id="our_positioning_vs_competition" value={formData.our_positioning_vs_competition} onChange={(e) => setFormData({ ...formData, our_positioning_vs_competition: e.target.value })} rows={3} placeholder="Cost / Quality / Speed / Trust / AI..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="incumbency_strength_trigger" className="text-sm font-semibold">Incumbency Strength</Label>
                            <Select value={formData.incumbency_strength} onValueChange={(val: any) => setFormData({ ...formData, incumbency_strength: val })}>
                              <SelectTrigger id="incumbency_strength_trigger" className="h-11 font-medium"><SelectValue placeholder="Select strength..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="areas_competition_stronger" className="text-sm font-semibold">Areas Competition Stronger</Label>
                            <Textarea id="areas_competition_stronger" value={formData.areas_competition_stronger} onChange={(e) => setFormData({ ...formData, areas_competition_stronger: e.target.value })} rows={3} placeholder="Where do we need to improve?" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="white_spaces_we_own" className="text-sm font-semibold">White Spaces We Own</Label>
                            <Textarea id="white_spaces_we_own" value={formData.white_spaces_we_own} onChange={(e) => setFormData({ ...formData, white_spaces_we_own: e.target.value })} rows={3} placeholder="Unique value propositions we have..." />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {salesActiveSection === 'stakeholders' && (
                      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <CardHeader className="border-b border-slate-100 p-4 bg-indigo-50/30">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                              <div className="p-1 rounded bg-indigo-50">
                                <Users className="w-4 h-4 text-indigo-600" />
                              </div>
                              Strategic Stakeholders
                            </CardTitle>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setProfiles([...profiles, { id: `stk-${Date.now()}`, executive_sponsor: '', technical_decision_maker: '', influencer: '', neutral_stakeholders: '', negative_stakeholder: '', succession_risk: '', key_competitors: '', our_positioning: '', incumbency_strength: 'Medium', areas_competition_stronger: '', white_spaces_we_own: '', account_review_cadence: '', qbr_happening: 'No', technical_audit_frequency: '', created_at: '', updated_at: '' } as StrategicStakeholderProfile])}
                              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8 bg-white"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Row
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6 overflow-x-auto">
                          {profiles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No stakeholders added yet.</p>
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
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {profiles.map((profile, idx) => (
                                    <TableRow key={profile.id || idx}>
                                      <TableCell><Input value={profile.executive_sponsor || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], executive_sponsor: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="Sponsor..." /></TableCell>
                                      <TableCell><Input value={profile.technical_decision_maker || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], technical_decision_maker: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="TDM..." /></TableCell>
                                      <TableCell><Input value={profile.influencer || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], influencer: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="Influencers..." /></TableCell>
                                      <TableCell><Input value={profile.neutral_stakeholders || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], neutral_stakeholders: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="Neutral..." /></TableCell>
                                      <TableCell><Input value={profile.negative_stakeholder || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], negative_stakeholder: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="Negative..." /></TableCell>
                                      <TableCell><Input value={profile.succession_risk || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], succession_risk: e.target.value }; setProfiles(newProfiles); }} className="h-9 text-sm px-3" placeholder="Risk..." /></TableCell>

                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                          onClick={async () => {
                                            const profileId = profiles[idx].id;
                                            if (profileId?.startsWith('stk-')) {
                                              setProfiles(profiles.filter((_, i) => i !== idx));
                                              return;
                                            }
                                            try {
                                              if (profileId) {
                                                const { api } = await import('@/services/api');
                                                await api.deleteStakeholderDetails(profileId);
                                              }
                                              setProfiles(profiles.filter((_, i) => i !== idx));
                                              toast({ title: 'Success', description: 'Stakeholder deleted' });
                                            } catch (err) {
                                              toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
                                            }
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </TableCell>
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

              <TabsContent value="ai_recommendations" className="space-y-6 animate-in fade-in duration-500">
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-purple-950">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Recommendations & Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="ai_recommendations" className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Account AI Actionables</Label>
                      <Textarea
                        id="ai_recommendations"
                        value={formData.ai_recommendations}
                        onChange={(e) => setFormData({ ...formData, ai_recommendations: e.target.value })}
                        placeholder="Enter direct agent recommendations, key insight indicators, or identified automation opportunities..."
                        className="min-h-[200px] bg-white border-slate-200"
                      />
                      <p className="text-xs text-muted-foreground mt-2">These details synchronize immediately with both global dashboards and client insight generators.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customer_overview" className="space-y-6 animate-in fade-in duration-500">
                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
                    <CardTitle className="flex items-center gap-2 text-indigo-950">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Customer Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="customer_overview" className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Customer Overview & Scope</Label>
                      <Textarea
                        id="customer_overview"
                        value={formData.customer_overview}
                        onChange={(e) => setFormData({ ...formData, customer_overview: e.target.value })}
                        placeholder="Provide an overview of the customer's background, current industry standing, and global business parameters..."
                        className="min-h-[200px] bg-white border-slate-200"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Provides organizational scope mapping across modules.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roadmaps" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="shadow-sm border border-slate-200/60 overflow-hidden bg-white">
                  <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-transparent border-b border-emerald-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                        <Map className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg text-emerald-950">Account Roadmaps</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <RoadmapEditor
                      label="Technical Roadmap"
                      value={formData.technical_roadmap}
                      onChange={(val) => setFormData({ ...formData, technical_roadmap: val })}
                      placeholder="Enter technical roadmap details..."
                    />
                    <RoadmapEditor
                      label="Product Roadmap"
                      value={formData.product_roadmap}
                      onChange={(val) => setFormData({ ...formData, product_roadmap: val })}
                      placeholder="Enter product roadmap details..."
                    />
                    <RoadmapEditor
                      label="AI Roadmap"
                      value={formData.ai_roadmap}
                      onChange={(val) => setFormData({ ...formData, ai_roadmap: val })}
                      placeholder="Enter AI roadmap details..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account_documents" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <AccountDocuments accountId={salesAccountId || id} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Sticky Action Footer */}
          <div className="flex justify-between items-center sticky bottom-0 bg-white py-4 border-t z-50 mt-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-4 -mx-4 sm:px-0 sm:mx-0">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstTab || submitting}
                className="min-w-[100px] bg-white"
              >
                Previous
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={submitting || isLastTab}
                className="min-w-[100px] bg-slate-900 text-white hover:bg-slate-800"
              >
                Next
              </Button>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(backUrl)} className="bg-white" disabled={submitting}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Update Account' : 'Create Account')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FinancialAccountForm;
