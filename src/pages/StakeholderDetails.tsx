import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Shield, Users, Target, Pencil } from 'lucide-react';
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
                    <div>
                        <Button onClick={() => navigate(`/stakeholders/${id}/edit`)} className="gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="mapping" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                        <TabsTrigger value="mapping">Stakeholder Mapping</TabsTrigger>
                        <TabsTrigger value="competition">Competition & Positioning</TabsTrigger>
                        <TabsTrigger value="readiness">Internal Readiness</TabsTrigger>
                    </TabsList>

                    {/* Stakeholder Mapping Tab */}
                    <TabsContent value="mapping" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
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
