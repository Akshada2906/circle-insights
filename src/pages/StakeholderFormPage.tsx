import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StrategicProfileForm } from '@/components/accounts/StrategicProfileForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/contexts/AccountContext';
import { api } from '@/services/api';
import { ArrowLeft } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { StrategicStakeholderProfile } from '@/types/account';

const StakeholderFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accounts, refreshAccounts } = useAccounts();
    const { toast } = useToast();

    const [profile, setProfile] = useState<StrategicStakeholderProfile | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [pendingUpdate, setPendingUpdate] = useState<Partial<StrategicStakeholderProfile> | null>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const isEditing = !!id;

    // Fetch profile if editing
    useEffect(() => {
        const loadProfile = async () => {
            if (id) {
                try {
                    // We need a way to get a single stakeholder profile
                    // api.getAllStakeholders returns mapped objects in Stakeholders.tsx, but returns raw from api
                    // Let's use getStakeholderById from api
                    const data = await api.getStakeholderById(id);
                    // Map it manually or reuse mapper if possible. 
                    // To avoid duplicating mapper, let's map it here locally similar to Stakeholders.tsx
                    const mappedProfile: StrategicStakeholderProfile = {
                        id: data.id,
                        account_id: data.account_id,
                        account_name: data.account_name,
                        executive_sponsor: data.executive_sponsor || '',
                        technical_decision_maker: data.technical_decision_maker || '',
                        influencer: data.influencers || '',
                        neutral_stakeholders: data.neutral_stakeholders || '',
                        negative_stakeholder: data.negative_stakeholder || '',
                        succession_risk: data.succession_risk || '',
                        key_competitors: data.key_competitors || '',
                        our_positioning: data.our_positioning_vs_competition || '',
                        incumbency_strength: data.incumbency_strength as any,
                        areas_competition_stronger: data.areas_competition_stronger || '',
                        white_spaces_we_own: data.white_spaces_we_own || '',
                        account_review_cadence: data.account_review_cadence_frequency || '',
                        qbr_happening: data.qbr_happening ? 'Yes' : 'No',
                        technical_audit_frequency: data.technical_audit_frequency || '',
                        created_at: data.created_at,
                        updated_at: data.updated_at
                    };
                    setProfile(mappedProfile);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    toast({
                        title: "Error",
                        description: "Failed to load stakeholder profile.",
                        variant: "destructive"
                    });
                    navigate('/stakeholders');
                }
            }
            setPageLoading(false);
        };
        loadProfile();
    }, [id, navigate, toast]);

    const confirmUpdate = async () => {
        if (!isEditing || !id || !pendingUpdate || !profile) return;
        setIsLoading(true);

        try {
            // Clean payload
            const { id: _id, created_at, updated_at, ...updateData } = pendingUpdate as any;

            // API expects flat structure
            const apiPayload = {
                account_name: updateData.account_name,
                executive_sponsor: updateData.executive_sponsor,
                technical_decision_maker: updateData.technical_decision_maker,
                influencers: updateData.influencer,
                neutral_stakeholders: updateData.neutral_stakeholders,
                negative_stakeholder: updateData.negative_stakeholder,
                succession_risk: updateData.succession_risk,
                key_competitors: updateData.key_competitors,
                our_positioning_vs_competition: updateData.our_positioning,
                incumbency_strength: updateData.incumbency_strength,
                areas_competition_stronger: updateData.areas_competition_stronger,
                white_spaces_we_own: updateData.white_spaces_we_own,
                account_review_cadence_frequency: updateData.account_review_cadence,
                qbr_happening: updateData.qbr_happening === 'Yes',
                technical_audit_frequency: updateData.technical_audit_frequency
            };

            await api.updateStakeholderDetails(id, apiPayload);
            await refreshAccounts(); // Update global context if needed
            toast({ title: 'Profile Updated', description: 'Strategic profile updated successfully.' });
            navigate(`/stakeholders/${id}`);
        } catch (error) {
            console.error("Failed to update profile", error);
            toast({ title: 'Error', variant: 'destructive', description: 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
            setIsUpdateOpen(false);
            setPendingUpdate(null);
        }
    };

    const handleSubmit = async (profileData: Partial<StrategicStakeholderProfile>) => {
        if (isEditing && id) {
            setPendingUpdate(profileData);
            setIsUpdateOpen(true);
        } else {
            // Create New
            setIsLoading(true);
            try {
                if (!profileData.account_id) {
                    toast({ title: 'Error', variant: 'destructive', description: 'Account is required.' });
                    setIsLoading(false);
                    return;
                }

                const createPayload = {
                    account_id: profileData.account_id,
                    account_name: profileData.account_name || 'Unknown',
                    executive_sponsor: profileData.executive_sponsor,
                    technical_decision_maker: profileData.technical_decision_maker,
                    influencers: profileData.influencer,
                    neutral_stakeholders: profileData.neutral_stakeholders,
                    negative_stakeholder: profileData.negative_stakeholder,
                    succession_risk: profileData.succession_risk,
                    key_competitors: profileData.key_competitors,
                    our_positioning_vs_competition: profileData.our_positioning,
                    incumbency_strength: profileData.incumbency_strength,
                    areas_competition_stronger: profileData.areas_competition_stronger,
                    white_spaces_we_own: profileData.white_spaces_we_own,
                    account_review_cadence_frequency: profileData.account_review_cadence,
                    qbr_happening: profileData.qbr_happening === 'Yes',
                    technical_audit_frequency: profileData.technical_audit_frequency
                };

                await api.createStakeholderDetails(createPayload);
                await refreshAccounts();
                toast({ title: 'Profile Created', description: 'New strategic profile added.' });
                navigate('/stakeholders');
            } catch (error) {
                console.error("Failed to create profile", error);
                toast({ title: 'Error', variant: 'destructive', description: 'Failed to create profile.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        if (isEditing && id) {
            navigate(`/stakeholders/${id}`);
        } else {
            navigate('/stakeholders');
        }
    };

    if (pageLoading) {
        return <MainLayout><div className="flex justify-center p-8">Loading...</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={handleCancel} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {isEditing ? 'Edit Strategic Profile' : 'Add Strategic Profile'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? 'Update the strategic stakeholder information below'
                            : 'Add a new strategic profile for an account'}
                    </p>
                </div>

                {/* Form */}
                <StrategicProfileForm
                    profile={profile}
                    accounts={accounts}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />

                <ConfirmationDialog
                    open={isUpdateOpen}
                    onOpenChange={setIsUpdateOpen}
                    title="Update Profile"
                    description="Are you sure you want to update this strategic profile?"
                    onConfirm={confirmUpdate}
                    confirmText="Update Profile"
                    isLoading={isLoading}
                />
            </div>
        </MainLayout>
    );
};

export default StakeholderFormPage;
