
import { useState } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { api } from '@/services/api';
import { MainLayout } from '@/components/layout/MainLayout';
import { StrategicProfileForm } from '@/components/accounts/StrategicProfileForm';
import { StrategicStakeholderProfile } from '@/types/account';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Users, Award, ShieldAlert, Swords, Trash2, Edit, MoreVertical, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Stakeholders = () => {
  const { accounts, refreshAccounts } = useAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StrategicStakeholderProfile | undefined>();
  const { toast } = useToast();

  // Derived state: Extract all profiles from all accounts
  // We attach account_id/name to each profile so we know where it belongs
  const profiles = accounts.flatMap(account =>
    (account.strategic_profiles || []).map(profile => ({
      ...profile,
      account_name: account.account_name,
      account_id: account.account_id
    }))
  );

  const handleAddProfile = () => {
    setEditingProfile(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProfile = (profile: StrategicStakeholderProfile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleDeleteProfile = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm("Are you sure you want to delete this profile?")) return;

    try {
      await api.deleteStakeholderDetails(profileId);
      await refreshAccounts();
      toast({ title: 'Profile Deleted', description: 'Strategic profile deleted successfully.' });
    } catch (err) {
      console.error("Failed to delete profile", err);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to delete profile.' });
    }
  };

  const handleSubmit = async (profileData: Partial<StrategicStakeholderProfile>) => {
    try {
      if (editingProfile && editingProfile.id) {
        // Update
        const updatePayload = {
          ...profileData,
          // We map frontend fields to backend expected fields manually or trust the spread if names match
          // Our api.ts updateStakeholderDetails expects StakeholderDetailsUpdate
          // We need to match keys. Fortunately our mapApiToStrategicProfile was inverse.
          // But we must be careful. The form returns `StrategicStakeholderProfile` keys.
          // The API expects `StakeholderDetailsUpdate` keys.
          // We should probably map it back. Or simply pass it if keys align mostly.
          // Let's rely on the fact that we aligned them mostly, but let's double check mapping.
          // Actually, `api.ts` `StakeholderDetailsUpdate` uses exact keys like `technical_decision_maker`.
          // BUT `StrategicStakeholderProfile` uses `technical_decision_maker` too.
          // Checking `types/account`: yes.
          // Checking `types/dashboard-api`: `StakeholderDetailsUpdate` also uses `technical_decision_maker`.
          // So spread works for most.
        };

        // We need to clean up `id`, `created_at` etc from payload if they are present
        const { id, created_at, updated_at, ...cleanPayload } = profileData as any;

        await api.updateStakeholderDetails(editingProfile.id, cleanPayload);
        toast({ title: 'Profile Updated', description: 'Strategic profile updated successfully.' });
      } else {
        // Create
        // Needs account_id and account_name
        if (!profileData.account_id) {
          toast({ title: 'Error', variant: 'destructive', description: 'Account is required.' });
          return;
        }

        const createPayload = {
          account_id: profileData.account_id,
          account_name: profileData.account_name || 'Unknown',
          ...profileData
        };
        // Clean up
        const { id, created_at, updated_at, ...cleanPayload } = createPayload as any;

        await api.createStakeholderDetails(cleanPayload);
        toast({ title: 'Profile Created', description: 'New strategic profile added.' });
      }
      await refreshAccounts(); // Reload data
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to save profile.' });
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
            <Card key={profile.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleEditProfile(profile)}>
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
                      <p className="text-xs">{profile.account_review_cadence || '-'}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900/50">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Risk
                      </p>
                      <p className="text-xs truncate" title={profile.succession_risk}>{profile.succession_risk || 'None'}</p>
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Strategic Profile' : 'Add Strategic Profile'}
              </DialogTitle>
            </DialogHeader>
            <StrategicProfileForm
              profile={editingProfile}
              accounts={accounts}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Stakeholders;
