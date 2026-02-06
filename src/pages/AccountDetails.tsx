import { useState } from 'react';
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
    const { getAccountById } = useAccounts();

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
                            Leader: {account.account_leader}
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
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
                        <TabsTrigger value="delivery">Delivery</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy</TabsTrigger>
                        <TabsTrigger value="relationships">Relationships</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Delivery Unit</p>
                                            <p className="text-lg font-semibold text-foreground">{account.delivery_unit}</p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-lg"><Target className="w-6 h-6 text-green-600" /></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                                            <p className="text-2xl font-bold text-foreground">{account.account_health_score.toFixed(1)}%</p>
                                        </div>
                                        <div className="p-3 bg-purple-100 rounded-lg"><Activity className="w-6 h-6 text-purple-600" /></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
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
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Last Year Business</span><p className="text-lg font-medium">{formatCurrency(account.last_year_business || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Target 2026</span><p className="text-lg font-medium">{formatCurrency(account.target_2026 || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Current Revenue</span><p className="text-lg font-medium">{formatCurrency(account.current_revenue || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Forecast Revenue</span><p className="text-lg font-medium">{formatCurrency(account.forecast_revenue || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Current Pipeline</span><p className="text-lg font-medium">{formatCurrency(account.current_pipeline_value || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Shorfall</span><p className="text-lg font-medium text-red-500">{formatCurrency(account.shortfall || 0)}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Revenue Attrition Risk</span><p className="font-medium">{account.revenue_attrition_risk || 'No'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Delivery & Operations</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Delivery Owner</span><p className="font-medium">{account.delivery_owner || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Team Size</span><p className="font-medium">{account.team_size || 0}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Overall Health</span><p className="font-medium">{account.overall_delivery_health || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Rate Card Health</span><p className="font-medium">{account.rate_card_health || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Engagement Model</span><p className="font-medium">{account.engagement_models || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Current Engagement Areas</span><p className="font-medium">{account.current_engagement_areas || '-'}</p></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Strategy & Growth</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><span className="text-sm font-semibold block mb-1">Customer Value Chain</span><p className="text-sm text-muted-foreground">{account.customer_value_chain || 'Not detailed.'}</p></div>
                                    <div><span className="text-sm font-semibold block mb-1">Value Chain Fit</span><p className="text-sm text-muted-foreground">{account.value_chain_fit || 'Not detailed.'}</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><span className="text-sm font-semibold block mb-1">Key Competitors</span><p className="text-sm text-muted-foreground whitespace-pre-line">{account.key_competitors || 'None identified.'}</p></div>
                                    <div><span className="text-sm font-semibold block mb-1">Our Positioning</span><p className="text-sm text-muted-foreground whitespace-pre-line">{account.our_positioning || 'Not detailed.'}</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><span className="text-sm font-semibold block mb-1">Incumbency Strength</span><Badge variant={account.incumbency_strength === 'High' ? 'default' : 'secondary'}>{account.incumbency_strength || 'Low'}</Badge></div>
                                    <div><span className="text-sm font-semibold block mb-1">Areas Competition Stronger</span><p className="text-sm text-muted-foreground">{account.areas_competition_stronger || 'None.'}</p></div>
                                </div>
                                <div><span className="text-sm font-semibold block mb-1">White Spaces We Own</span><p className="text-sm text-muted-foreground">{account.white_spaces_we_own || 'None.'}</p></div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                                    <div><span className="text-sm font-semibold block mb-1">Review Cadence</span><p className="text-sm text-muted-foreground">{account.account_review_cadence || '-'}</p></div>
                                    <div><span className="text-sm font-semibold block mb-1">QBR Happening?</span><p className="text-sm text-muted-foreground">{account.qbr_happening || 'No'}</p></div>
                                    <div><span className="text-sm font-semibold block mb-1">Tech Audit Freq</span><p className="text-sm text-muted-foreground">{account.technical_audit_frequency || '-'}</p></div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><span className="text-sm font-semibold block mb-1">Cross-Sell Areas</span><p className="text-sm text-muted-foreground">{account.cross_sell_areas || 'None identified.'}</p></div>
                                        <div><span className="text-sm font-semibold block mb-1">Roadmap Visibility (2026)</span><p className="text-sm text-muted-foreground">{account.roadmap_visibility_2026 || 'No visibility.'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className="text-sm font-semibold">30 Days Growth Action Plan Ready?</span>
                                        <Badge variant={account.growth_action_plan_ready ? 'default' : 'secondary'}>{account.growth_action_plan_ready ? 'Yes' : 'No'}</Badge>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-md mt-4">
                                        <span className="text-sm font-semibold block mb-1">AI Summary</span>
                                        <p className="text-sm text-muted-foreground">{account.ai_summary || 'No AI summary available.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="relationships" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Stakeholders & Relationships</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Account Leader</span><p className="font-medium">{account.account_leader || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Client Partner</span><p className="font-medium">{account.client_partner || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Champion</span><p className="font-medium">{account.champion_name || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Champion Profile</span><p className="font-medium">{account.champion_profile || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Exec Connect Frequency</span><p className="font-medium">{account.executive_connect_frequency || '-'}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">NPS</span><p className="font-bold text-lg">{account.current_nps || 0}</p></div>
                                <div className="space-y-1"><span className="text-sm text-muted-foreground">Decision Maker Connect</span><p className="font-medium">{account.decision_maker_connect ? 'Yes' : 'No'}</p></div>
                                <div className="col-span-1 md:col-span-2 mt-4 bg-muted/50 p-4 rounded-md">
                                    <span className="text-sm font-semibold block mb-1">Leadership Comments</span>
                                    <p className="text-sm text-muted-foreground">{account.leadership_comments || 'No comments.'}</p>
                                </div>

                                <div className="col-span-1 md:col-span-2 mt-6 pt-6 border-t">
                                    <h3 className="font-semibold text-lg mb-4">Strategic Stakeholder Landscape</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1"><span className="text-sm text-muted-foreground">Executive Sponsor</span><p className="font-medium">{account.executive_sponsor || '-'}</p></div>
                                        <div className="space-y-1"><span className="text-sm text-muted-foreground">Tech Decision Maker</span><p className="font-medium">{account.technical_decision_maker || '-'}</p></div>
                                        <div className="space-y-1"><span className="text-sm text-muted-foreground">Influencers</span><p className="font-medium whitespace-pre-line">{account.influencer || 'None identified.'}</p></div>
                                        <div className="space-y-1"><span className="text-sm text-muted-foreground">Neutral Stakeholders</span><p className="font-medium whitespace-pre-line">{account.neutral_stakeholders || 'None identified.'}</p></div>
                                        <div className="space-y-1"><span className="text-sm text-muted-foreground">Negative Stakeholders</span><p className="font-medium text-red-600">{account.negative_stakeholder || 'None.'}</p></div>
                                        <div className="space-y-1 bg-red-50 p-2 rounded"><span className="text-sm text-muted-foreground text-red-700">Succession Risk</span><p className="font-medium text-red-800">{account.succession_risk || 'None identified.'}</p></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout >
    );
};

export default AccountDetails;
