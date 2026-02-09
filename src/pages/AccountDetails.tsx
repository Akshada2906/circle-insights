import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/contexts/AccountContext';
import {
    ArrowLeft,
    Pencil,
    Activity,
    Building2,
    Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AccountDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getAccountById, fetchAccount } = useAccounts();

    useEffect(() => {
        if (id) {
            fetchAccount(id);
        }
    }, [id, fetchAccount]);

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



    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

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
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                        <TabsTrigger value="delivery">Delivery</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy & Relationships</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Domain</span><p className="font-medium">{account.domain || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Account Focus</span><p className="font-medium">{account.account_focus || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Engagement Age</span><p className="font-medium">{account.engagement_age || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Miro Board</span><a href={account.miro_board_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block">{account.miro_board_link || '-'}</a></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financials" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Financial Metrics</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Company Revenue</span><p className="text-lg font-medium">{formatCurrency(account.company_revenue || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Last Year Business</span><p className="text-lg font-medium">{formatCurrency(account.last_year_business_done || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Current Pipeline</span><p className="text-lg font-medium">{formatCurrency(account.current_pipeline_value || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Target Projection 2026 (Accounts)</span><p className="text-lg font-medium">{formatCurrency(account.target_projection_2026_accounts || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Target Projection 2026 (Delivery)</span><p className="text-lg font-medium">{formatCurrency(account.target_projection_2026_delivery || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Revenue Attrition Risk</span><p className="font-medium">{account.revenue_attrition_possibility || 'No'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Delivery & Operations</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Delivery Unit</span><p className="font-medium">{account.delivery_unit || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Delivery Owner</span><p className="font-medium">{account.delivery_owner || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Team Size</span><p className="font-medium">{account.team_size || 0}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Overall Health</span><p className="font-medium">{account.overall_delivery_health || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Rate Card Health</span><p className="font-medium">{account.current_rate_card_health || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Active Projects</span><p className="font-medium">{account.number_of_active_projects || 0}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Engagement Model</span><p className="font-medium">{account.engagement_models || '-'}</p></div>
                                <div className="space-y-1 md:col-span-2"><span className="text-sm text-muted-foreground">Current Engagement Areas</span><p className="font-medium">{account.current_engagement_areas || '-'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Strategy & Growth</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><span className="text-sm font-semibold block mb-1">Customer Value Chain Known?</span><p className="text-sm text-muted-foreground">{account.know_customer_value_chain ? 'Yes' : 'No'}</p></div>
                                    <div><span className="text-sm font-semibold block mb-1">Value Chain Fit</span><p className="text-sm text-muted-foreground">{account.where_we_fit_in_value_chain || 'Not detailed.'}</p></div>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><span className="text-sm font-semibold block mb-1">Cross-Sell Areas</span><p className="text-sm text-muted-foreground">{account.identified_areas_cross_up_selling || 'None identified.'}</p></div>
                                        <div><span className="text-sm font-semibold block mb-1">Roadmap Visibility (2026)</span><p className="text-sm text-muted-foreground">{account.visibility_client_roadmap_2026 || 'No visibility.'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className="text-sm font-semibold">30 Days Growth Action Plan Ready?</span>
                                        <Badge variant={account.growth_action_plan_30days_ready ? 'default' : 'secondary'}>{account.growth_action_plan_30days_ready ? 'Yes' : 'No'}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Stakeholders & Relationships</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Removed: Account Leader */}
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Client Partner</span><p className="font-medium">{account.client_partner || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Champion</span><p className="font-medium">{account.champion_customer_side || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Champion Profile</span><p className="font-medium">{account.champion_profile || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Exec Connect Frequency</span><p className="font-medium">{account.nitor_executive_connect_frequency || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">NPS</span><p className="font-bold text-lg">{account.current_nps || 0}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Decision Maker Connect</span><p className="font-medium">{account.connect_with_decision_maker ? 'Yes' : 'No'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Total Active Connects</span><p className="font-medium">{account.total_active_connects || 0}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout >
    );
};

export default AccountDetails;
