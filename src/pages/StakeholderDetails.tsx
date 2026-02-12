import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Shield, Users, Target, Pencil, Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToExcel, exportMultipleTablesToPDF } from '@/lib/exportUtils';
import { api } from '@/services/api';
import { StakeholderDetailsResponse } from '@/types/dashboard-api';
import { useToast } from '@/hooks/use-toast';

const StakeholderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [stakeholder, setStakeholder] = useState<StakeholderDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchStakeholder(id);
        }
    }, [id]);

    const fetchStakeholder = async (stakeholderId: string) => {
        setIsLoading(true);
        try {
            const data = await api.getStakeholderById(stakeholderId);
            setStakeholder(data);
        } catch (error) {
            console.error('Failed to fetch stakeholder details:', error);
            toast({
                title: 'Error',
                description: 'Failed to load stakeholder details.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!stakeholder) return;
        const exportData = [{
            'Account Name': stakeholder.account_name,
            'Executive Sponsor': stakeholder.executive_sponsor,
            'Technical Decision Maker': stakeholder.technical_decision_maker,
            'Influencer': stakeholder.influencers || '',
            'Neutral Stakeholders': stakeholder.neutral_stakeholders || '',
            'Negative Stakeholder': stakeholder.negative_stakeholder || '',
            'Succession Risk': stakeholder.succession_risk || '',
            'Key Competitors': stakeholder.key_competitors || '',
            'Our Positioning': stakeholder.our_positioning_vs_competition || '',
            'Incumbency Strength': stakeholder.incumbency_strength,
            'Areas Competition Stronger': stakeholder.areas_competition_stronger || '',
            'White Spaces We Own': stakeholder.white_spaces_we_own || '',
            'Account Review Cadence': stakeholder.account_review_cadence_frequency || '',
            'QBR Happening': stakeholder.qbr_happening ? 'Yes' : 'No',
            'Technical Audit Frequency': stakeholder.technical_audit_frequency || ''
        }];
        exportToExcel(exportData, `${stakeholder.account_name}_Stakeholder_${stakeholder.executive_sponsor || 'Profile'}`);
    };

    const handleExportPDF = () => {
        if (!stakeholder) return;

        const allTables: { title: string; data: any[]; columns: { header: string; dataKey: string }[] }[] = [];

        const mappingData = [{
            'Sponsor': stakeholder.executive_sponsor,
            'Tech DM': stakeholder.technical_decision_maker,
            'Influencer': stakeholder.influencers || '-',
            'Neutral': stakeholder.neutral_stakeholders || '-',
            'Negative': stakeholder.negative_stakeholder || '-',
            'Succession Risk': stakeholder.succession_risk || '-'
        }];

        const competitionData = [{
            'Competitors': stakeholder.key_competitors || '-',
            'Positioning': stakeholder.our_positioning_vs_competition || '-',
            'Incumbency': stakeholder.incumbency_strength,
            'Stronger Areas': stakeholder.areas_competition_stronger || '-',
            'White Spaces': stakeholder.white_spaces_we_own || '-'
        }];

        const readinessData = [{
            'Cadence': stakeholder.account_review_cadence_frequency || '-',
            'QBR': stakeholder.qbr_happening ? 'Yes' : 'No',
            'Audit': stakeholder.technical_audit_frequency || '-'
        }];

        const createTable = (title: string, data: any[]) => ({
            title,
            data,
            columns: Object.keys(data[0]).map(key => ({ header: key, dataKey: key }))
        });

        allTables.push(createTable(`Stakeholder Mapping: ${stakeholder.executive_sponsor || 'Unknown'}`, mappingData));
        allTables.push(createTable(`Competition & Positioning`, competitionData));
        allTables.push(createTable(`Internal Readiness`, readinessData));

        exportMultipleTablesToPDF(
            allTables,
            `${stakeholder.account_name}_Stakeholder_${stakeholder.executive_sponsor || 'Profile'}`,
            'landscape',
            `Stakeholder Profile: ${stakeholder.account_name}`
        );
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <p className="text-muted-foreground">Loading stakeholder details...</p>
                </div>
            </MainLayout>
        );
    }

    if (!stakeholder) {
        return (
            <MainLayout>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Stakeholder not found</h2>
                        <Button onClick={() => navigate('/stakeholders')} className="mt-4">
                            Back to Stakeholders
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" onClick={() => navigate('/stakeholders')} className="gap-2 mb-2 p-0 h-auto hover:bg-transparent hover:text-primary">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Stakeholders
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">
                            {stakeholder.account_name} Stakeholders
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Strategic analysis and key relationships
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate(`/stakeholders/${id}/edit`)} className="gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="mapping" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-4">
                        <TabsTrigger value="mapping" className="tab-purple">Stakeholder Mapping</TabsTrigger>
                        <TabsTrigger value="competition" className="tab-rose">Competition & Positioning</TabsTrigger>
                        <TabsTrigger value="readiness" className="tab-emerald">Internal Readiness</TabsTrigger>
                    </TabsList>

                    {/* Stakeholder Mapping Tab */}
                    <TabsContent value="mapping" className="mt-6 space-y-6">
                        <Card className="border-t-4 border-t-purple-500 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50/80 to-transparent border-b border-purple-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-purple-950">
                                    <div className="p-2 bg-purple-100/50 rounded-lg text-purple-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    Key Personnel & Stakeholders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Executive Sponsor</span>
                                        <p className="font-medium">{stakeholder.executive_sponsor || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Technical Decision Maker</span>
                                        <p className="font-medium">{stakeholder.technical_decision_maker || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold mb-2">Influencers</h3>
                                        <p className="text-sm whitespace-pre-wrap">{stakeholder.influencers || 'None identified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold mb-2">Neutral Stakeholders</h3>
                                        <p className="text-sm whitespace-pre-wrap">{stakeholder.neutral_stakeholders || 'None identified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold mb-2">Negative Stakeholders</h3>
                                        <p className="text-sm whitespace-pre-wrap">{stakeholder.negative_stakeholder || 'None identified'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Succession Risk</span>
                                        <p className="text-sm leading-relaxed">{stakeholder.succession_risk || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Competition & Positioning Tab */}
                    <TabsContent value="competition" className="mt-6 space-y-6">
                        <Card className="border-t-4 border-t-rose-500 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-rose-50/80 to-transparent border-b border-rose-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-rose-950">
                                    <div className="p-2 bg-rose-100/50 rounded-lg text-rose-600">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    Competitive Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Key Competitors</span>
                                        <p className="font-medium">{stakeholder.key_competitors || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Incumbency Strength</span>
                                        <p className="font-medium">{stakeholder.incumbency_strength || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Our Positioning vs Competition</span>
                                        <p className="text-sm leading-relaxed">{stakeholder.our_positioning_vs_competition || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">Areas Where Competition is Stronger</span>
                                        <p className="text-sm leading-relaxed">{stakeholder.areas_competition_stronger || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">White Spaces We Own</span>
                                        <p className="text-sm leading-relaxed">{stakeholder.white_spaces_we_own || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Internal Readiness Tab */}
                    <TabsContent value="readiness" className="mt-6 space-y-6">
                        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-transparent border-b border-emerald-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-emerald-950">
                                    <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    Internal Readiness & Cadence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">Account Review Cadence</span>
                                    <p className="font-medium">{stakeholder.account_review_cadence_frequency || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">Technical Audit Frequency</span>
                                    <p className="font-medium">{stakeholder.technical_audit_frequency || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">QBR Happening?</span>
                                    <div className="mt-1">
                                        <Badge variant={stakeholder.qbr_happening ? "default" : "secondary"}>
                                            {stakeholder.qbr_happening ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default StakeholderDetails;
