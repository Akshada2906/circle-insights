import { useState, useEffect } from 'react';
import { StrategicStakeholderProfile, AccountWithProjects } from '@/types/account';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface StrategicProfileFormProps {
    profile?: StrategicStakeholderProfile;
    accounts?: AccountWithProjects[];
    onSubmit: (profile: Partial<StrategicStakeholderProfile>) => void;
    onCancel: () => void;
}

export function StrategicProfileForm({ profile, accounts, onSubmit, onCancel }: StrategicProfileFormProps) {
    const [formData, setFormData] = useState<Partial<StrategicStakeholderProfile>>({
        account_id: profile?.account_id || '',
        account_name: profile?.account_name || '',
        executive_sponsor: profile?.executive_sponsor || '',
        technical_decision_maker: profile?.technical_decision_maker || '',
        influencer: profile?.influencer || '',
        neutral_stakeholders: profile?.neutral_stakeholders || '',
        negative_stakeholder: profile?.negative_stakeholder || '',
        succession_risk: profile?.succession_risk || '',

        key_competitors: profile?.key_competitors || '',
        our_positioning: profile?.our_positioning || '',
        incumbency_strength: profile?.incumbency_strength || 'Medium',
        areas_competition_stronger: profile?.areas_competition_stronger || '',
        white_spaces_we_own: profile?.white_spaces_we_own || '',

        account_review_cadence: profile?.account_review_cadence || '',
        qbr_happening: profile?.qbr_happening || 'No',
        technical_audit_frequency: profile?.technical_audit_frequency || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Account is required for global create
        if (!formData.account_id && accounts && accounts.length > 0) {
            alert("Please select an account.");
            return;
        }
        onSubmit(formData);
    };

    const handleAccountChange = (accountId: string) => {
        const selectedAccount = accounts?.find(a => a.account_id === accountId);
        setFormData({
            ...formData,
            account_id: accountId,
            account_name: selectedAccount?.account_name || ''
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Selection - Only show if accounts provided and we don't have a fixed profile with ID (edit mode usually implies context, but here we cover both) */}
            {accounts && accounts.length > 0 && !profile?.id && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="account_select">Select Account <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.account_id}
                                onValueChange={handleAccountChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an account..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.account_id} value={acc.account_id}>
                                            {acc.account_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="roles" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="roles">Roles & Stakeholders</TabsTrigger>
                    <TabsTrigger value="competition">Competition</TabsTrigger>
                    <TabsTrigger value="readiness">Internal Readiness</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4 py-4">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="executive_sponsor">Executive Sponsor</Label>
                                <Input
                                    id="executive_sponsor"
                                    value={formData.executive_sponsor}
                                    onChange={(e) => setFormData({ ...formData, executive_sponsor: e.target.value })}
                                    placeholder="Name - Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="technical_decision_maker">Technical Decision Maker</Label>
                                <Input
                                    id="technical_decision_maker"
                                    value={formData.technical_decision_maker}
                                    onChange={(e) => setFormData({ ...formData, technical_decision_maker: e.target.value })}
                                    placeholder="Name - Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="influencer">Influencer/s</Label>
                                <Textarea
                                    id="influencer"
                                    value={formData.influencer}
                                    onChange={(e) => setFormData({ ...formData, influencer: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neutral_stakeholders">Neutral Stakeholders</Label>
                                <Textarea
                                    id="neutral_stakeholders"
                                    value={formData.neutral_stakeholders}
                                    onChange={(e) => setFormData({ ...formData, neutral_stakeholders: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="negative_stakeholder">Negative Stakeholder</Label>
                                <Textarea
                                    id="negative_stakeholder"
                                    value={formData.negative_stakeholder}
                                    onChange={(e) => setFormData({ ...formData, negative_stakeholder: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="succession_risk">Succession Risk (Champion Leaving?)</Label>
                                <Input
                                    id="succession_risk"
                                    value={formData.succession_risk}
                                    onChange={(e) => setFormData({ ...formData, succession_risk: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="competition" className="space-y-4 py-4">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="key_competitors">Key Competitors in Account</Label>
                                <Textarea
                                    id="key_competitors"
                                    value={formData.key_competitors}
                                    onChange={(e) => setFormData({ ...formData, key_competitors: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="our_positioning">Our Positioning vs Competition</Label>
                                <Textarea
                                    id="our_positioning"
                                    value={formData.our_positioning}
                                    onChange={(e) => setFormData({ ...formData, our_positioning: e.target.value })}
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

                <TabsContent value="readiness" className="space-y-4 py-4">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="account_review_cadence">Account Review Cadence</Label>
                                <Input
                                    id="account_review_cadence"
                                    value={formData.account_review_cadence}
                                    onChange={(e) => setFormData({ ...formData, account_review_cadence: e.target.value })}
                                    placeholder="e.g. Yes - Every Month"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qbr_happening">QBR Happening?</Label>
                                <Select
                                    value={formData.qbr_happening}
                                    onValueChange={(val: any) => setFormData({ ...formData, qbr_happening: val })}
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

            <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t z-10">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {profile?.id ? 'Update Profile' : 'Create Profile'}
                </Button>
            </div>
        </form>
    );
}
