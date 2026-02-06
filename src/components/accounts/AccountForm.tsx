import { useState } from 'react';
import { Account } from '@/types/account';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AccountFormProps {
    account?: Account;
    onSubmit: (account: Partial<Account>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function AccountForm({ account, onSubmit, onCancel, isLoading = false }: AccountFormProps) {
    const [formData, setFormData] = useState<Partial<Account>>({
        account_name: account?.account_name || '',
        account_leader: account?.account_leader || '',
        delivery_unit: account?.delivery_unit || '',
        industry: account?.industry || '',
        target_2026: account?.target_2026 || 0,
        current_revenue: account?.current_revenue || 0,
        forecast_revenue: account?.forecast_revenue || 0,
        ai_summary: account?.ai_summary || '',
        leadership_comments: account?.leadership_comments || '',
        // New Fields Initialization
        domain: account?.domain || '',
        company_revenue: account?.company_revenue || 0,
        customer_value_chain: account?.customer_value_chain || '',
        account_focus: account?.account_focus || 'Silver',
        delivery_owner: account?.delivery_owner || '',
        client_partner: account?.client_partner || '',
        value_chain_fit: account?.value_chain_fit || '',
        engagement_age: account?.engagement_age || '',
        last_year_business: account?.last_year_business || 0,
        target_projection_2026_accounts: account?.target_projection_2026_accounts || 0,
        target_projection_2026_delivery: account?.target_projection_2026_delivery || 0,
        current_pipeline_value: account?.current_pipeline_value || 0,
        revenue_attrition_risk: account?.revenue_attrition_risk || 'No',
        current_engagement_areas: account?.current_engagement_areas || '',
        team_size: account?.team_size || 0,
        engagement_models: account?.engagement_models || '',
        rate_card_health: account?.rate_card_health || 'At',
        active_projects_count: account?.active_projects_count || 0,
        overall_delivery_health: account?.overall_delivery_health || 'Green',
        current_nps: account?.current_nps || 0,
        champion_name: account?.champion_name || '',
        champion_profile: account?.champion_profile || '',
        decision_maker_connect: account?.decision_maker_connect || false,
        total_active_connects: account?.total_active_connects || 0,
        roadmap_visibility_2026: account?.roadmap_visibility_2026 || '',
        cross_sell_areas: account?.cross_sell_areas || '',
        executive_connect_frequency: account?.executive_connect_frequency || '',
        growth_action_plan_ready: account?.growth_action_plan_ready || false,
        miro_board_link: account?.miro_board_link || '',
        // Stakeholder & Strategy Fields
        executive_sponsor: account?.executive_sponsor || '',
        technical_decision_maker: account?.technical_decision_maker || '',
        influencer: account?.influencer || '',
        neutral_stakeholders: account?.neutral_stakeholders || '',
        negative_stakeholder: account?.negative_stakeholder || '',
        succession_risk: account?.succession_risk || '',
        key_competitors: account?.key_competitors || '',
        our_positioning: account?.our_positioning || '',
        incumbency_strength: account?.incumbency_strength || 'Low',
        areas_competition_stronger: account?.areas_competition_stronger || '',
        white_spaces_we_own: account?.white_spaces_we_own || '',
        account_review_cadence: account?.account_review_cadence || '',
        qbr_happening: account?.qbr_happening || 'No',
        technical_audit_frequency: account?.technical_audit_frequency || '',
    });

    const { toast } = useToast();
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculate shortfall whenever target or forecast changes
    const shortfall = (formData.target_2026 || 0) - (formData.forecast_revenue || 0);

    // Calculate account health score (forecast retention rate)
    const calculateHealthScore = () => {
        const current = formData.current_revenue || 0;
        const forecast = formData.forecast_revenue || 0;
        if (current === 0) return 0;
        return Math.min(100, Math.max(0, (forecast / current) * 100));
    };

    const healthScore = calculateHealthScore();

    const getHealthScoreColor = (score: number) => {
        if (score >= 70) return 'bg-green-100 text-green-700 border-green-300';
        if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.account_name?.trim()) newErrors.account_name = 'Account name is required';
        if (!formData.account_leader?.trim()) newErrors.account_leader = 'Account leader is required';
        if (!formData.delivery_unit) newErrors.delivery_unit = 'Delivery unit is required';

        if (!formData.target_2026 || formData.target_2026 <= 0) newErrors.target_2026 = 'Target 2026 must be > 0';

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
            shortfall,
            account_health_score: healthScore,
            updated_at: new Date().toISOString(),
        };

        if (!account) {
            submissionData.account_id = `acc-${Date.now()}`;
            submissionData.created_at = new Date().toISOString();
        }

        onSubmit(submissionData);
    };

    const handleNumberChange = (field: keyof Account, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        setFormData((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="relationships">Relationships</TabsTrigger>
                </TabsList>

                {/* GENERAL INFO */}
                <TabsContent value="general" className="space-y-4 py-4">
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_name">Account Name *</Label>
                                <Input id="account_name" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} className={errors.account_name ? 'border-destructive' : ''} />
                                {errors.account_name && <p className="text-xs text-destructive">{errors.account_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain</Label>
                                <Input id="domain" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. Healthcare, Finance" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account_focus">Account Focus</Label>
                                <Select value={formData.account_focus} onValueChange={(val: any) => setFormData({ ...formData, account_focus: val })}>
                                    <SelectTrigger><SelectValue placeholder="Focus Level" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Platinum">Platinum</SelectItem>
                                        <SelectItem value="Gold">Gold</SelectItem>
                                        <SelectItem value="Silver">Silver</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="engagement_age">Engagement Age (Jan 2026)</Label>
                                <Input id="engagement_age" value={formData.engagement_age} onChange={(e) => setFormData({ ...formData, engagement_age: e.target.value })} placeholder="e.g. 5 Years" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="miro_board_link">Miro Board Link</Label>
                                <Input id="miro_board_link" value={formData.miro_board_link} onChange={(e) => setFormData({ ...formData, miro_board_link: e.target.value })} placeholder="https://miro.com/..." />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FINANCIALS */}
                <TabsContent value="financials" className="space-y-4 py-4">
                    <Card>
                        <CardHeader><CardTitle>Financial Metrics</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_revenue">Company Revenue (USD)</Label>
                                <Input type="number" id="company_revenue" value={formData.company_revenue || ''} onChange={(e) => handleNumberChange('company_revenue', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_year_business">Last Year Business (USD jan-dec 25)</Label>
                                <Input type="number" id="last_year_business" value={formData.last_year_business || ''} onChange={(e) => handleNumberChange('last_year_business', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_2026">Target 2026 (Overall) *</Label>
                                <Input type="number" id="target_2026" value={formData.target_2026 || ''} onChange={(e) => handleNumberChange('target_2026', e.target.value)} className={errors.target_2026 ? 'border-destructive' : ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_accounts">Target Proj. 2026 (Accounts)</Label>
                                <Input type="number" id="target_projection_2026_accounts" value={formData.target_projection_2026_accounts || ''} onChange={(e) => handleNumberChange('target_projection_2026_accounts', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_delivery">Target Proj. 2026 (Delivery)</Label>
                                <Input type="number" id="target_projection_2026_delivery" value={formData.target_projection_2026_delivery || ''} onChange={(e) => handleNumberChange('target_projection_2026_delivery', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_revenue">Current Revenue *</Label>
                                <Input type="number" id="current_revenue" value={formData.current_revenue || ''} onChange={(e) => handleNumberChange('current_revenue', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="forecast_revenue">Forecast Revenue *</Label>
                                <Input type="number" id="forecast_revenue" value={formData.forecast_revenue || ''} onChange={(e) => handleNumberChange('forecast_revenue', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_pipeline_value">Current Pipeline Value (6-12m)</Label>
                                <Input type="number" id="current_pipeline_value" value={formData.current_pipeline_value || ''} onChange={(e) => handleNumberChange('current_pipeline_value', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 p-4 bg-muted rounded-lg flex justify-between items-center">
                                <div>
                                    <span className="text-sm font-medium">Auto-Calculated Shortfall</span>
                                    <p className="text-xl font-bold">{formatCurrency(shortfall)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium">Health Score</span>
                                    <Badge className={cn('text-base ml-2', getHealthScoreColor(healthScore))}>
                                        {healthScore.toFixed(1)}%
                                    </Badge>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="revenue_attrition_risk">Revenue Attrition / Leakage Possibility?</Label>
                                <Select value={formData.revenue_attrition_risk} onValueChange={(val: any) => setFormData({ ...formData, revenue_attrition_risk: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Risk Level" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="No">No Risk</SelectItem>
                                        <SelectItem value="Yes">Yes - Risk Exists</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DELIVERY & TEAM */}
                <TabsContent value="delivery" className="space-y-4 py-4">
                    <Card>
                        <CardHeader><CardTitle>Delivery & Operations</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="delivery_unit">Delivery Unit *</Label>
                                <Input id="delivery_unit" value={formData.delivery_unit} onChange={(e) => setFormData({ ...formData, delivery_unit: e.target.value })} className={errors.delivery_unit ? 'border-destructive' : ''} />
                                {errors.delivery_unit && <p className="text-xs text-destructive">{errors.delivery_unit}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="delivery_owner">Delivery Owner</Label>
                                <Input id="delivery_owner" value={formData.delivery_owner} onChange={(e) => setFormData({ ...formData, delivery_owner: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="team_size">Team Size</Label>
                                <Input type="number" id="team_size" value={formData.team_size || ''} onChange={(e) => handleNumberChange('team_size', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="overall_delivery_health">Overall Delivery Health</Label>
                                <Input id="overall_delivery_health" value={formData.overall_delivery_health} onChange={(e) => setFormData({ ...formData, overall_delivery_health: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate_card_health">Rate Card Health</Label>
                                <Select value={formData.rate_card_health} onValueChange={(val: any) => setFormData({ ...formData, rate_card_health: val })}>
                                    <SelectTrigger><SelectValue placeholder="Rate Health" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Above">Above</SelectItem>
                                        <SelectItem value="At">At</SelectItem>
                                        <SelectItem value="Below">Below</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="active_projects_count">Number of Active Projects</Label>
                                <Input type="number" id="active_projects_count" value={formData.active_projects_count || ''} onChange={(e) => handleNumberChange('active_projects_count', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="engagement_models">Engagement Model/s</Label>
                                <Input id="engagement_models" value={formData.engagement_models} onChange={(e) => setFormData({ ...formData, engagement_models: e.target.value })} placeholder="e.g. T&M, Fixed Price, Managed Services" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="current_engagement_areas">Current Engagement Areas</Label>
                                <Input id="current_engagement_areas" value={formData.current_engagement_areas} onChange={(e) => setFormData({ ...formData, current_engagement_areas: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STRATEGY & VALUE CHAIN */}
                <TabsContent value="strategy" className="space-y-4 py-4">
                    <Card>
                        <CardHeader><CardTitle>Strategy, Value Chain & Competition</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_value_chain">Do We Know Customer's Customer Value Chain?</Label>
                                    <Textarea id="customer_value_chain" value={formData.customer_value_chain} onChange={(e) => setFormData({ ...formData, customer_value_chain: e.target.value })} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value_chain_fit">Where We Fit in Customer Value Chain?</Label>
                                    <Textarea id="value_chain_fit" value={formData.value_chain_fit} onChange={(e) => setFormData({ ...formData, value_chain_fit: e.target.value })} rows={3} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="key_competitors">Key Competitors</Label>
                                    <Textarea id="key_competitors" value={formData.key_competitors} onChange={(e) => setFormData({ ...formData, key_competitors: e.target.value })} rows={3} placeholder="Competitor Names..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="our_positioning">Our Positioning vs Competition</Label>
                                    <Textarea id="our_positioning" value={formData.our_positioning} onChange={(e) => setFormData({ ...formData, our_positioning: e.target.value })} rows={3} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="incumbency_strength">Incumbency Strength</Label>
                                    <Select value={formData.incumbency_strength} onValueChange={(val: any) => setFormData({ ...formData, incumbency_strength: val })}>
                                        <SelectTrigger><SelectValue placeholder="Strength" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="areas_competition_stronger">Areas where Competition is Stronger</Label>
                                    <Input id="areas_competition_stronger" value={formData.areas_competition_stronger} onChange={(e) => setFormData({ ...formData, areas_competition_stronger: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="white_spaces_we_own">White Spaces We Own</Label>
                                <Input id="white_spaces_we_own" value={formData.white_spaces_we_own} onChange={(e) => setFormData({ ...formData, white_spaces_we_own: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="account_review_cadence">Account Review Cadence</Label>
                                    <Input id="account_review_cadence" value={formData.account_review_cadence} onChange={(e) => setFormData({ ...formData, account_review_cadence: e.target.value })} placeholder="e.g. Weekly" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="qbr_happening">QBR Happening?</Label>
                                    <Select value={formData.qbr_happening} onValueChange={(val: any) => setFormData({ ...formData, qbr_happening: val })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="technical_audit_frequency">Technical Audit Frequency</Label>
                                    <Input id="technical_audit_frequency" value={formData.technical_audit_frequency} onChange={(e) => setFormData({ ...formData, technical_audit_frequency: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cross_sell_areas">Identified Areas for Cross Selling / Up Selling</Label>
                                <Textarea id="cross_sell_areas" value={formData.cross_sell_areas} onChange={(e) => setFormData({ ...formData, cross_sell_areas: e.target.value })} rows={2} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roadmap_visibility_2026">Visibility of the Client Roadmap for 2026</Label>
                                <Textarea id="roadmap_visibility_2026" value={formData.roadmap_visibility_2026} onChange={(e) => setFormData({ ...formData, roadmap_visibility_2026: e.target.value })} rows={2} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="growth_action_plan_ready" checked={formData.growth_action_plan_ready} onChange={(e) => setFormData({ ...formData, growth_action_plan_ready: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                                <Label htmlFor="growth_action_plan_ready">30 Days Growth Action Plan Ready?</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ai_summary">AI Summary</Label>
                                <Textarea id="ai_summary" value={formData.ai_summary} onChange={(e) => setFormData({ ...formData, ai_summary: e.target.value })} rows={3} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* RELATIONSHIPS */}
                <TabsContent value="relationships" className="space-y-4 py-4">
                    <Card>
                        <CardHeader><CardTitle>Stakeholders & Relationships</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_leader">Account Leader *</Label>
                                <Input id="account_leader" value={formData.account_leader} onChange={(e) => setFormData({ ...formData, account_leader: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_partner">Client Partner</Label>
                                <Input id="client_partner" value={formData.client_partner} onChange={(e) => setFormData({ ...formData, client_partner: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="champion_name">Champion @ Customer side</Label>
                                <Input id="champion_name" value={formData.champion_name} onChange={(e) => setFormData({ ...formData, champion_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="champion_profile">Champion Profile</Label>
                                <Input id="champion_profile" value={formData.champion_profile} onChange={(e) => setFormData({ ...formData, champion_profile: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="executive_connect_frequency">Nitor Executive Connect Frequency (CEO/VP)</Label>
                                <Input id="executive_connect_frequency" value={formData.executive_connect_frequency} onChange={(e) => setFormData({ ...formData, executive_connect_frequency: e.target.value })} placeholder="e.g. Monthly, Quarterly" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_nps">Current NPS</Label>
                                <Input type="number" id="current_nps" value={formData.current_nps || ''} onChange={(e) => handleNumberChange('current_nps', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_active_connects">Total Active Connects from Account</Label>
                                <Input type="number" id="total_active_connects" value={formData.total_active_connects || ''} onChange={(e) => handleNumberChange('total_active_connects', e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input type="checkbox" id="decision_maker_connect" checked={formData.decision_maker_connect} onChange={(e) => setFormData({ ...formData, decision_maker_connect: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                                <Label htmlFor="decision_maker_connect">Connect with Decision Maker Established?</Label>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="leadership_comments">Leadership Comments</Label>
                                <Textarea id="leadership_comments" value={formData.leadership_comments} onChange={(e) => setFormData({ ...formData, leadership_comments: e.target.value })} rows={3} />
                            </div>

                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <h3 className="font-semibold mb-4">Strategic Stakeholders</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="executive_sponsor">Executive Sponsor</Label>
                                        <Input id="executive_sponsor" value={formData.executive_sponsor} onChange={(e) => setFormData({ ...formData, executive_sponsor: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="technical_decision_maker">Technical Decision Maker</Label>
                                        <Input id="technical_decision_maker" value={formData.technical_decision_maker} onChange={(e) => setFormData({ ...formData, technical_decision_maker: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="influencer">Influencers</Label>
                                        <Textarea id="influencer" value={formData.influencer} onChange={(e) => setFormData({ ...formData, influencer: e.target.value })} rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="neutral_stakeholders">Neutral Stakeholders</Label>
                                        <Textarea id="neutral_stakeholders" value={formData.neutral_stakeholders} onChange={(e) => setFormData({ ...formData, neutral_stakeholders: e.target.value })} rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="negative_stakeholder">Negative Stakeholder</Label>
                                        <Input id="negative_stakeholder" value={formData.negative_stakeholder} onChange={(e) => setFormData({ ...formData, negative_stakeholder: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="succession_risk">Succession Risk (Champion leaving?)</Label>
                                        <Input id="succession_risk" value={formData.succession_risk} onChange={(e) => setFormData({ ...formData, succession_risk: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
                </Button>
            </div>
        </form>
    );
}
