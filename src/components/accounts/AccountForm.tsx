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
import { Building2, DollarSign, Briefcase, Target, Users } from 'lucide-react';

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
        company_revenue: account?.company_revenue || 0,
        know_customer_value_chain: account?.know_customer_value_chain || false,
        account_focus: account?.account_focus || 'Silver',
        delivery_owner: account?.delivery_owner || '',
        client_partner: account?.client_partner || '',
        where_we_fit_in_value_chain: account?.where_we_fit_in_value_chain || '',
        engagement_age: account?.engagement_age || 0,
        last_year_business_done: account?.last_year_business_done || 0,
        target_projection_2026_accounts: account?.target_projection_2026_accounts || 0,
        target_projection_2026_delivery: account?.target_projection_2026_delivery || 0,
        current_pipeline_value: account?.current_pipeline_value || 0,
        revenue_attrition_possibility: account?.revenue_attrition_possibility || '',
        current_engagement_areas: account?.current_engagement_areas || '',
        team_size: account?.team_size || 0,
        engagement_models: account?.engagement_models || '',
        current_rate_card_health: account?.current_rate_card_health || 'At',
        number_of_active_projects: account?.number_of_active_projects || 0,
        overall_delivery_health: account?.overall_delivery_health || '',
        current_nps: account?.current_nps || 0,
        champion_customer_side: account?.champion_customer_side || '',
        champion_profile: account?.champion_profile || '',
        connect_with_decision_maker: account?.connect_with_decision_maker || false,
        total_active_connects: account?.total_active_connects || 0,
        visibility_client_roadmap_2026: account?.visibility_client_roadmap_2026 || '',
        identified_areas_cross_up_selling: account?.identified_areas_cross_up_selling || '',
        nitor_executive_connect_frequency: account?.nitor_executive_connect_frequency || '',
        growth_action_plan_30days_ready: account?.growth_action_plan_30days_ready || false,
        account_research_link: account?.account_research_link || '',
    });

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
            // Removed: shortfall, account_health_score
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
                <TabsList className="grid grid-cols-4 w-full gap-4">
                    <TabsTrigger value="general" className="tab-blue">General</TabsTrigger>
                    <TabsTrigger value="financials" className="tab-green">Financials</TabsTrigger>
                    <TabsTrigger value="delivery" className="tab-orange">Delivery</TabsTrigger>
                    <TabsTrigger value="strategy" className="tab-purple">Strategy & Relationships</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 py-4">
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-blue-950">Basic Information</CardTitle>
                            </div>
                        </CardHeader>
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
                                <Input type="number" id="engagement_age" value={formData.engagement_age || ''} onChange={(e) => handleNumberChange('engagement_age', e.target.value)} placeholder="e.g. 5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_research_link">Account Research Link</Label>
                                <Input id="account_research_link" value={formData.account_research_link} onChange={(e) => setFormData({ ...formData, account_research_link: e.target.value })} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FINANCIALS */}
                <TabsContent value="financials" className="space-y-4 py-4">
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-blue-950">Financial Metrics</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company_revenue">Company Revenue (USD)</Label>
                                <Input type="number" id="company_revenue" value={formData.company_revenue || ''} onChange={(e) => handleNumberChange('company_revenue', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_year_business_done">Last Year Business Done (USD Jan 25-Dec 25)</Label>
                                <Input type="number" id="last_year_business_done" value={formData.last_year_business_done || ''} onChange={(e) => handleNumberChange('last_year_business_done', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_accounts">Target Projection 2026 (Accounts Team)</Label>
                                <Input type="number" id="target_projection_2026_accounts" value={formData.target_projection_2026_accounts || ''} onChange={(e) => handleNumberChange('target_projection_2026_accounts', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_delivery">Target Projection 2026 (Delivery)</Label>
                                <Input type="number" id="target_projection_2026_delivery" value={formData.target_projection_2026_delivery || ''} onChange={(e) => handleNumberChange('target_projection_2026_delivery', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_pipeline_value">Current Pipeline Value (Next 6-12 Months)</Label>
                                <Input type="number" id="current_pipeline_value" value={formData.current_pipeline_value || ''} onChange={(e) => handleNumberChange('current_pipeline_value', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="revenue_attrition_possibility">Any Revenue Attrition / Leakage Possibility?</Label>
                                <Input id="revenue_attrition_possibility" value={formData.revenue_attrition_possibility} onChange={(e) => setFormData({ ...formData, revenue_attrition_possibility: e.target.value })} placeholder="Yes/No or details" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DELIVERY & TEAM */}
                <TabsContent value="delivery" className="space-y-4 py-4">
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-blue-950">Delivery & Operations</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="current_rate_card_health">Rate Card Health</Label>
                                <Select value={formData.current_rate_card_health} onValueChange={(val: any) => setFormData({ ...formData, current_rate_card_health: val })}>
                                    <SelectTrigger><SelectValue placeholder="Rate Health" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Above">Above</SelectItem>
                                        <SelectItem value="At">At</SelectItem>
                                        <SelectItem value="Below">Below</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number_of_active_projects">Number of Active Projects Running</Label>
                                <Input type="number" id="number_of_active_projects" value={formData.number_of_active_projects || ''} onChange={(e) => handleNumberChange('number_of_active_projects', e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="engagement_models">Engagement Model/s</Label>
                                <Input id="engagement_models" value={formData.engagement_models} onChange={(e) => setFormData({ ...formData, engagement_models: e.target.value })} placeholder="e.g. T&M, Fixed Price, Managed Services" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="current_engagement_areas">Current Engagement Areas</Label>
                                <Textarea id="current_engagement_areas" value={formData.current_engagement_areas} onChange={(e) => setFormData({ ...formData, current_engagement_areas: e.target.value })} rows={2} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STRATEGY & RELATIONSHIPS */}
                <TabsContent value="strategy" className="space-y-4 py-4">
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-blue-950">Strategy & Value Chain</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="know_customer_value_chain">Do We Know Customer's Customer Value Chain?</Label>
                                    <Select
                                        value={formData.know_customer_value_chain ? "yes" : "no"}
                                        onValueChange={(val) => setFormData({ ...formData, know_customer_value_chain: val === "yes" })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="where_we_fit_in_value_chain">Where We Fit in Customer Value Chain?</Label>
                                    <Textarea id="where_we_fit_in_value_chain" value={formData.where_we_fit_in_value_chain} onChange={(e) => setFormData({ ...formData, where_we_fit_in_value_chain: e.target.value })} rows={3} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visibility_client_roadmap_2026">Visibility of the Client Roadmap for 2026</Label>
                                <Textarea id="visibility_client_roadmap_2026" value={formData.visibility_client_roadmap_2026} onChange={(e) => setFormData({ ...formData, visibility_client_roadmap_2026: e.target.value })} rows={2} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="identified_areas_cross_up_selling">Identified Areas for Cross Selling / Up Selling</Label>
                                <Textarea id="identified_areas_cross_up_selling" value={formData.identified_areas_cross_up_selling} onChange={(e) => setFormData({ ...formData, identified_areas_cross_up_selling: e.target.value })} rows={2} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="growth_action_plan_30days_ready" checked={formData.growth_action_plan_30days_ready} onChange={(e) => setFormData({ ...formData, growth_action_plan_30days_ready: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                                <Label htmlFor="growth_action_plan_30days_ready">30 Days Growth Action Plan Ready?</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-transparent border-b border-blue-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-blue-950">Relationships</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="client_partner">Client Partner</Label>
                                <Input id="client_partner" value={formData.client_partner} onChange={(e) => setFormData({ ...formData, client_partner: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="champion_customer_side">Champion @ Customer side</Label>
                                <Input id="champion_customer_side" value={formData.champion_customer_side} onChange={(e) => setFormData({ ...formData, champion_customer_side: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="champion_profile">Champion Profile</Label>
                                <Input id="champion_profile" value={formData.champion_profile} onChange={(e) => setFormData({ ...formData, champion_profile: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nitor_executive_connect_frequency">Nitor Executive Connect Frequency (CEO/VP)</Label>
                                <Input id="nitor_executive_connect_frequency" value={formData.nitor_executive_connect_frequency} onChange={(e) => setFormData({ ...formData, nitor_executive_connect_frequency: e.target.value })} placeholder="e.g. Monthly, Quarterly" />
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
                                <input type="checkbox" id="connect_with_decision_maker" checked={formData.connect_with_decision_maker} onChange={(e) => setFormData({ ...formData, connect_with_decision_maker: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                                <Label htmlFor="connect_with_decision_maker">Connect with Decision Maker (Yes/No)</Label>
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
