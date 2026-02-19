import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAccounts } from '@/contexts/AccountContext';
import {
    ArrowLeft,
    Pencil,
    Activity,
    Building2,
    Target,
    Users,
    Award,
    ShieldAlert,
    Swords
} from 'lucide-react';
import {
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenu,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { StrategicStakeholderProfile } from '@/types/account';

const AccountDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getAccountById, fetchAccount } = useAccounts();
    const [stakeholders, setStakeholders] = useState<StrategicStakeholderProfile[]>([]);

    useEffect(() => {
        if (id) {
            fetchAccount(id);
        }
    }, [id, fetchAccount]);

    useEffect(() => {
        const fetchStakeholders = async () => {
            if (id) {
                try {
                    const data = await api.getStakeholderDetailsByAccount(id);
                    // Map API response to frontend model
                    const mappedProfiles: StrategicStakeholderProfile[] = data.map((apiDetails: any) => ({
                        id: apiDetails.id,
                        account_id: apiDetails.account_id,
                        account_name: apiDetails.account_name,
                        executive_sponsor: apiDetails.executive_sponsor || '',
                        technical_decision_maker: apiDetails.technical_decision_maker || '',
                        influencer: apiDetails.influencers || '',
                        neutral_stakeholders: apiDetails.neutral_stakeholders || '',
                        negative_stakeholder: apiDetails.negative_stakeholder || '',
                        succession_risk: apiDetails.succession_risk || '',
                        key_competitors: apiDetails.key_competitors || '',
                        our_positioning: apiDetails.our_positioning_vs_competition || '',
                        incumbency_strength: apiDetails.incumbency_strength as any,
                        areas_competition_stronger: apiDetails.areas_competition_stronger || '',
                        white_spaces_we_own: apiDetails.white_spaces_we_own || '',
                        account_review_cadence: apiDetails.account_review_cadence_frequency || '',
                        qbr_happening: apiDetails.qbr_happening ? 'Yes' : 'No',
                        technical_audit_frequency: apiDetails.technical_audit_frequency || '',
                        created_at: apiDetails.created_at,
                        updated_at: apiDetails.updated_at
                    }));
                    setStakeholders(mappedProfiles);
                } catch (error) {
                    console.error("Failed to fetch stakeholders for export", error);
                }
            }
        };
        fetchStakeholders();
    }, [id]);

    const account = getAccountById(id || '');

    if (!account) {
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





    const getHealthScoreColor = (score: number) => {
        if (score >= 70) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };





    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => navigate('/accounts')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Accounts
                </Button>

                {/* Account Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground">{account.account_name}</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {/* Leader removed */}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate(`/accounts/${account.account_id}/edit`)} className="gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Account
                        </Button>

                    </div>
                </div>

                {/* Account Info Tabs */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full gap-4">
                        <TabsTrigger value="general" className="tab-blue">General</TabsTrigger>
                        <TabsTrigger value="financials" className="tab-green">Financials</TabsTrigger>
                        <TabsTrigger value="delivery" className="tab-orange">Delivery</TabsTrigger>
                        <TabsTrigger value="strategy" className="tab-purple">Strategy & Relationships</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-6 space-y-6">
                        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100">
                                <CardTitle className="flex items-center gap-2 text-blue-950">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6">
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</span>
                                    <p className="font-medium text-base text-foreground bg-slate-50 p-2 rounded-md border border-slate-100">{account.domain || '-'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Focus</span>
                                    <p className="font-medium text-base text-foreground bg-slate-50 p-2 rounded-md border border-slate-100">{account.account_focus || '-'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Engagement Age</span>
                                    <p className="font-medium text-base text-foreground bg-slate-50 p-2 rounded-md border border-slate-100">{account.engagement_age || '-'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Research Link</span>
                                    <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                                        <a href={account.account_research_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline truncate block font-medium">
                                            {account.account_research_link || '-'}
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financials" className="mt-6">
                        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100">
                                <CardTitle className="flex items-center gap-2 text-emerald-950">
                                    <Target className="w-5 h-5 text-emerald-600" />
                                    Financial Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                                    <span className="text-xs font-medium text-emerald-700/80 uppercase tracking-wider">Company Revenue</span>
                                    <p className="text-xl font-bold text-emerald-900">{account.company_revenue || '-'}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                                    <span className="text-xs font-medium text-emerald-700/80 uppercase tracking-wider">Last Year Business</span>
                                    <p className="text-xl font-bold text-emerald-900">{account.last_year_business_done || '-'}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                                    <span className="text-xs font-medium text-emerald-700/80 uppercase tracking-wider">Current Pipeline</span>
                                    <p className="text-xl font-bold text-emerald-900">{account.current_pipeline_value || '-'}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target 2026 (Accounts)</span>
                                    <p className="text-lg font-semibold text-foreground">{account.target_projection_2026_accounts || '-'}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target 2026 (Delivery)</span>
                                    <p className="text-lg font-semibold text-foreground">{account.target_projection_2026_delivery || '-'}</p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue Attrition Risk</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            account.revenue_attrition_possibility === 'Yes'
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        )}>
                                            {account.revenue_attrition_possibility || 'No'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                        <Card className="border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100">
                                <CardTitle className="flex items-center gap-2 text-amber-950">
                                    <Activity className="w-5 h-5 text-amber-600" />
                                    Delivery & Operations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery Owner</span>
                                    <p className="font-medium text-lg text-foreground">{account.delivery_owner || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Team Size</span>
                                        <p className="text-2xl font-bold text-slate-800">{account.team_size || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Active Projects</span>
                                        <p className="text-2xl font-bold text-slate-800">{account.number_of_active_projects || '-'}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Health</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "mt-1 border",
                                            account.overall_delivery_health === 'Green' ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" :
                                                account.overall_delivery_health === 'Red' ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" :
                                                    account.overall_delivery_health === 'Amber' ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100" :
                                                        "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"
                                        )}
                                    >
                                        {account.overall_delivery_health || '-'}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate Card Health</span>
                                    <p className="font-medium">{account.current_rate_card_health || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Engagement Model</span>
                                    <p className="font-medium bg-slate-50 p-2 rounded border border-slate-100 inline-block">{account.engagement_models || '-'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Engagement Areas</span>
                                    <p className="font-medium bg-slate-50 p-3 rounded-md border border-slate-100 text-sm leading-relaxed">{account.current_engagement_areas || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-6 space-y-6">
                        <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
                                <CardTitle className="flex items-center gap-2 text-indigo-950">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    Strategy & Growth
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-indigo-50/30 p-4 rounded-lg border border-indigo-100/50">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800 block mb-2">Customer Value Chain Known?</span>
                                        <Badge variant={account.know_customer_value_chain ? 'default' : 'secondary'} className="bg-indigo-600 hover:bg-indigo-700">
                                            {account.know_customer_value_chain ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Value Chain Fit</span>
                                        <p className="text-sm text-foreground">{account.where_we_fit_in_value_chain || 'Not detailed.'}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><span className="text-sm font-semibold block mb-1 text-muted-foreground">Cross-Sell Areas</span><p className="text-sm text-foreground font-medium">{account.identified_areas_cross_up_selling || 'None identified.'}</p></div>
                                        <div><span className="text-sm font-semibold block mb-1 text-muted-foreground">Roadmap Visibility (2026)</span><p className="text-sm text-foreground font-medium">{account.visibility_client_roadmap_2026 || 'No visibility.'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100 inline-flex">
                                        <span className="text-sm font-semibold text-yellow-800">30 Days Growth Action Plan Ready?</span>
                                        <Badge variant={account.growth_action_plan_30days_ready ? 'default' : 'outline'} className={account.growth_action_plan_30days_ready ? "bg-green-600" : "text-yellow-700 border-yellow-300"}>
                                            {account.growth_action_plan_30days_ready ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-t-4 border-t-violet-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-violet-50/50 to-transparent border-b border-violet-100">
                                <CardTitle className="flex items-center gap-2 text-violet-950">
                                    <Users className="w-5 h-5 text-violet-600" />
                                    Relationships
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                {/* Removed: Account Leader */}
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Client Partner</span><p className="font-medium text-lg">{account.client_partner || '-'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Champion</span><p className="font-medium text-lg">{account.champion_customer_side || '-'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Champion Profile</span><p className="font-medium">{account.champion_profile || '-'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exec Connect Frequency</span><p className="font-medium">{account.nitor_executive_connect_frequency || '-'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">NPS</span><p className="font-bold text-3xl text-violet-600">{account.current_nps || '-'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Decision Maker Connect</span><p className="font-medium">{account.connect_with_decision_maker ? 'Yes' : 'No'}</p></div>
                                <div className="space-y-1"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Active Connects</span><p className="font-medium text-lg">{account.total_active_connects || '-'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout >
    );
};

export default AccountDetails;
