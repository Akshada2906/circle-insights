import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountWithProjects, StrategicStakeholderProfile } from '@/types/account';
import { AccountCard } from './AccountCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase, FileSpreadsheet, FileText, Download, Upload, X, Loader2 } from 'lucide-react';
import { deliveryUnits } from '@/constants';
import { exportMultipleTablesToPDF, exportMultipleSheetsFormattedAoAToExcel } from '@/lib/exportUtils';
import { api, uploadImportProjectFile, uploadImportRevenueFile, deleteFinanceAccount } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx-js-style';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { PEAccountCard } from './PEAccountCard';
import { FinancialAccountCard } from './FinancialAccountCard';

interface AccountsListProps {
    accounts: AccountWithProjects[];
    peFirms?: any[];
    peAccounts?: any[];
    onEdit?: (accountId: string) => void;
    onDelete?: (accountId: string) => void;
    onRefresh?: () => Promise<void>;
}

export function AccountsList({ accounts, peFirms = [], peAccounts = [], onEdit, onDelete, onRefresh }: AccountsListProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Sales' | 'PE'>('All');
    const [showAll, setShowAll] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTab, setImportTab] = useState<'pe' | 'pmo' | 'revenue'>('pe');
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<any[]>([]);
    const { toast } = useToast();

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            if (importTab === 'pmo') {
                await uploadImportProjectFile(file);
                toast({ title: "Success", description: "PMO data imported successfully." });
            } else if (importTab === 'revenue') {
                await uploadImportRevenueFile(file);
                toast({ title: "Success", description: "Revenue data imported successfully." });
            } else {
                // Mock PE import
                toast({ title: "Success", description: "PE data imported successfully." });
            }
            if (onRefresh) await onRefresh();
            setPendingFiles([]);
            setIsImportModalOpen(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Upload failed", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setPendingFiles([{ id: '1', name: file.name, size: `${(file.size / (1024*1024)).toFixed(1)} MB`, status: 'uploading' }]);
            handleFileUpload(file);
        }
    };

    const parseCurrency = (val: string | undefined) => {
        if (!val) return 0;
        return parseFloat(val.replace(/[$,]/g, '')) || 0;
    };

    const sortedAccounts = [...accounts].sort((a, b) =>
        parseCurrency(b.last_year_business_done) - parseCurrency(a.last_year_business_done)
    );

    const salesAccounts = sortedAccounts.map(acc => ({
        id: acc.account_id,
        name: acc.account_name,
        type: acc.private_equity_id ? 'PE_Account' : 'Sales',
        originalData: acc,
    }));

    const pePortfolioItems = (peAccounts || []).map(acc => ({
        id: acc.id,
        name: acc.name,
        type: 'PE_Portfolio',
        originalData: acc,
    }));

    const privateEquities = (peFirms || []).map(firm => ({
        id: firm.id,
        name: firm.name,
        type: 'PE',
        originalData: firm,
    }));

    const combinedList = [...salesAccounts, ...pePortfolioItems, ...privateEquities];

    const filteredList = combinedList.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;
        
        if (filterType === 'All' && item.type === 'PE') return false;
        if (filterType === 'Sales' && item.type !== 'Sales') return false;
        if (filterType === 'PE' && item.type !== 'PE') return false;

        return true;
    });

    const displayedItems = (showAll || searchQuery !== '' || filterType !== 'All')
        ? filteredList
        : filteredList.slice(0, 10);

    const handleExportExcel = async () => {
        const filteredAccounts = filteredList.filter(item => item.type === 'Sales' || item.type === 'PE_Account').map(item => item.originalData);
        if (filteredAccounts.length === 0) return;

        // Fetch all stakeholders to include in the export
        let allStakeholders: StrategicStakeholderProfile[] = [];
        try {
            const data = await api.getAllStakeholders();
            allStakeholders = data.map((apiDetails: any) => ({
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
            }));
        } catch (error) {
            console.error("Failed to fetch stakeholders for export", error);
        }

        // Filter stakeholders to only include those from the filtered accounts
        const filteredAccountIds = new Set(filteredAccounts.map(acc => acc.account_id));
        const profiles = allStakeholders.filter(p => p.account_id && filteredAccountIds.has(p.account_id));

        // --- SHEET 1: Account Dashboard ---
        const accountHeaderRow = ['Account Name', ...filteredAccounts.map(acc => acc.account_name)];
        const val = (v: any) => v !== null && v !== undefined ? v : '';
        const boolVal = (v: any) => v ? 'Yes' : 'No';

        const accountDataRows = [
            ['Domain', ...filteredAccounts.map(acc => val(acc.domain))],
            ['Account Focus (Platinum/Gold/Silver)', ...filteredAccounts.map(acc => val(acc.account_focus))],
            ['Engagement Age (As of Jan 2026)', ...filteredAccounts.map(acc => val(acc.engagement_age))],
            ['Account Research Link', ...filteredAccounts.map(acc => val(acc.account_research_link))],
            ['Company Revenue (USD)', ...filteredAccounts.map(acc => val(acc.company_revenue))],
            ['Last Year Business Done (USD)', ...filteredAccounts.map(acc => val(acc.last_year_business_done))],
            ['Target Projection 2026 (Accounts Team)', ...filteredAccounts.map(acc => val(acc.target_projection_2026_accounts))],
            ['Target Projection 2026 (Delivery)', ...filteredAccounts.map(acc => val(acc.target_projection_2026_delivery))],
            ['Current Pipeline Value (Next 6-12 Months)', ...filteredAccounts.map(acc => val(acc.current_pipeline_value))],
            ['Revenue Attrition / Leakage Possibility', ...filteredAccounts.map(acc => val(acc.revenue_attrition_possibility))],
            ['Delivery Owner', ...filteredAccounts.map(acc => val(acc.delivery_owner))],
            ['Team Size', ...filteredAccounts.map(acc => val(acc.team_size))],
            ['Overall Delivery Health', ...filteredAccounts.map(acc => val(acc.overall_delivery_health))],
            ['Rate Card Health', ...filteredAccounts.map(acc => val(acc.current_rate_card_health))],
            ['Number of Active Projects', ...filteredAccounts.map(acc => val(acc.number_of_active_projects))],
            ['Engagement Models', ...filteredAccounts.map(acc => val(acc.engagement_models))],
            ['Current Engagement Areas', ...filteredAccounts.map(acc => val(acc.current_engagement_areas))],
            ['Do We Know Customer Value Chain?', ...filteredAccounts.map(acc => boolVal(acc.know_customer_value_chain))],
            ['Where We Fit in Value Chain', ...filteredAccounts.map(acc => val(acc.where_we_fit_in_value_chain))],
            ['Visibility of Client Roadmap 2026', ...filteredAccounts.map(acc => val(acc.visibility_client_roadmap_2026))],
            ['Identified Cross/Up Selling Areas', ...filteredAccounts.map(acc => val(acc.identified_areas_cross_up_selling))],
            ['30 Days Growth Action Plan Ready?', ...filteredAccounts.map(acc => boolVal(acc.growth_action_plan_30days_ready))],
            ['Client Partner', ...filteredAccounts.map(acc => val(acc.client_partner))],
            ['Champion @ Customer Side', ...filteredAccounts.map(acc => val(acc.champion_customer_side))],
            ['Champion Profile', ...filteredAccounts.map(acc => val(acc.champion_profile))],
            ['Nitor Exec Connect Frequency', ...filteredAccounts.map(acc => val(acc.nitor_executive_connect_frequency))],
            ['Current NPS', ...filteredAccounts.map(acc => val(acc.current_nps))],
            ['Total Active Connects', ...filteredAccounts.map(acc => val(acc.total_active_connects))],
            ['Connect with Decision Maker?', ...filteredAccounts.map(acc => boolVal(acc.connect_with_decision_maker))],
        ];

        const accountExportData = [accountHeaderRow, ...accountDataRows];
        const accountCols = [{ wch: 40 }, ...filteredAccounts.map(() => ({ wch: 25 }))];
        const accountStyles: Record<string, any> = {};

        const headerStyle = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "595959" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true }
        };

        const fieldLabelStyle = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "595959" } },
            alignment: { horizontal: "left", vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "FFFFFF" } },
                bottom: { style: "thin", color: { rgb: "FFFFFF" } },
                left: { style: "thin", color: { rgb: "FFFFFF" } },
                right: { style: "thin", color: { rgb: "FFFFFF" } }
            }
        };

        for (let c = 1; c < accountHeaderRow.length; c++) {
            accountStyles[XLSX.utils.encode_cell({ r: 0, c })] = headerStyle;
        }

        for (let r = 0; r < accountExportData.length; r++) {
            accountStyles[XLSX.utils.encode_cell({ r, c: 0 })] = fieldLabelStyle;
        }

        // --- SHEET 2: Stakeholder Matrix ---
        const stakeholderHeaderRow = ['Account Name', ...profiles.map(p => p.account_name)];
        const totalSHCols = stakeholderHeaderRow.length;

        const getSHVal = (p: StrategicStakeholderProfile, field: keyof StrategicStakeholderProfile) => {
            const val = p[field];
            return val !== null && val !== undefined ? val : '';
        };

        const stakeholderMappingRows = [
            ['Executive Sponsor', ...profiles.map(p => getSHVal(p, 'executive_sponsor'))],
            ['Technical Decision Maker', ...profiles.map(p => getSHVal(p, 'technical_decision_maker'))],
            ['Influencer/s', ...profiles.map(p => getSHVal(p, 'influencer'))],
            ['Neutral Stakeholders', ...profiles.map(p => getSHVal(p, 'neutral_stakeholders'))],
            ['Negative Stakeholder', ...profiles.map(p => getSHVal(p, 'negative_stakeholder'))],
            ['Succession Risk (Champion Leaving?)', ...profiles.map(p => getSHVal(p, 'succession_risk'))],
        ];

        const competitionRows = [
            ['Key Competitors in Account', ...profiles.map(p => getSHVal(p, 'key_competitors'))],
            ['Our Positioning vs Competition', ...profiles.map(p => getSHVal(p, 'our_positioning'))],
            ['Incumbency Strength', ...profiles.map(p => getSHVal(p, 'incumbency_strength'))],
            ['Areas Where Competition Is Stronger', ...profiles.map(p => getSHVal(p, 'areas_competition_stronger'))],
            ['White Spaces We Own Clearly', ...profiles.map(p => getSHVal(p, 'white_spaces_we_own'))],
        ];

        const readinessRows = [
            ['Account Review Cadence', ...profiles.map(p => getSHVal(p, 'account_review_cadence'))],
            ['QBR Happening?', ...profiles.map(p => getSHVal(p, 'qbr_happening'))],
            ['Technical Audit Frequency', ...profiles.map(p => getSHVal(p, 'technical_audit_frequency'))],
        ];

        const stakeholderData: any[][] = [];
        const stakeholderMerges: XLSX.Range[] = [];
        const stakeholderStyles: Record<string, any> = {};

        const stakeholderCols = [{ wch: 30 }, ...profiles.map(() => ({ wch: 20 }))];

        const sectionHeaderStyle = {
            font: { bold: true, sz: 14 },
            fill: { fgColor: { rgb: "FFC000" } }, // Orange-Gold background
            alignment: { horizontal: "center", vertical: "center", wrapText: true }
        };

        stakeholderData.push(stakeholderHeaderRow);

        stakeholderStyles[XLSX.utils.encode_cell({ r: 0, c: 0 })] = fieldLabelStyle;
        for (let c = 1; c < totalSHCols; c++) {
            stakeholderStyles[XLSX.utils.encode_cell({ r: 0, c })] = headerStyle;
        }

        if (profiles.length > 0) {
            const mappingHeaderRowIndex = stakeholderData.length;
            stakeholderData.push(['Stakeholder Mapping']);
            stakeholderMerges.push({ s: { r: mappingHeaderRowIndex, c: 0 }, e: { r: mappingHeaderRowIndex, c: totalSHCols - 1 } });
            stakeholderStyles[XLSX.utils.encode_cell({ r: mappingHeaderRowIndex, c: 0 })] = sectionHeaderStyle;

            for (let i = 0; i < stakeholderMappingRows.length; i++) {
                stakeholderStyles[XLSX.utils.encode_cell({ r: mappingHeaderRowIndex + 1 + i, c: 0 })] = fieldLabelStyle;
            }
            stakeholderData.push(...stakeholderMappingRows);

            const competitionHeaderRowIndex = stakeholderData.length;
            stakeholderData.push(['Competition & Positioning']);
            stakeholderMerges.push({ s: { r: competitionHeaderRowIndex, c: 0 }, e: { r: competitionHeaderRowIndex, c: totalSHCols - 1 } });
            stakeholderStyles[XLSX.utils.encode_cell({ r: competitionHeaderRowIndex, c: 0 })] = sectionHeaderStyle;

            for (let i = 0; i < competitionRows.length; i++) {
                stakeholderStyles[XLSX.utils.encode_cell({ r: competitionHeaderRowIndex + 1 + i, c: 0 })] = fieldLabelStyle;
            }
            stakeholderData.push(...competitionRows);

            const readinessHeaderRowIndex = stakeholderData.length;
            stakeholderData.push(['Internal Readiness']);
            stakeholderMerges.push({ s: { r: readinessHeaderRowIndex, c: 0 }, e: { r: readinessHeaderRowIndex, c: totalSHCols - 1 } });
            stakeholderStyles[XLSX.utils.encode_cell({ r: readinessHeaderRowIndex, c: 0 })] = sectionHeaderStyle;

            for (let i = 0; i < readinessRows.length; i++) {
                stakeholderStyles[XLSX.utils.encode_cell({ r: readinessHeaderRowIndex + 1 + i, c: 0 })] = fieldLabelStyle;
            }
            stakeholderData.push(...readinessRows);
        }

        exportMultipleSheetsFormattedAoAToExcel([
            {
                sheetName: 'Account Dashboard',
                data: accountExportData,
                cols: accountCols,
                styles: accountStyles
            },
            {
                sheetName: 'Stakeholder Matrix',
                data: stakeholderData,
                merges: stakeholderMerges,
                cols: stakeholderCols,
                styles: stakeholderStyles
            }
        ], 'Accounts_and_Stakeholders_Data');
    };

    const handleExportPDF = () => {
        const filteredAccountsExport = filteredList.filter(item => item.type === 'Sales').map(item => item.originalData);
        if (filteredAccountsExport.length === 0) return;

        const allTables: { title: string; data: any[]; columns: { header: string; dataKey: string }[] }[] = [];

        filteredAccountsExport.forEach((account, index) => {
            const generalData = [{
                'Account': account.account_name,
                'Domain': account.domain || '-',
                'Focus': account.account_focus || '-',
                'Age': account.engagement_age || '-',
                'Research Link': account.account_research_link || '-'
            }];

            const financialsData = [{
                'Revenue': account.company_revenue?.toLocaleString() || '-',
                'Last Year': account.last_year_business_done?.toLocaleString() || '-',
                'Pipeline': account.current_pipeline_value?.toLocaleString() || '-',
                'Tgt Accts': account.target_projection_2026_accounts?.toLocaleString() || '-',
                'Tgt Del': account.target_projection_2026_delivery?.toLocaleString() || '-',
                'Attrition': account.revenue_attrition_possibility || '-'
            }];

            const deliveryData = [{
                'Owner': account.delivery_owner || '-',
                'Size': account.team_size || '-',
                'Health': account.overall_delivery_health || '-',
                'Rate Card': account.current_rate_card_health || '-',
                'Projects': account.number_of_active_projects || '-',
                'Models': account.engagement_models || '-',
                'Engagement Areas': account.current_engagement_areas || '-'
            }];

            const strategyData = [{
                'VC Known': account.know_customer_value_chain ? 'Yes' : 'No',
                'Roadmap': account.visibility_client_roadmap_2026 || '-',
                'Partner': account.client_partner || '-',
                'Champion': account.champion_customer_side || '-',
                'NPS': account.current_nps || '-',
                'Connects': account.total_active_connects || '-'
            }];

            const strategicDetailsData = [{
                'VC Fit': account.where_we_fit_in_value_chain || '-',
                'Cross/Up Sell': account.identified_areas_cross_up_selling || '-',
                'Growth Plan': account.growth_action_plan_30days_ready ? 'Yes' : 'No',
                'Champ Profile': account.champion_profile || '-',
                'Exec Freq': account.nitor_executive_connect_frequency || '-',
                'DM Connect': account.connect_with_decision_maker ? 'Yes' : 'No'
            }];

            const createTable = (title: string, data: any[]) => ({
                title,
                data,
                columns: Object.keys(data[0]).map(key => ({ header: key, dataKey: key }))
            });

            allTables.push(createTable(`Account ${index + 1}: ${account.account_name} - General`, generalData));
            allTables.push(createTable(`Financials`, financialsData));
            allTables.push(createTable(`Delivery & Operations`, deliveryData));
            allTables.push(createTable(`Strategy & Relationships`, strategyData));
            allTables.push(createTable(`Additional Strategic Details`, strategicDetailsData));
        });

        exportMultipleTablesToPDF(
            allTables,
            'All_Accounts_Export',
            'landscape',
            'All Accounts Strategic Export'
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                        Accounts
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your accounts and strategic customer relationships</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/accounts/new')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>

                    <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-blue-600 border-blue-700 text-white hover:bg-blue-700 hover:border-blue-800 shadow-sm">
                                <Upload className="w-4 h-4" />
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                                <DialogTitle className="text-xl font-bold text-slate-900">Import Data</DialogTitle>
                                <DialogDescription>Upload PE, PMO, or Revenue data files.</DialogDescription>
                            </DialogHeader>
                            <div className="p-8 space-y-6">
                                <Tabs value={importTab} onValueChange={(v: any) => setImportTab(v)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100/50 p-1 rounded-xl">
                                        <TabsTrigger value="pe" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">PE Data</TabsTrigger>
                                        <TabsTrigger value="pmo" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">PMO Data</TabsTrigger>
                                        <TabsTrigger value="revenue" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Revenue Data</TabsTrigger>
                                    </TabsList>
                                    <div className="mt-6">
                                        <div
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            onClick={() => document.getElementById('global-import-input')?.click()}
                                            className={cn(
                                                "min-h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-8 transition-all duration-300 cursor-pointer",
                                                isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/30"
                                            )}
                                        >
                                            <input
                                                type="file"
                                                id="global-import-input"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setPendingFiles([{ id: '1', name: file.name, size: `${(file.size / (1024*1024)).toFixed(1)} MB`, status: 'uploading' }]);
                                                        handleFileUpload(file);
                                                    }
                                                }}
                                            />
                                            {uploading ? (
                                                <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-4 mx-auto w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-4 mx-auto w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                            )}
                                            <p className="text-slate-900 font-bold">
                                                {uploading ? 'Uploading...' : <>Drag & Drop files here or <span className="text-blue-600 underline cursor-pointer">Browse File</span></>}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-2 font-medium">
                                                Max 50 MB per file
                                            </p>
                                        </div>

                                        <div className="space-y-2 max-h-[150px] overflow-y-auto mt-6">
                                            {pendingFiles.map(file => (
                                                <div key={file.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between bg-white">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{file.size}</span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-blue-500 uppercase leading-none mt-0.5 animate-pulse">Uploading...</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-100">
                                            <Button 
                                                variant="outline" 
                                                className="rounded-xl h-11 px-8 font-semibold border-slate-200 text-slate-600"
                                                onClick={() => {
                                                    setPendingFiles([]);
                                                    setIsImportModalOpen(false);
                                                }}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </Tabs>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-blue-600 border-blue-700 text-white hover:bg-blue-700 hover:border-blue-800">
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportExcel}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export to Excel
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={handleExportPDF}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to PDF
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 animate-in fade-in duration-300 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search sales or private equity accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-slate-200 bg-white"
                    />
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-lg self-stretch sm:self-auto shrink-0 shadow-inner overflow-x-auto">
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setFilterType('All')}
                       className={cn("px-4 rounded-md transition-all whitespace-nowrap", filterType === 'All' ? 'bg-white text-slate-900 shadow-sm hover:bg-white font-medium' : 'text-slate-600 hover:text-slate-900')}
                    >
                       All
                    </Button>
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setFilterType('Sales')}
                       className={cn("px-4 rounded-md transition-all whitespace-nowrap", filterType === 'Sales' ? 'bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-50 font-medium' : 'text-slate-600 hover:text-blue-600')}
                    >
                       Sales
                    </Button>
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setFilterType('PE')}
                       className={cn("px-4 rounded-md transition-all whitespace-nowrap", filterType === 'PE' ? 'bg-purple-50 text-purple-700 shadow-sm hover:bg-purple-50 font-medium' : 'text-slate-600 hover:text-purple-600')}
                    >
                       Private Equity
                    </Button>
                </div>
                {filteredList.length > 10 && searchQuery === "" && filterType === 'All' && (
                    <Button
                        variant="outline"
                        onClick={() => setShowAll(!showAll)}
                        className="h-11 px-6 font-semibold border-slate-200 hover:border-blue-300 hover:bg-white text-blue-600 transition-all whitespace-nowrap shadow-sm"
                    >
                        {showAll ? "Show Top 10 Only" : `View All (${filteredList.length})`}
                    </Button>
                )}
            </div>

            {/* Accounts Grid */}
            {displayedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {displayedItems.map((item) => (
                        item.type === 'PE_Portfolio' ? (
                            <FinancialAccountCard
                                key={`pe-portfolio-${item.id}`}
                                account={item.originalData}
                                onDelete={async (id) => {
                                    try {
                                        await deleteFinanceAccount(id);
                                        toast({ title: "Success", description: "Account deleted successfully" });
                                        if (onRefresh) await onRefresh();
                                    } catch (err: any) {
                                        toast({ title: "Error", description: err.message || "Failed to delete account", variant: "destructive" });
                                    }
                                }}
                            />
                        ) : (item.type === 'Sales' || item.type === 'PE_Account') ? (
                            <AccountCard
                                key={`sales-${item.id}`}
                                account={item.originalData}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ) : (
                            <PEAccountCard
                                key={`pe-${item.id}`}
                                firm={item.originalData}
                            />
                        )
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Briefcase className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No accounts found</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        {searchQuery
                            ? 'Try adjusting your search'
                            : 'Get started by creating your first account'}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => navigate('/accounts/new')} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create First Account
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
