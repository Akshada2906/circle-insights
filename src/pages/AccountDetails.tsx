import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/contexts/AccountContext';
import {
    ArrowLeft,
    Pencil,
    Building2,
    Target,
    Users,
    Award,
    Swords,
    FileText,
    Activity,
    Map,
    ChevronDown,
    ChevronUp,
    Search,
    Briefcase,
    MoreVertical,
    Brain,
    Plus,
    List
} from 'lucide-react';
import { RoadmapViewer } from '@/components/accounts/RoadmapViewer';
import {
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenu,
    DropdownMenuContent
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { api, getFinanceAccounts, getFinanceAccountById, deleteFinanceProject, createFinanceAccount, getFinanceDeliveryUnits } from '@/services/api';
import { StrategicStakeholderProfile } from '@/types/account';
import { AccountDocuments } from '@/components/accounts/AccountDocuments';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';

const AccountDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { accounts, getAccountById, fetchAccount, fetchAccountStakeholders } = useAccounts();
    // Finance data state
    const [financeData, setFinanceData] = useState<any>(null);
    const [loadingFinance, setLoadingFinance] = useState(false);
    const [projectSearch, setProjectSearch] = useState('');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const financeFetchedRef = useRef<string | null>(null);

    const stakeholderPage = 1; // Simplified for now, or can be state if needed
    const stakeholdersPerPage = 5;
    const [basicInfoOpen, setBasicInfoOpen] = useState(true);
    const [deliveryOpen, setDeliveryOpen] = useState(true);
    const [financialOpen, setFinancialOpen] = useState(true);
    const [strategyOpen, setStrategyOpen] = useState(false);
    const [relationshipsOpen, setRelationshipsOpen] = useState(false);
    const [stakeholdersOpen, setStakeholdersOpen] = useState(false);
    const [competitionOpen, setCompetitionOpen] = useState(false);
    const [readinessOpen, setReadinessOpen] = useState(false);

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

    useEffect(() => {
        if (id) {
            fetchAccount(id);
        }
    }, [id, fetchAccount]);

    const contextAccountInit = getAccountById(id || '');

    // Fetch finance data by name or ID
    useEffect(() => {
        if (!id) return;

        const hasValidName = contextAccountInit?.account_name && contextAccountInit.account_name.trim() !== '';
        if (financeFetchedRef.current === id && (financeData || hasValidName)) {
            return;
        }

        const fetchFinance = async () => {
            setLoadingFinance(true);
            try {
                // Fetch the list first to avoid causing a 404 error with a blind ID probe
                const allFinanceAccounts = await getFinanceAccounts();

                // 1. Try to find by ID in the list
                let match = allFinanceAccounts.find((a: any) => a.id === id);

                // 2. If not found by ID, try to find by name
                if (!match && contextAccountInit?.account_name) {
                    const searchName = contextAccountInit.account_name.trim().toLowerCase();
                    if (searchName) {
                        match = allFinanceAccounts.find((a: any) => {
                            const financeName = (a.name || a.account_name || "").trim().toLowerCase();
                            return financeName === searchName || financeName.includes(searchName) || searchName.includes(financeName);
                        });
                    }
                }

                if (match) {
                    financeFetchedRef.current = id;
                    // Only call by ID once we know it exists
                    const data = await getFinanceAccountById(match.id);
                    setFinanceData(data);
                } else {
                    if (hasValidName) {
                        financeFetchedRef.current = id;
                    }
                    setFinanceData(null);
                }
            } catch (error) {
                console.error("Failed to fetch finance data:", error);
            } finally {
                setLoadingFinance(false);
            }
        };

        fetchFinance();
    }, [id, contextAccountInit?.account_name]);

    // Resolve context account by ID or by matching financeData.name
    const resolvedContextAccount = useMemo(() => {
        const byId = getAccountById(id || '');
        if (byId && byId.account_name?.trim()) return byId;

        // Try matching by name if financeData is available
        if (financeData?.name) {
            const searchName = financeData.name.trim().toLowerCase();
            const byName = accounts.find(a => a.account_name?.trim().toLowerCase() === searchName);
            if (byName) return byName;
        }
        return byId;
    }, [id, getAccountById, financeData?.name, accounts]);

    // Automatically load stakeholders if we resolved the real dashboard account but its profiles are empty
    const realAccountId = resolvedContextAccount?.account_id;
    const hasProfiles = resolvedContextAccount?.strategic_profiles && resolvedContextAccount.strategic_profiles.length > 0;
    const stakeholdersFetchedRef = useRef<string | null>(null);

    useEffect(() => {
        if (realAccountId && !hasProfiles && stakeholdersFetchedRef.current !== realAccountId) {
            stakeholdersFetchedRef.current = realAccountId;
            fetchAccountStakeholders(realAccountId);
        }
    }, [realAccountId, hasProfiles, fetchAccountStakeholders]);

    const contextAccount = resolvedContextAccount;
    const baseAcc: any = resolvedContextAccount || {};
    const hasSalesDetails = !!resolvedContextAccount;
    const account: any = {
        ...baseAcc,
        account_id: baseAcc.account_id || id,
        account_name: financeData?.name || baseAcc.account_name || 'Loading Account...',
        domain: hasSalesDetails ? (baseAcc.domain || financeData?.domain || 'Technology') : '-',
        account_focus: hasSalesDetails ? (baseAcc.account_focus || '-') : '-',
        delivery_owner: hasSalesDetails ? (baseAcc.delivery_owner || financeData?.account_manager || 'Unassigned') : '-',
        current_pipeline_value: hasSalesDetails ? (financeData?.forecast_revenue ? `$${financeData.forecast_revenue.toLocaleString()}` : (baseAcc.current_pipeline_value || '$0')) : '-',
        number_of_active_projects: hasSalesDetails ? (financeData?.active_project_count ? financeData.active_project_count.toString() : (baseAcc.number_of_active_projects || '0')) : '-',
        overall_delivery_health: hasSalesDetails ? (financeData?.active_project_count > 0 ? 'Green' : (baseAcc.overall_delivery_health || 'Amber')) : '-',
        engagement_age: hasSalesDetails ? (baseAcc.engagement_age || '2 Years') : '-',
        last_year_business_done: hasSalesDetails ? (financeData?.current_revenue ? `$${financeData.current_revenue.toLocaleString()}` : (baseAcc.last_year_business_done || '$0')) : '-',
        target_projection_2026_accounts: hasSalesDetails ? (financeData?.target_revenue ? `$${financeData.target_revenue.toLocaleString()}` : (baseAcc.target_projection_2026_accounts || '$0')) : '-',
        target_projection_2026_delivery: hasSalesDetails ? (baseAcc.target_projection_2026_delivery || '-') : '-',
        company_revenue: hasSalesDetails ? (financeData?.target_revenue ? `$${financeData.target_revenue.toLocaleString()}` : (baseAcc.company_revenue || '$0')) : '-',
        engagement_models: hasSalesDetails ? (baseAcc.engagement_models || 'T&M') : '-',
        current_engagement_areas: hasSalesDetails ? (baseAcc.current_engagement_areas || '-') : '-',
        team_size: hasSalesDetails ? (baseAcc.team_size || '-') : '-',
        current_rate_card_health: hasSalesDetails ? (baseAcc.current_rate_card_health || '-') : '-',
        revenue_attrition_possibility: hasSalesDetails ? (baseAcc.revenue_attrition_possibility || '-') : '-',
        created_at: financeData?.created_at || baseAcc.created_at || new Date().toISOString(),
        updated_at: financeData?.updated_at || baseAcc.updated_at || new Date().toISOString(),
        projects: financeData?.projects || baseAcc.projects || [],
        status: baseAcc.status || 'ACTIVE',
        account_research_link: hasSalesDetails ? (baseAcc.account_research_link || '#') : '',
        know_customer_value_chain: hasSalesDetails ? (baseAcc.know_customer_value_chain || false) : false,
        where_we_fit_in_value_chain: hasSalesDetails ? (baseAcc.where_we_fit_in_value_chain || 'Not detailed.') : '-',
        identified_areas_cross_up_selling: hasSalesDetails ? (baseAcc.identified_areas_cross_up_selling || 'None identified.') : '-',
        visibility_client_roadmap_2026: hasSalesDetails ? (baseAcc.visibility_client_roadmap_2026 || 'No visibility.') : '-',
        growth_action_plan_30days_ready: hasSalesDetails ? (baseAcc.growth_action_plan_30days_ready || false) : false,
        client_partner: hasSalesDetails ? (financeData?.account_manager || baseAcc.client_partner || '-') : '-',
        champion_customer_side: hasSalesDetails ? (baseAcc.champion_customer_side || '-') : '-',
        champion_profile: hasSalesDetails ? (baseAcc.champion_profile || '-') : '-',
        nitor_executive_connect_frequency: hasSalesDetails ? (baseAcc.nitor_executive_connect_frequency || '-') : '-',
        current_nps: hasSalesDetails ? (baseAcc.current_nps || '-') : '-',
        total_active_connects: hasSalesDetails ? (baseAcc.total_active_connects || '-') : '-',
        connect_with_decision_maker: hasSalesDetails ? (baseAcc.connect_with_decision_maker || false) : false,
        account_review_cadence_frequency: hasSalesDetails ? (baseAcc.account_review_cadence_frequency || '-') : '-',
        technical_audit_frequency: hasSalesDetails ? (baseAcc.technical_audit_frequency || '-') : '-',
        qbr_happening: hasSalesDetails ? (baseAcc.qbr_happening || false) : false,
        key_competitors: hasSalesDetails ? (baseAcc.key_competitors || '-') : '-',
        incumbency_strength: hasSalesDetails ? (baseAcc.incumbency_strength || '-') : '-',
        our_positioning_vs_competition: hasSalesDetails ? (baseAcc.our_positioning_vs_competition || '-') : '-',
        areas_competition_stronger: hasSalesDetails ? (baseAcc.areas_competition_stronger || '-') : '-',
        white_spaces_we_own: hasSalesDetails ? (baseAcc.white_spaces_we_own || '-') : '-',
        strategic_profiles: hasSalesDetails ? (baseAcc.strategic_profiles || []) : [],
        technical_roadmap: baseAcc.technical_roadmap || [],
        product_roadmap: baseAcc.product_roadmap || [],
        ai_roadmap: baseAcc.ai_roadmap || []
    };


    // Projects filtering - MUST BE BEFORE EARLY RETURN
    const filteredProjects = useMemo(() => {
        if (!financeData?.projects) return [];
        return financeData.projects.filter((p: any) =>
            (p.name || '').toLowerCase().includes(projectSearch.toLowerCase()) ||
            (p.overview || '').toLowerCase().includes(projectSearch.toLowerCase())
        );
    }, [financeData?.projects, projectSearch]);

    const displayedProjects = (showAllProjects || projectSearch !== '')
        ? filteredProjects
        : filteredProjects.slice(0, 10);

    const formatCurrency = (amount: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount.replace(/[$,]/g, '')) : amount;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const stakeholders = account?.strategic_profiles || [];
    const paginatedStakeholders = stakeholders.slice(0, stakeholdersPerPage);
    const totalStakeholderPages = Math.ceil(stakeholders.length / stakeholdersPerPage);

    if (loadingFinance) {
        return (
            <MainLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center py-24 space-y-4">
                        <Activity className="w-10 h-10 mx-auto animate-spin text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-800">Loading Account Details...</h2>
                        <p className="text-sm text-slate-500">Retrieving real-time financial and strategic records</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!financeData && !contextAccount?.account_name) {
        return (
            <MainLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Account not found</h2>
                        <p className="text-muted-foreground mb-6">
                            The account you're looking for doesn't exist.
                        </p>
                        <Button onClick={() => navigate('/accounts')}>Back to Accounts</Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/accounts')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Accounts
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm"
                            onClick={() => {
                                if (financeData) {
                                    navigate(`/financials/${financeData.id}/insights`);
                                } else {
                                    // Trigger auto-init flow if someone clicks this
                                    document.getElementById('add-project-btn-header')?.click();
                                }
                            }}
                        >
                            <Brain className="w-4 h-4" />
                            View Strategic Insights
                        </Button>
                        <Button onClick={() => navigate(`/accounts/${baseAcc.account_id || id}/edit`)} variant="outline" className="gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Account
                        </Button>
                        <Button
                            id="add-project-btn-header"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                            onClick={async () => {
                                if (financeData) {
                                    navigate(`/financials/${financeData.id}/projects/new`, { state: { backUrl: `/accounts/${id}` } });
                                } else {
                                    try {
                                        const units = await getFinanceDeliveryUnits();
                                        const defaultUnitId = units.length > 0 ? units[0].id : null;

                                        if (!defaultUnitId) {
                                            throw new Error("No delivery units found. Please contact admin.");
                                        }

                                        const newFinanceAcc = await createFinanceAccount({
                                            id: id,
                                            name: account.account_name,
                                            delivery_unit_id: defaultUnitId,
                                            target_revenue: 0,
                                            forecast_revenue: 0,
                                            account_manager: account.client_partner || ""
                                        });
                                        navigate(`/financials/${newFinanceAcc.id}/projects/new`, { state: { backUrl: `/accounts/${id}` } });
                                    } catch (err: any) {
                                        console.error("Failed to auto-initialize finance record:", err);
                                        toast({
                                            title: "Sync Error",
                                            description: err.message || "Could not initialize financial record.",
                                            variant: "destructive"
                                        });
                                    }
                                }
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Project
                        </Button>
                    </div>
                </div>

                {/* Account Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-foreground">{account.account_name}</h1>
                </div>

                {/* Financial Overview Metrics (if available) */}
                {loadingFinance ? (
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
                            <Activity className="w-5 h-5 mr-2 animate-spin" />
                            Loading financial data...
                        </CardContent>
                    </Card>
                ) : financeData ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Revenue</span>
                                <p className="text-2xl font-bold text-slate-900">
                                    {financeData
                                        ? formatCurrency(financeData.current_revenue || financeData.total_revenue || 0)
                                        : formatCurrency(account.last_year_business_done || 0)}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">YTD Actual</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Revenue</span>
                                <p className="text-2xl font-bold text-slate-900">
                                    {financeData
                                        ? formatCurrency(financeData.target_revenue || 0)
                                        : formatCurrency(account.target_projection_2026_accounts || 0)}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">FY2026 Goal</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forecast Revenue</span>
                                <p className="text-2xl font-bold text-slate-900">
                                    {financeData
                                        ? formatCurrency(financeData.forecast_revenue || 0)
                                        : formatCurrency(account.current_pipeline_value || 0)}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">Q4 Proj.</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shortfall</span>
                                <p className="text-2xl font-bold text-red-600">
                                    {financeData
                                        ? formatCurrency(financeData.shortfall ?? ((financeData.target_revenue || 0) - (financeData.current_revenue || financeData.total_revenue || 0) - (financeData.forecast_revenue || 0)))
                                        : formatCurrency(Math.max(0, parseFloat((account.target_projection_2026_accounts || "0").toString().replace(/[$,]/g, '')) - parseFloat((account.last_year_business_done || "0").toString().replace(/[$,]/g, '')) - parseFloat((account.current_pipeline_value || "0").toString().replace(/[$,]/g, ''))))
                                    }
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">Risk High</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Revenue</span>
                                <p className="text-2xl font-bold text-blue-600">
                                    {financeData ? formatCurrency(financeData.ai_revenue) : "$0"}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">Direct/Assist</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Penetration</span>
                                <p className="text-2xl font-bold text-blue-600">
                                    {financeData ? `${(financeData.ai_penetration_pct || 0).toFixed(1)}%` : "0.0%"}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">+2.1% MoM</span>
                        </Card>
                        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects</span>
                                <p className="text-2xl font-bold text-slate-900">
                                    {financeData
                                        ? financeData.active_project_count + financeData.inactive_project_count
                                        : account.number_of_active_projects || 0}
                                </p>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-4">
                                {financeData
                                    ? `${financeData.active_project_count} Active / ${financeData.inactive_project_count} Inc.`
                                    : `${account.number_of_active_projects || 0} Active / 0 Inc.`}
                            </span>
                        </Card>
                    </div>
                ) : (
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="border-b border-slate-100 p-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <Target className="w-5 h-5 text-amber-600" />
                                Sales Overview
                                <Badge variant="outline" className="ml-2 text-[10px] bg-amber-50 text-amber-600 border-amber-200 uppercase font-bold">Sync Pending</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 text-center space-y-4">
                            <p className="text-sm text-muted-foreground">This account is not yet synced with the financial system. You can view basic sales data or initialize sync by adding a project.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Target (2026)</span>
                                    <p className="text-lg font-bold">{formatCurrency(account.target_projection_2026_accounts || 0)}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Last Year</span>
                                    <p className="text-lg font-bold">{formatCurrency(account.last_year_business_done || 0)}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Current Pipeline</span>
                                    <p className="text-lg font-bold">{formatCurrency(account.current_pipeline_value || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
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
                                                    <a href={account.account_research_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline truncate block text-sm font-semibold">
                                                        View Market Report ↗
                                                    </a>
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
                                                            {paginatedStakeholders.map((person, idx) => (
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
                                    {financeData?.ai_recommendations || "No AI recommendations available for this account."}
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
                                    {financeData?.customer_overview || "No customer overview available for this account."}
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
                        <AccountDocuments accountId={id} readOnly={true} />
                    </TabsContent>
                </Tabs>

                {/* Projects Section (at bottom, same as before but for this specific account) */}
                {financeData && (
                    <div className="pt-8 space-y-6 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                                Projects ({financeData.active_project_count} active / {financeData.inactive_project_count} inactive)
                            </h2>
                            <div className="flex items-center gap-3">
                                {filteredProjects.length > 10 && projectSearch === "" && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAllProjects(!showAllProjects)}
                                        className="h-10 px-4 font-semibold border-slate-200 text-blue-600 shadow-sm"
                                    >
                                        {showAllProjects ? "Show Top 10" : `View All Projects (${filteredProjects.length})`}
                                    </Button>
                                )}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={projectSearch}
                                        onChange={(e) => setProjectSearch(e.target.value)}
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
                                    onClick={() => navigate(`/financials/${financeData.id}/projects/${project.id}`, { state: { backUrl: `/accounts/${id}` } })}
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
                                                    <DropdownMenuItem onClick={() => navigate(`/financials/${financeData.id}/projects/${project.id}/edit`, { state: { backUrl: `/accounts/${id}` } })}>
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
                                                                            const updatedData = await getFinanceAccountById(financeData.id);
                                                                            setFinanceData(updatedData);
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
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Current Rev</span>
                                            <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(project.total_revenue)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">YTD Rev</span>
                                            <p className="text-sm font-bold text-blue-600 truncate">{formatCurrency(project.ytd_revenue)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">AI Rev</span>
                                            <p className="text-sm font-bold text-emerald-600 truncate">
                                                {formatCurrency((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0) || project.total_ai_revenue)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">AI Pen.</span>
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {((project.ai_penetration || project.ai_penetration_pct || (project.total_revenue > 0 ? (((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0)) / project.total_revenue) * 100 : 0)) || 0).toFixed(1)}%
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredProjects.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                                    No projects found for this account.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AccountDetails;
