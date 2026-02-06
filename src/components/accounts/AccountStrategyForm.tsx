import { Account } from '@/types/account';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface AccountStrategyFormProps {
    account: Account;
    onChange?: (updatedFields: Partial<Account>) => void;
    readOnly?: boolean;
}

export function AccountStrategyForm({ account, onChange, readOnly = false }: AccountStrategyFormProps) {
    const handleChange = (field: keyof Account, value: any) => {
        if (onChange && !readOnly) {
            onChange({ [field]: value });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Strategy & Intelligence</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Stakeholder Landscape */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Stakeholder Landscape</CardTitle>
                        <CardDescription>Key roles and influencers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="executive_sponsor">Executive Sponsor</Label>
                            <Input
                                id="executive_sponsor"
                                value={account.executive_sponsor || ''}
                                onChange={(e) => handleChange('executive_sponsor', e.target.value)}
                                readOnly={readOnly}
                                placeholder="Name - Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="technical_decision_maker">Technical Decision Maker</Label>
                            <Input
                                id="technical_decision_maker"
                                value={account.technical_decision_maker || ''}
                                onChange={(e) => handleChange('technical_decision_maker', e.target.value)}
                                readOnly={readOnly}
                                placeholder="Name - Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="influencer">Influencer/s</Label>
                            <Textarea
                                id="influencer"
                                value={account.influencer || ''}
                                onChange={(e) => handleChange('influencer', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="neutral_stakeholders">Neutral Stakeholders</Label>
                            <Textarea
                                id="neutral_stakeholders"
                                value={account.neutral_stakeholders || ''}
                                onChange={(e) => handleChange('neutral_stakeholders', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="negative_stakeholder">Negative Stakeholder</Label>
                            <Textarea
                                id="negative_stakeholder"
                                value={account.negative_stakeholder || ''}
                                onChange={(e) => handleChange('negative_stakeholder', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[60px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="succession_risk">Succession Risk</Label>
                            <Input
                                id="succession_risk"
                                value={account.succession_risk || ''}
                                onChange={(e) => handleChange('succession_risk', e.target.value)}
                                readOnly={readOnly}
                                placeholder="Champion Leaving?"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Competition & Positioning */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Competition & Positioning</CardTitle>
                        <CardDescription>Market landscape analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="key_competitors">Key Competitors in Account</Label>
                            <Textarea
                                id="key_competitors"
                                value={account.key_competitors || ''}
                                onChange={(e) => handleChange('key_competitors', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="our_positioning">Our Positioning vs Competition</Label>
                            <Textarea
                                id="our_positioning"
                                value={account.our_positioning || ''}
                                onChange={(e) => handleChange('our_positioning', e.target.value)}
                                readOnly={readOnly}
                                placeholder="Cost / Quality / Speed / Trust / AI"
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incumbency_strength">Incumbency Strength</Label>
                            <Select
                                value={account.incumbency_strength}
                                onValueChange={(val: any) => handleChange('incumbency_strength', val)}
                                disabled={readOnly}
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
                            <Label htmlFor="areas_competition_stronger">Areas Competition Stronger</Label>
                            <Textarea
                                id="areas_competition_stronger"
                                value={account.areas_competition_stronger || ''}
                                onChange={(e) => handleChange('areas_competition_stronger', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="white_spaces_we_own">White Spaces We Own</Label>
                            <Textarea
                                id="white_spaces_we_own"
                                value={account.white_spaces_we_own || ''}
                                onChange={(e) => handleChange('white_spaces_we_own', e.target.value)}
                                readOnly={readOnly}
                                className="min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Column 3: Internal Readiness */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Internal Readiness</CardTitle>
                        <CardDescription>Engagement cadence and reviews</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="account_review_cadence">Account Review Cadence</Label>
                            <Input
                                id="account_review_cadence"
                                value={account.account_review_cadence || ''}
                                onChange={(e) => handleChange('account_review_cadence', e.target.value)}
                                readOnly={readOnly}
                                placeholder="Frequency with Customer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qbr_happening">QBR Happening?</Label>
                            <Select
                                value={account.qbr_happening}
                                onValueChange={(val: any) => handleChange('qbr_happening', val)}
                                disabled={readOnly}
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
                                value={account.technical_audit_frequency || ''}
                                onChange={(e) => handleChange('technical_audit_frequency', e.target.value)}
                                readOnly={readOnly}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />
        </div>
    );
}
