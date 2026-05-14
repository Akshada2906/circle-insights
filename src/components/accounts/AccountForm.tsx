import { useState, useEffect } from 'react';
import { Account, StrategicStakeholderProfile } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Building2, DollarSign, Target, Users, Plus, Trash2, Activity, Swords, Award, FileText, Map, Brain, List } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccountDocuments } from './AccountDocuments';
import { RoadmapEditor } from './RoadmapEditor';
import { getFinanceAccountById, getFinanceAccounts } from '@/services/api';

interface AccountFormProps {
    account?: Account;
    onSubmit: (account: Partial<Account>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading = false }: AccountFormProps) {
    const [formData, setFormData] = useState<Partial<Account>>({
        account_name: account?.account_name || '',
        domain: account?.domain || '',
        company_revenue: account?.company_revenue || '',
        know_customer_value_chain: account?.know_customer_value_chain || false,
        account_focus: account?.account_focus || 'Silver',
        delivery_owner: account?.delivery_owner || '',
        client_partner: account?.client_partner || '',
        where_we_fit_in_value_chain: account?.where_we_fit_in_value_chain || '',
        engagement_age: account?.engagement_age || '',
        last_year_business_done: account?.last_year_business_done || '',
        target_projection_2026_accounts: account?.target_projection_2026_accounts || '',
        target_projection_2026_delivery: account?.target_projection_2026_delivery || '',
        current_pipeline_value: account?.current_pipeline_value || '',
        revenue_attrition_possibility: account?.revenue_attrition_possibility || '',
        current_engagement_areas: account?.current_engagement_areas || '',
        team_size: account?.team_size || '',
        engagement_models: account?.engagement_models || '',
        current_rate_card_health: account?.current_rate_card_health || 'At',
        number_of_active_projects: account?.number_of_active_projects || '',
        overall_delivery_health: account?.overall_delivery_health || '',
        current_nps: account?.current_nps || '',
        champion_customer_side: account?.champion_customer_side || '',
        champion_profile: account?.champion_profile || '',
        connect_with_decision_maker: account?.connect_with_decision_maker || false,
        total_active_connects: account?.total_active_connects || '',
        visibility_client_roadmap_2026: account?.visibility_client_roadmap_2026 || '',
        identified_areas_cross_up_selling: account?.identified_areas_cross_up_selling || '',
        nitor_executive_connect_frequency: account?.nitor_executive_connect_frequency || '',
        growth_action_plan_30days_ready: account?.growth_action_plan_30days_ready || false,
        account_research_link: account?.account_research_link || '',
        technical_roadmap: account?.technical_roadmap || '',
        product_roadmap: account?.product_roadmap || '',
        ai_roadmap: account?.ai_roadmap || '',
        stakeholder_profile_id: account?.stakeholder_profile_id || '',
    });

    const [profiles, setProfiles] = useState<StrategicStakeholderProfile[]>(
        account?.strategic_profiles && account.strategic_profiles.length > 0
            ? account.strategic_profiles
            : []
    );

    const [financeData, setFinanceData] = useState<any>(null);

    useEffect(() => {
        const syncData = async () => {
            if (account) {
                setFinanceData(null);
                // Initialize form with base account data
                const initialData = {
                    account_name: account.account_name || '',
                    domain: account.domain || '',
                    company_revenue: account.company_revenue || '',
                    know_customer_value_chain: account.know_customer_value_chain || false,
                    account_focus: account.account_focus || 'Silver',
                    delivery_owner: account.delivery_owner || '',
                    client_partner: account.client_partner || '',
                    where_we_fit_in_value_chain: account.where_we_fit_in_value_chain || '',
                    engagement_age: account.engagement_age || '',
                    last_year_business_done: account.last_year_business_done || '',
                    target_projection_2026_accounts: account.target_projection_2026_accounts || '',
                    target_projection_2026_delivery: account.target_projection_2026_delivery || '',
                    current_pipeline_value: account.current_pipeline_value || '',
                    revenue_attrition_possibility: account.revenue_attrition_possibility || '',
                    current_engagement_areas: account.current_engagement_areas || '',
                    team_size: account.team_size || '',
                    engagement_models: account.engagement_models || '',
                    current_rate_card_health: account.current_rate_card_health || 'At',
                    number_of_active_projects: account.number_of_active_projects || '',
                    overall_delivery_health: account.overall_delivery_health || '',
                    current_nps: account.current_nps || '',
                    champion_customer_side: account.champion_customer_side || '',
                    champion_profile: account.champion_profile || '',
                    connect_with_decision_maker: account.connect_with_decision_maker || false,
                    total_active_connects: account.total_active_connects || '',
                    visibility_client_roadmap_2026: account.visibility_client_roadmap_2026 || '',
                    identified_areas_cross_up_selling: account.identified_areas_cross_up_selling || '',
                    nitor_executive_connect_frequency: account.nitor_executive_connect_frequency || '',
                    growth_action_plan_30days_ready: account.growth_action_plan_30days_ready || false,
                    account_research_link: account.account_research_link || '',
                    technical_roadmap: account.technical_roadmap || '',
                    product_roadmap: account.product_roadmap || '',
                    ai_roadmap: account.ai_roadmap || '',
                    stakeholder_profile_id: account.stakeholder_profile_id || '',
                };

                // Fetch real financial data to override base metrics
                try {
                    const allFinanceAccounts = await getFinanceAccounts();

                    // Try to find match by ID or Name (Parity with AccountDetails.tsx logic)
                    let match = allFinanceAccounts.find((a: any) => a.id === account.account_id);

                    if (!match) {
                        const searchName = (account.account_name || "").trim().toLowerCase();
                        match = allFinanceAccounts.find((a: any) => {
                            const financeName = (a.name || a.account_name || "").trim().toLowerCase();
                            return financeName === searchName || financeName.includes(searchName) || searchName.includes(financeName);
                        });
                    }

                    if (match) {
                        const fetchedFinance = await getFinanceAccountById(match.id);
                        if (fetchedFinance) {
                            setFinanceData(fetchedFinance);
                            initialData.last_year_business_done = formatCurrency(fetchedFinance.current_revenue || fetchedFinance.total_revenue || 0);
                            initialData.target_projection_2026_accounts = formatCurrency(fetchedFinance.target_revenue || 0);
                            initialData.current_pipeline_value = formatCurrency(fetchedFinance.forecast_revenue || 0);
                            const totalProj = (fetchedFinance.active_project_count || 0) + (fetchedFinance.inactive_project_count || 0);
                            initialData.number_of_active_projects = totalProj.toString();
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch finance data for form:", err);
                }

                setFormData(initialData);
                if (account.strategic_profiles) {
                    setProfiles(account.strategic_profiles);
                }
            }
        };

        syncData();
    }, [account]);

    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.account_name?.trim()) newErrors.account_name = 'Account name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (marked with *)",
                variant: "destructive",
            });
            return;
        }

        const submissionData: Partial<Account> = {
            ...formData,
            strategic_profiles: profiles,
            updated_at: new Date().toISOString(),
        };

        if (!account) {
            submissionData.account_id = `acc-${Date.now()}`;
            submissionData.created_at = new Date().toISOString();
        }

        onSubmit(submissionData);
    };

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
    const currentTabIndex = TABS.indexOf(activeTab);

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Revenue</span>
                        {financeData ? (
                            <p className="text-xl font-bold text-slate-900">
                                {formatCurrency(financeData.current_revenue || financeData.total_revenue || 0)}
                            </p>
                        ) : (
                            <div className="relative">
                                <Input
                                    value={formData.last_year_business_done || ''}
                                    onChange={(e) => setFormData({ ...formData, last_year_business_done: e.target.value })}
                                    className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                                    placeholder="$0"
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">YTD Actual</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Revenue</span>
                        {financeData ? (
                            <p className="text-xl font-bold text-slate-900">
                                {formatCurrency(financeData.target_revenue || 0)}
                            </p>
                        ) : (
                            <div className="relative">
                                <Input
                                    value={formData.target_projection_2026_accounts || ''}
                                    onChange={(e) => setFormData({ ...formData, target_projection_2026_accounts: e.target.value })}
                                    className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                                    placeholder="$0"
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">FY2026 Goal</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Revenue</span>
                        {financeData ? (
                            <p className="text-xl font-bold text-slate-900">
                                {formatCurrency(financeData.forecast_revenue || 0)}
                            </p>
                        ) : (
                            <div className="relative">
                                <Input
                                    value={formData.current_pipeline_value || ''}
                                    onChange={(e) => setFormData({ ...formData, current_pipeline_value: e.target.value })}
                                    className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                                    placeholder="$0"
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">Q4 Proj.</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between bg-red-50/30">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortfall</span>
                        <p className="text-xl font-bold text-red-600">
                            {financeData
                                ? formatCurrency(financeData.shortfall ?? ((financeData.target_revenue || 0) - (financeData.current_revenue || financeData.total_revenue || 0) - (financeData.forecast_revenue || 0)))
                                : formatCurrency(Math.max(0, parseFloat((formData.target_projection_2026_accounts || "0").toString().replace(/[$,]/g, '')) - parseFloat((formData.last_year_business_done || "0").toString().replace(/[$,]/g, '')) - parseFloat((formData.current_pipeline_value || "0").toString().replace(/[$,]/g, ''))))}
                        </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">Calculated Risk</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Revenue</span>
                        <p className="text-xl font-bold text-blue-600">
                            {financeData ? formatCurrency(financeData.ai_revenue) : "$0"}
                        </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">Direct/Assist</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Penetration</span>
                        <p className="text-xl font-bold text-blue-600">
                            {financeData ? `${(financeData.ai_penetration_pct || 0).toFixed(1)}%` : "0.0%"}
                        </p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">+2.1% MoM</span>
                </Card>
                <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</span>
                        {financeData ? (
                            <p className="text-xl font-bold text-slate-900">
                                {financeData.active_project_count + financeData.inactive_project_count}
                            </p>
                        ) : (
                            <div className="relative">
                                <Input
                                    value={formData.number_of_active_projects || ''}
                                    onChange={(e) => setFormData({ ...formData, number_of_active_projects: e.target.value })}
                                    className="text-xl font-bold text-slate-900 border-none p-0 focus-visible:ring-0 h-auto bg-transparent w-full"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-4">
                        {financeData
                            ? `${financeData.active_project_count} Active / ${financeData.inactive_project_count} Inc.`
                            : "Active Projects"}
                    </span>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full gap-2 h-auto mb-6">
                    <TabsTrigger value="sales_details" className="tab-blue h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2" disabled={!account && 0 > currentTabIndex}>
                        <Building2 className="w-4 h-4" />
                        Sales Details
                    </TabsTrigger>
                    <TabsTrigger value="ai_recommendations" className="tab-purple h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2" disabled={!account && 1 > currentTabIndex}>
                        <Brain className="w-4 h-4" />
                        AI Recommendations
                    </TabsTrigger>
                    <TabsTrigger value="customer_overview" className="tab-indigo h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2" disabled={!account && 2 > currentTabIndex}>
                        <Activity className="w-4 h-4" />
                        Customer Overview
                    </TabsTrigger>
                    <TabsTrigger value="roadmaps" className="tab-emerald h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2" disabled={!account && 3 > currentTabIndex}>
                        <Map className="w-4 h-4" />
                        Roadmaps
                    </TabsTrigger>
                    <TabsTrigger value="account_documents" className="tab-amber h-auto py-2 whitespace-normal text-xs px-2 md:text-sm leading-tight flex items-center gap-2" disabled={!account && 4 > currentTabIndex}>
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
                                                    <Users className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                Sales & Account Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="account_name" className="text-sm font-semibold">Account Name *</Label>
                                                <Input id="account_name" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} placeholder="Enter account name..." className={cn(errors.account_name ? 'border-destructive' : '')} />
                                                {errors.account_name && <p className="text-[10px] text-destructive font-semibold">{errors.account_name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="domain" className="text-sm font-semibold">Domain</Label>
                                                <Input id="domain" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. Healthcare, Finance" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="account_focus_trigger" className="text-sm font-semibold">Account Focus</Label>
                                                <Select value={formData.account_focus} onValueChange={(val: any) => setFormData({ ...formData, account_focus: val })}>
                                                    <SelectTrigger id="account_focus_trigger"><SelectValue placeholder="Focus Level" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Platinum">Platinum</SelectItem>
                                                        <SelectItem value="Gold">Gold</SelectItem>
                                                        <SelectItem value="Silver">Silver</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="engagement_age" className="text-sm font-semibold">Engagement Age (Years)</Label>
                                                <Input id="engagement_age" value={formData.engagement_age || ''} onChange={(e) => setFormData({ ...formData, engagement_age: e.target.value })} placeholder="e.g. 5" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <Label htmlFor="account_research_link" className="text-sm font-semibold">Account Research Link</Label>
                                                <Input id="account_research_link" value={formData.account_research_link} onChange={(e) => setFormData({ ...formData, account_research_link: e.target.value })} placeholder="https://..." />
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
                                                <Input id="delivery_owner" value={formData.delivery_owner} onChange={(e) => setFormData({ ...formData, delivery_owner: e.target.value })} placeholder="Process owner name..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="overall_delivery_health" className="text-sm font-semibold">Overall Delivery Health</Label>
                                                <Input id="overall_delivery_health" value={formData.overall_delivery_health} onChange={(e) => setFormData({ ...formData, overall_delivery_health: e.target.value })} placeholder="e.g. Green, Amber, Red..." />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="team_size" className="text-sm font-semibold">Team Size</Label>
                                                    <Input id="team_size" value={formData.team_size || ''} onChange={(e) => setFormData({ ...formData, team_size: e.target.value })} placeholder="0" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="number_of_active_projects" className="text-sm font-semibold">Active Projects</Label>
                                                    <Input id="number_of_active_projects" value={formData.number_of_active_projects || ''} onChange={(e) => setFormData({ ...formData, number_of_active_projects: e.target.value })} placeholder="0" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="rate_card_health_trigger" className="text-sm font-semibold">Rate Card Health</Label>
                                                <Select value={formData.current_rate_card_health} onValueChange={(val: any) => setFormData({ ...formData, current_rate_card_health: val })}>
                                                    <SelectTrigger id="rate_card_health_trigger"><SelectValue placeholder="Rate Health" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Above">Above</SelectItem>
                                                        <SelectItem value="At">At</SelectItem>
                                                        <SelectItem value="Below">Below</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="engagement_models" className="text-sm font-semibold">Engagement Model/s</Label>
                                                <Input id="engagement_models" value={formData.engagement_models} onChange={(e) => setFormData({ ...formData, engagement_models: e.target.value })} placeholder="e.g. T&M, Fixed Price" />
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
                                                <Label htmlFor="company_revenue" className="text-sm font-semibold">Company Revenue (USD)</Label>
                                                <Input id="company_revenue" value={formData.company_revenue || ''} onChange={(e) => setFormData({ ...formData, company_revenue: e.target.value })} placeholder="e.g. 100M" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_year_business_done" className="text-sm font-semibold">Last Year Business Done</Label>
                                                <Input id="last_year_business_done" value={formData.last_year_business_done || ''} onChange={(e) => setFormData({ ...formData, last_year_business_done: e.target.value })} placeholder="e.g. 5M" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="target_projection_2026_accounts" className="text-sm font-semibold">Target 2026 (Accounts)</Label>
                                                <Input id="target_projection_2026_accounts" value={formData.target_projection_2026_accounts || ''} onChange={(e) => setFormData({ ...formData, target_projection_2026_accounts: e.target.value })} placeholder="Target amount..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="target_projection_2026_delivery" className="text-sm font-semibold">Target 2026 (Delivery)</Label>
                                                <Input id="target_projection_2026_delivery" value={formData.target_projection_2026_delivery || ''} onChange={(e) => setFormData({ ...formData, target_projection_2026_delivery: e.target.value })} placeholder="Target amount..." />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="current_pipeline_value" className="text-sm font-semibold">Current Pipeline Value</Label>
                                                <Input id="current_pipeline_value" value={formData.current_pipeline_value || ''} onChange={(e) => setFormData({ ...formData, current_pipeline_value: e.target.value })} placeholder="e.g. 2M" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="revenue_attrition_possibility" className="text-sm font-semibold">Attrition / Leakage?</Label>
                                                <Input id="revenue_attrition_possibility" value={formData.revenue_attrition_possibility} onChange={(e) => setFormData({ ...formData, revenue_attrition_possibility: e.target.value })} placeholder="None / Low / Specific projects..." />
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
                                                        <SelectTrigger id="know_customer_value_chain_trigger" className="font-medium"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes">Yes</SelectItem>
                                                            <SelectItem value="no">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="where_we_fit_in_value_chain" className="text-sm font-semibold">Value Chain Fit</Label>
                                                    <Input id="where_we_fit_in_value_chain" value={formData.where_we_fit_in_value_chain} onChange={(e) => setFormData({ ...formData, where_we_fit_in_value_chain: e.target.value })} placeholder="Describe our role..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="visibility_client_roadmap_2026" className="text-sm font-semibold">Roadmap Visibility (2026)</Label>
                                                <Input id="visibility_client_roadmap_2026" value={formData.visibility_client_roadmap_2026} onChange={(e) => setFormData({ ...formData, visibility_client_roadmap_2026: e.target.value })} placeholder="e.g. High, Q1 projects clear..." />
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
                                                <Input id="client_partner" value={formData.client_partner} onChange={(e) => setFormData({ ...formData, client_partner: e.target.value })} placeholder="Account manager name..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="champion_customer_side" className="text-sm font-semibold">Champion</Label>
                                                <Input id="champion_customer_side" value={formData.champion_customer_side} onChange={(e) => setFormData({ ...formData, champion_customer_side: e.target.value })} placeholder="Key contact name..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="champion_profile" className="text-sm font-semibold">Champion Profile</Label>
                                                <Input id="champion_profile" value={formData.champion_profile} onChange={(e) => setFormData({ ...formData, champion_profile: e.target.value })} placeholder="Title and role info..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nitor_executive_connect_frequency" className="text-sm font-semibold">Exec Connect Frequency</Label>
                                                <Input id="nitor_executive_connect_frequency" value={formData.nitor_executive_connect_frequency} onChange={(e) => setFormData({ ...formData, nitor_executive_connect_frequency: e.target.value })} placeholder="e.g. Monthly, Quarterly..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="current_nps" className="text-sm font-semibold">NPS</Label>
                                                <Input id="current_nps" value={formData.current_nps || ''} onChange={(e) => setFormData({ ...formData, current_nps: e.target.value })} placeholder="Score (0-10)..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="total_active_connects" className="text-sm font-semibold">Total Active Connects</Label>
                                                <Input id="total_active_connects" value={formData.total_active_connects || ''} onChange={(e) => setFormData({ ...formData, total_active_connects: e.target.value })} placeholder="Number of stakeholders..." />
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
                                                <Input id="account_review_cadence_frequency" value={formData.account_review_cadence_frequency} onChange={(e) => setFormData({ ...formData, account_review_cadence_frequency: e.target.value })} placeholder="e.g. Monthly, Bi-weekly..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="qbr_happening_trigger" className="text-sm font-semibold">QBR Happening?</Label>
                                                <Select value={formData.qbr_happening ? "Yes" : "No"} onValueChange={(val: any) => setFormData({ ...formData, qbr_happening: val === "Yes" })}>
                                                    <SelectTrigger id="qbr_happening_trigger" className="font-medium"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="technical_audit_frequency" className="text-sm font-semibold">Technical Audit Frequency</Label>
                                                <Input id="technical_audit_frequency" value={formData.technical_audit_frequency} onChange={(e) => setFormData({ ...formData, technical_audit_frequency: e.target.value })} placeholder="e.g. Quarterly, Yearly..." />
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
                                                    <SelectTrigger id="incumbency_strength_trigger" className="font-medium"><SelectValue placeholder="Select strength..." /></SelectTrigger>
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
                                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8"
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
                                    AI Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ai_recommendations" className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Recommendations for this account</Label>
                                    <Textarea
                                        id="ai_recommendations"
                                        placeholder="Note: Finance details must be edited in the Financial Account view..."
                                        disabled
                                        className="min-h-[200px] bg-slate-50"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">These details are managed securely via the Financials module.</p>
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
                                    <Label htmlFor="customer_overview" className="text-slate-500 font-semibold uppercase text-xs tracking-wider">Customer Overview Details</Label>
                                    <Textarea
                                        id="customer_overview"
                                        placeholder="Note: Finance details must be edited in the Financial Account view..."
                                        disabled
                                        className="min-h-[200px] bg-slate-50"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">These details are managed securely via the Financials module.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roadmaps" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card className="shadow-sm border border-slate-200/60 overflow-hidden">
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
                        <AccountDocuments accountId={account?.account_id} />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Sticky Action Footer */}
            <div className="flex justify-between items-center sticky bottom-0 bg-background py-4 border-t z-50">
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={(!account && isFirstTab) || isLoading}
                        className="min-w-[100px]"
                    >
                        Previous
                    </Button>

                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || (!account && isLastTab)}
                        className="min-w-[100px]"
                    >
                        Next
                    </Button>
                </div>

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isLoading || (!account && !isLastTab)}
                        className={cn(
                            "min-w-[140px]",
                            (!account && !isLastTab) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
