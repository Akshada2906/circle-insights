
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
import { Input } from '@/components/ui/input';
import { Plus, Users, Award, ShieldAlert, Swords, Trash2, MoreVertical, Pencil, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF, exportMultipleTablesToPDF, exportFormattedAoAToExcel } from '@/lib/exportUtils';
import * as XLSX from 'xlsx-js-style';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';

const Stakeholders = () => {
  const { refreshAccounts } = useAccounts();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<StrategicStakeholderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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





  const handleExportStrategicMatrix = () => {
    // Headers (Account Names)
    const headerRow = ['Account Name', ...profiles.map(p => p.account_name)];
    const totalCols = headerRow.length;

    // Helper to get safe string value
    const getVal = (p: StrategicStakeholderProfile, field: keyof StrategicStakeholderProfile) => {
      const val = p[field];
      return val !== null && val !== undefined ? val : '';
    };

    // --- Data Arrays ---
    const stakeholderMappingRows = [
      ['Executive Sponsor', ...profiles.map(p => getVal(p, 'executive_sponsor'))],
      ['Technical Decision Maker', ...profiles.map(p => getVal(p, 'technical_decision_maker'))],
      ['Influencer/s', ...profiles.map(p => getVal(p, 'influencer'))],
      ['Neutral Stakeholders', ...profiles.map(p => getVal(p, 'neutral_stakeholders'))],
      ['Negative Stakeholder', ...profiles.map(p => getVal(p, 'negative_stakeholder'))],
      ['Succession Risk (Champion Leaving?)', ...profiles.map(p => getVal(p, 'succession_risk'))],
    ];

    const competitionRows = [
      ['Key Competitors in Account', ...profiles.map(p => getVal(p, 'key_competitors'))],
      ['Our Positioning vs Competition', ...profiles.map(p => getVal(p, 'our_positioning'))],
      ['Incumbency Strength', ...profiles.map(p => getVal(p, 'incumbency_strength'))],
      ['Areas Where Competition Is Stronger', ...profiles.map(p => getVal(p, 'areas_competition_stronger'))],
      ['White Spaces We Own Clearly', ...profiles.map(p => getVal(p, 'white_spaces_we_own'))],
    ];

    const readinessRows = [
      ['Account Review Cadence', ...profiles.map(p => getVal(p, 'account_review_cadence'))],
      ['QBR Happening?', ...profiles.map(p => getVal(p, 'qbr_happening'))],
      ['Technical Audit Frequency', ...profiles.map(p => getVal(p, 'technical_audit_frequency'))],
    ];

    // --- Construct Single Sheet Data ---
    const data: any[][] = [];
    const merges: XLSX.Range[] = [];
    const styles: Record<string, any> = {};

    // Define Column Widths
    const cols = [
      { wch: 30 }, // Column A (Field Name) - wider
      ...profiles.map(() => ({ wch: 20 })) // Account Columns - standard width
    ];

    // Style for Section Headers (Strict Center Alignment)
    const sectionHeaderStyle = {
      font: { bold: true, sz: 14 },
      fill: { fgColor: { rgb: "FFC000" } }, // Orange-Gold background
      alignment: { horizontal: "center", vertical: "center", wrapText: true }
    };

    // Style for Account Name Headers (B1, C1, D1... - excluding A1)
    const accountHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "595959" } }, // Dark gray background (matching template)
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Style for Field Labels (Column A - all rows including A1)
    const fieldLabelStyle = {
      font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "595959" } }, // Dark gray background (matching template)
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } }
      }
    };

    // 1. Header
    data.push(headerRow);

    // Apply style to account name headers (B1, C1, D1... - starting from column 1)
    for (let c = 1; c < totalCols; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
      styles[cellAddress] = accountHeaderStyle;
    }

    // Apply style to A1 (Account Name label)
    styles[XLSX.utils.encode_cell({ r: 0, c: 0 })] = fieldLabelStyle;

    // 2. Stakeholder Mapping Section
    const mappingHeaderRowIndex = data.length;
    data.push(['Stakeholder Mapping']); // This row will be merged
    merges.push({ s: { r: mappingHeaderRowIndex, c: 0 }, e: { r: mappingHeaderRowIndex, c: totalCols - 1 } });

    // Apply style to the merged cell
    const mappingHeaderAddress = XLSX.utils.encode_cell({ r: mappingHeaderRowIndex, c: 0 });
    styles[mappingHeaderAddress] = sectionHeaderStyle;

    // Apply field label styles to stakeholder mapping rows
    for (let i = 0; i < stakeholderMappingRows.length; i++) {
      const rowIndex = mappingHeaderRowIndex + 1 + i;
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
      styles[cellAddress] = fieldLabelStyle;
    }
    data.push(...stakeholderMappingRows);

    // 3. Competition Section
    const competitionHeaderRowIndex = data.length;
    data.push(['Competition & Positioning']);
    merges.push({ s: { r: competitionHeaderRowIndex, c: 0 }, e: { r: competitionHeaderRowIndex, c: totalCols - 1 } });

    // Apply style to the merged cell
    const competitionHeaderAddress = XLSX.utils.encode_cell({ r: competitionHeaderRowIndex, c: 0 });
    styles[competitionHeaderAddress] = sectionHeaderStyle;

    // Apply field label styles to competition rows
    for (let i = 0; i < competitionRows.length; i++) {
      const rowIndex = competitionHeaderRowIndex + 1 + i;
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
      styles[cellAddress] = fieldLabelStyle;
    }
    data.push(...competitionRows);

    // 4. Readiness Section
    const readinessHeaderRowIndex = data.length;
    data.push(['Internal Readiness']);
    merges.push({ s: { r: readinessHeaderRowIndex, c: 0 }, e: { r: readinessHeaderRowIndex, c: totalCols - 1 } });

    // Apply style to the merged cell
    const readinessHeaderAddress = XLSX.utils.encode_cell({ r: readinessHeaderRowIndex, c: 0 });
    styles[readinessHeaderAddress] = sectionHeaderStyle;

    // Apply field label styles to readiness rows
    for (let i = 0; i < readinessRows.length; i++) {
      const rowIndex = readinessHeaderRowIndex + 1 + i;
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
      styles[cellAddress] = fieldLabelStyle;
    }
    data.push(...readinessRows);

    exportFormattedAoAToExcel(data, 'Strategic_Stakeholder_Matrix', merges, styles, cols);
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.executive_sponsor && profile.executive_sponsor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (profile.technical_decision_maker && profile.technical_decision_maker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });


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
          <div className="flex gap-2">
            <Button onClick={handleAddProfile} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-blue-600 border-blue-700 text-white hover:bg-blue-700 hover:border-blue-800">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportStrategicMatrix}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by account name, executive sponsor, or decision maker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchQuery ? 'No profiles match your search. Try adjusting your search terms.' : 'No profiles found. Click "Add Profile" to create one.'}
            </div>
          ) : filteredProfiles.map(profile => (
            <Card key={profile.id} className="flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-100/40 border-blue-100 shadow-sm cursor-pointer" onClick={() => navigate(`/stakeholders/${profile.id}`)}>
              <CardHeader className="pb-3 relative bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100/50">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50">
                        <MoreVertical className="h-4 w-4 text-blue-900" />
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
                    <CardDescription className="text-xs font-bold mb-1 text-blue-600 uppercase tracking-wider">
                      {profile.account_name}
                    </CardDescription>
                    <CardTitle className="text-lg font-bold leading-tight mb-1 text-blue-950">
                      {profile.executive_sponsor || 'Unknown Sponsor'}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-blue-700 bg-blue-100/50 inline-block px-2 py-0.5 rounded">
                      Executive Sponsor
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={profile.incumbency_strength === 'High' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white/80 border-blue-200 text-blue-700'}>
                    {profile.incumbency_strength} Incumbency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 text-sm pt-4">
                <div className="space-y-3">
                  {/* Risk / Opps */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-bold mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Readiness
                      </p>
                      <p className="text-xs text-emerald-900 font-medium line-clamp-2">{profile.account_review_cadence || '-'}</p>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-700 font-bold mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Risk
                      </p>
                      <p className="text-xs text-amber-900 font-medium truncate" title={profile.succession_risk}>{profile.succession_risk || 'None'}</p>
                    </div>
                  </div>
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
    </MainLayout >
  );
};

export default Stakeholders;
