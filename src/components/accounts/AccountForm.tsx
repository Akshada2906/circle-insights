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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Building2, DollarSign, Briefcase, Target, Users, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

        // Stakeholders Profile fields
        stakeholder_profile_id: account?.stakeholder_profile_id || '',
    });

    const [profiles, setProfiles] = useState<StrategicStakeholderProfile[]>(
        account?.strategic_profiles && account.strategic_profiles.length > 0
            ? account.strategic_profiles
            : []
    );

    // Sync profiles if account data loads after initial mount
    useEffect(() => {
        if (account?.strategic_profiles) {
            setProfiles(account.strategic_profiles);
        }
    }, [account?.strategic_profiles]);

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



    const TABS = ['general', 'financials', 'delivery', 'strategy', 'stakeholders', 'competition', 'readiness'];
    const [activeTab, setActiveTab] = useState('general');

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-7 w-full gap-2 h-auto">
                    <TabsTrigger value="general" className="tab-blue h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 0 > currentTabIndex}>General</TabsTrigger>
                    <TabsTrigger value="financials" className="tab-green h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 1 > currentTabIndex}>Financials</TabsTrigger>
                    <TabsTrigger value="delivery" className="tab-orange h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 2 > currentTabIndex}>Delivery</TabsTrigger>
                    <TabsTrigger value="strategy" className="tab-purple h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 3 > currentTabIndex}>Strategy</TabsTrigger>
                    <TabsTrigger value="stakeholders" className="tab-indigo h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 4 > currentTabIndex}>Stakeholders</TabsTrigger>
                    <TabsTrigger value="competition" className="tab-rose h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 5 > currentTabIndex}>Competition</TabsTrigger>
                    <TabsTrigger value="readiness" className="tab-emerald h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight" disabled={!account && 6 > currentTabIndex}>Readiness</TabsTrigger>
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
                                <Input id="engagement_age" value={formData.engagement_age || ''} onChange={(e) => setFormData({ ...formData, engagement_age: e.target.value })} placeholder="e.g. 5" />
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
                                <Input id="company_revenue" value={formData.company_revenue || ''} onChange={(e) => setFormData({ ...formData, company_revenue: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_year_business_done">Last Year Business Done (USD Jan 25-Dec 25)</Label>
                                <Input id="last_year_business_done" value={formData.last_year_business_done || ''} onChange={(e) => setFormData({ ...formData, last_year_business_done: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_accounts">Target Projection 2026 (Accounts Team)</Label>
                                <Input id="target_projection_2026_accounts" value={formData.target_projection_2026_accounts || ''} onChange={(e) => setFormData({ ...formData, target_projection_2026_accounts: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target_projection_2026_delivery">Target Projection 2026 (Delivery)</Label>
                                <Input id="target_projection_2026_delivery" value={formData.target_projection_2026_delivery || ''} onChange={(e) => setFormData({ ...formData, target_projection_2026_delivery: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_pipeline_value">Current Pipeline Value (Next 6-12 Months)</Label>
                                <Input id="current_pipeline_value" value={formData.current_pipeline_value || ''} onChange={(e) => setFormData({ ...formData, current_pipeline_value: e.target.value })} />
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
                                <Input id="team_size" value={formData.team_size || ''} onChange={(e) => setFormData({ ...formData, team_size: e.target.value })} />
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
                                <Input id="number_of_active_projects" value={formData.number_of_active_projects || ''} onChange={(e) => setFormData({ ...formData, number_of_active_projects: e.target.value })} />
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
                                <Input id="current_nps" value={formData.current_nps || ''} onChange={(e) => setFormData({ ...formData, current_nps: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_active_connects">Total Active Connects from Account</Label>
                                <Input id="total_active_connects" value={formData.total_active_connects || ''} onChange={(e) => setFormData({ ...formData, total_active_connects: e.target.value })} />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input type="checkbox" id="connect_with_decision_maker" checked={formData.connect_with_decision_maker} onChange={(e) => setFormData({ ...formData, connect_with_decision_maker: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                                <Label htmlFor="connect_with_decision_maker">Connect with Decision Maker (Yes/No)</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STAKEHOLDERS */}
                <TabsContent value="stakeholders" className="space-y-6 py-4">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base text-slate-800">Stakeholder List ({profiles.length})</CardTitle>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setProfiles([...profiles, { id: `stk-${Date.now()}`, executive_sponsor: '', technical_decision_maker: '', influencer: '', neutral_stakeholders: '', negative_stakeholder: '', succession_risk: '', key_competitors: '', our_positioning: '', incumbency_strength: 'Medium', areas_competition_stronger: '', white_spaces_we_own: '', account_review_cadence: '', qbr_happening: 'No', technical_audit_frequency: '', created_at: '', updated_at: '' } as StrategicStakeholderProfile])}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Stakeholder Row
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 overflow-x-auto">
                            {profiles.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No stakeholders added to the list yet.</p>
                                    <p className="text-sm">Fill out the form above and click "Add to List Below" to save them.</p>
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
                                                    <TableCell><Input value={profile.executive_sponsor || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], executive_sponsor: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="Sponsor" /></TableCell>
                                                    <TableCell><Input value={profile.technical_decision_maker || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], technical_decision_maker: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="TDM" /></TableCell>
                                                    <TableCell><Input value={profile.influencer || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], influencer: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="Influencers" /></TableCell>
                                                    <TableCell><Input value={profile.neutral_stakeholders || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], neutral_stakeholders: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="Neutral" /></TableCell>
                                                    <TableCell><Input value={profile.negative_stakeholder || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], negative_stakeholder: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="Negative" /></TableCell>
                                                    <TableCell><Input value={profile.succession_risk || ''} onChange={(e) => { const newProfiles = [...profiles]; newProfiles[idx] = { ...newProfiles[idx], succession_risk: e.target.value }; setProfiles(newProfiles); }} className="h-8 text-xs px-2" placeholder="Risk" /></TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            onClick={async () => {
                                                                const profileId = profiles[idx].id;
                                                                // If it's a new row (has an ID starting with 'stk-'), just remove it locally
                                                                if (profileId && profileId.startsWith('stk-')) {
                                                                    setProfiles(profiles.filter((_, i) => i !== idx));
                                                                    return;
                                                                }

                                                                try {
                                                                    if (profileId) {
                                                                        const { api } = await import('@/services/api');
                                                                        await api.deleteStakeholderDetails(profileId);
                                                                    }
                                                                    setProfiles(profiles.filter((_, i) => i !== idx));
                                                                    toast({
                                                                        title: 'Success',
                                                                        description: 'Stakeholder deleted successfully',
                                                                    });
                                                                } catch (err) {
                                                                    console.error("Failed to delete stakeholder", err);
                                                                    toast({
                                                                        title: 'Error',
                                                                        description: 'Failed to delete stakeholder. Please try again.',
                                                                        variant: 'destructive',
                                                                    });
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
                </TabsContent>

                {/* COMPETITION & POSITIONING */}
                <TabsContent value="competition" className="space-y-4 py-4">
                    <Card className="border-t-4 border-t-rose-500 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-rose-50/80 to-transparent border-b border-rose-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-100/50 rounded-lg text-rose-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-rose-950">Competition & Positioning</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="key_competitors">Key Competitors in Account</Label>
                                <Textarea
                                    id="key_competitors"
                                    value={formData.key_competitors}
                                    onChange={(e) => setFormData({ ...formData, key_competitors: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="our_positioning_vs_competition">Our Positioning vs Competition</Label>
                                <Textarea
                                    id="our_positioning_vs_competition"
                                    value={formData.our_positioning_vs_competition}
                                    onChange={(e) => setFormData({ ...formData, our_positioning_vs_competition: e.target.value })}
                                    placeholder="Cost / Quality / Speed / Trust / AI / Domain / Value Additions"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="incumbency_strength">Incumbency Strength</Label>
                                <Select
                                    value={formData.incumbency_strength}
                                    onValueChange={(val: any) => setFormData({ ...formData, incumbency_strength: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Strength" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="areas_competition_stronger">Areas Where Competition Is Stronger</Label>
                                <Textarea
                                    id="areas_competition_stronger"
                                    value={formData.areas_competition_stronger}
                                    onChange={(e) => setFormData({ ...formData, areas_competition_stronger: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="white_spaces_we_own">White Spaces We Own Clearly</Label>
                                <Textarea
                                    id="white_spaces_we_own"
                                    value={formData.white_spaces_we_own}
                                    onChange={(e) => setFormData({ ...formData, white_spaces_we_own: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INTERNAL READINESS */}
                <TabsContent value="readiness" className="space-y-4 py-4">
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-transparent border-b border-emerald-100 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg text-emerald-950">Internal Readiness</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_review_cadence_frequency">Account Review Cadence</Label>
                                <Input
                                    id="account_review_cadence_frequency"
                                    value={formData.account_review_cadence_frequency}
                                    onChange={(e) => setFormData({ ...formData, account_review_cadence_frequency: e.target.value })}
                                    placeholder="e.g. Yes - Every Month"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qbr_happening">QBR Happening?</Label>
                                <Select
                                    value={formData.qbr_happening ? "Yes" : "No"}
                                    onValueChange={(val: any) => setFormData({ ...formData, qbr_happening: val === "Yes" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="technical_audit_frequency">Technical Audit Frequency</Label>
                                <Input
                                    id="technical_audit_frequency"
                                    value={formData.technical_audit_frequency}
                                    onChange={(e) => setFormData({ ...formData, technical_audit_frequency: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-between items-center sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10 px-1">
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={(!account && isFirstTab) || isLoading}
                    >
                        Previous
                    </Button>

                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || (!account && isLastTab)}
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
                        className={(!account && !isLastTab) ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
