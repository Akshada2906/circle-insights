
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useAccounts } from '@/contexts/AccountContext';
import { api } from '@/services/api';
import { MainLayout } from '@/components/layout/MainLayout';
import { StrategicStakeholderProfile } from '@/types/account';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Users, Award, ShieldAlert, Swords, Trash2, MoreVertical, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Stakeholders = () => {
  const { refreshAccounts } = useAccounts();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<StrategicStakeholderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapper to convert API response to frontend profile type
  const mapApiToProfile = (apiDetails: any): StrategicStakeholderProfile => {
    return {
      id: apiDetails.id,
      account_id: apiDetails.account_id,
      account_name: apiDetails.account_name,
      executive_sponsor: apiDetails.executive_sponsor || '',
      technical_decision_maker: apiDetails.technical_decision_maker || '',
      influencer: apiDetails.influencers || '',
      neutral_stakeholders: apiDetails.neutral_stakeholders || '',
      negative_stakeholder: apiDetails.negative_stakeholder || '',
      succession_risk: apiDetails.succession_risk || '',
      key_competitors: apiDetails.key_competitors || '',
      our_positioning: apiDetails.our_positioning_vs_competition || '',
      incumbency_strength: apiDetails.incumbency_strength as any,
      areas_competition_stronger: apiDetails.areas_competition_stronger || '',
      white_spaces_we_own: apiDetails.white_spaces_we_own || '',
      account_review_cadence: apiDetails.account_review_cadence_frequency || '',
      qbr_happening: apiDetails.qbr_happening ? 'Yes' : 'No',
      technical_audit_frequency: apiDetails.technical_audit_frequency || '',
      created_at: apiDetails.created_at,
      updated_at: apiDetails.updated_at
    };
  };

  const fetchStakeholders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllStakeholders();
      const mappedProfiles = data.map(mapApiToProfile);
      setProfiles(mappedProfiles);
    } catch (error) {
      console.error("Failed to fetch stakeholders", error);
      toast({
        title: "Error",
        description: "Failed to load stakeholders.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStakeholders();
  }, []); // Fetch on mount

  const handleAddProfile = () => {
    navigate('/stakeholders/new');
  };

  const handleEditProfile = (profile: StrategicStakeholderProfile) => {
    navigate(`/stakeholders/${profile.id}/edit`);
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation(); // Prevent card click
    setDeleteId(profileId);
    setIsDeleteOpen(true);
  };

  const confirmDeleteProfile = async () => {
    if (!deleteId) return;

    try {
      await api.deleteStakeholderDetails(deleteId);
      await refreshAccounts(); // Keep context in sync
      await fetchStakeholders(); // Refresh local list
      toast({ title: 'Profile Deleted', description: 'Strategic profile deleted successfully.' });
    } catch (err) {
      console.error("Failed to delete profile", err);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to delete profile.' });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Strategic Stakeholder Profiles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage executive sponsorship, decision makers, and competitive landscape.
            </p>
          </div>
          <Button onClick={handleAddProfile} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No profiles found. Click "Add Profile" to create one.
            </div>
          ) : profiles.map(profile => (
            <Card key={profile.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/stakeholders/${profile.id}`)}>
              <CardHeader className="pb-3 relative">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProfile(profile); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDeleteProfile(e, profile.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <CardDescription className="text-xs font-semibold mb-1 text-primary">
                      {profile.account_name}
                    </CardDescription>
                    <CardTitle className="text-base font-semibold leading-tight mb-1">
                      {profile.executive_sponsor || 'Unknown Sponsor'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Executive Sponsor
                    </CardDescription>
                  </div>
                  <Badge variant={profile.incumbency_strength === 'High' ? 'default' : profile.incumbency_strength === 'Medium' ? 'secondary' : 'outline'}>
                    {profile.incumbency_strength} Incumbency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 text-sm">
                <div className="space-y-3">
                  {/* Key Roles */}
                  <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-muted-foreground">Technical Decision Maker</p>
                      <p className="text-foreground">{profile.technical_decision_maker || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Risk / Opps */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-900/50">
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Readiness
                      </p>
                      <p className="text-xs text-green-900 dark:text-green-100 font-medium">{profile.account_review_cadence || '-'}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900/50">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Risk
                      </p>
                      <p className="text-xs text-amber-900 dark:text-amber-100 font-medium truncate" title={profile.succession_risk}>{profile.succession_risk || 'None'}</p>
                    </div>
                  </div>

                  {/* Competition Area */}
                  {(profile.key_competitors || profile.our_positioning) && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <Swords className="w-3 h-3" /> Competition
                      </p>
                      <p className="text-xs line-clamp-2 text-muted-foreground">
                        {profile.our_positioning || profile.key_competitors || 'No competitive intelligence'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ConfirmationDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete Profile"
          description="Are you sure you want to delete this strategic profile? This action cannot be undone."
          onConfirm={confirmDeleteProfile}
          variant="destructive"
          confirmText="Delete"
        />
      </div>
    </MainLayout>
  );
};

export default Stakeholders;
