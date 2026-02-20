import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountWithProjects } from '@/types/account';
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
import { Plus, Search, Briefcase, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { deliveryUnits } from '@/constants';
import { exportToExcel, exportMultipleTablesToPDF, exportFormattedAoAToExcel } from '@/lib/exportUtils';
import * as XLSX from 'xlsx-js-style';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AccountsListProps {
    accounts: AccountWithProjects[];
    onEdit?: (accountId: string) => void;
    onDelete?: (accountId: string) => void;
    onRefresh?: () => Promise<void>;
}

export function AccountsList({ accounts, onEdit, onDelete }: AccountsListProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.account_id.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const handleExportExcel = () => {
        // Headers (Account Names)
        const headerRow = ['Account Name', ...filteredAccounts.map(acc => acc.account_name)];

        // Helper to get safe string value
        const val = (v: any) => v !== null && v !== undefined ? v : '';
        const boolVal = (v: any) => v ? 'Yes' : 'No';

        // Data Rows
        const dataRows = [
            // --- General Information ---
            ['Domain', ...filteredAccounts.map(acc => val(acc.domain))],
            ['Account Focus (Platinum/Gold/Silver)', ...filteredAccounts.map(acc => val(acc.account_focus))],
            ['Engagement Age (As of Jan 2026)', ...filteredAccounts.map(acc => val(acc.engagement_age))],
            ['Account Research Link', ...filteredAccounts.map(acc => val(acc.account_research_link))],

            // --- Financials ---
            ['Company Revenue (USD)', ...filteredAccounts.map(acc => val(acc.company_revenue))],
            ['Last Year Business Done (USD)', ...filteredAccounts.map(acc => val(acc.last_year_business_done))],
            ['Target Projection 2026 (Accounts Team)', ...filteredAccounts.map(acc => val(acc.target_projection_2026_accounts))],
            ['Target Projection 2026 (Delivery)', ...filteredAccounts.map(acc => val(acc.target_projection_2026_delivery))],
            ['Current Pipeline Value (Next 6-12 Months)', ...filteredAccounts.map(acc => val(acc.current_pipeline_value))],
            ['Revenue Attrition / Leakage Possibility', ...filteredAccounts.map(acc => val(acc.revenue_attrition_possibility))],

            // --- Delivery & Operations ---
            // Removed: Delivery Unit
            ['Delivery Owner', ...filteredAccounts.map(acc => val(acc.delivery_owner))],
            ['Team Size', ...filteredAccounts.map(acc => val(acc.team_size))],
            ['Overall Delivery Health', ...filteredAccounts.map(acc => val(acc.overall_delivery_health))],
            ['Rate Card Health', ...filteredAccounts.map(acc => val(acc.current_rate_card_health))],
            ['Number of Active Projects', ...filteredAccounts.map(acc => val(acc.number_of_active_projects))],
            ['Engagement Models', ...filteredAccounts.map(acc => val(acc.engagement_models))],
            ['Current Engagement Areas', ...filteredAccounts.map(acc => val(acc.current_engagement_areas))],

            // --- Strategy & Value Chain ---
            ['Do We Know Customer Value Chain?', ...filteredAccounts.map(acc => boolVal(acc.know_customer_value_chain))],
            ['Where We Fit in Value Chain', ...filteredAccounts.map(acc => val(acc.where_we_fit_in_value_chain))],
            ['Visibility of Client Roadmap 2026', ...filteredAccounts.map(acc => val(acc.visibility_client_roadmap_2026))],
            ['Identified Cross/Up Selling Areas', ...filteredAccounts.map(acc => val(acc.identified_areas_cross_up_selling))],
            ['30 Days Growth Action Plan Ready?', ...filteredAccounts.map(acc => boolVal(acc.growth_action_plan_30days_ready))],

            // --- Stakeholders & Relationships (Account Level) ---
            ['Client Partner', ...filteredAccounts.map(acc => val(acc.client_partner))],
            ['Champion @ Customer Side', ...filteredAccounts.map(acc => val(acc.champion_customer_side))],
            ['Champion Profile', ...filteredAccounts.map(acc => val(acc.champion_profile))],
            ['Nitor Exec Connect Frequency', ...filteredAccounts.map(acc => val(acc.nitor_executive_connect_frequency))],
            ['Current NPS', ...filteredAccounts.map(acc => val(acc.current_nps))],
            ['Total Active Connects', ...filteredAccounts.map(acc => val(acc.total_active_connects))],
            ['Connect with Decision Maker?', ...filteredAccounts.map(acc => boolVal(acc.connect_with_decision_maker))],
        ];

        const exportData = [headerRow, ...dataRows];

        const cols = [
            { wch: 40 },
            ...filteredAccounts.map(() => ({ wch: 25 }))
        ];

        const styles: Record<string, any> = {};

        const accountHeaderStyle = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "595959" } }, // Dark gray background (matching template)
            alignment: { horizontal: "center", vertical: "center", wrapText: true }
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

        // Apply style to account name headers (B1, C1, D1... - starting from column 1)
        const totalCols = headerRow.length;
        for (let c = 1; c < totalCols; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
            styles[cellAddress] = accountHeaderStyle;
        }

        // Apply style to all field labels in Column A (starting from row 0 - includes A1)
        const totalRows = exportData.length;
        for (let r = 0; r < totalRows; r++) {
            const cellAddress = XLSX.utils.encode_cell({ r, c: 0 });
            styles[cellAddress] = fieldLabelStyle;
        }

        exportFormattedAoAToExcel(exportData, 'Account_Dashboard_Transposed', undefined, styles, cols);
    };

    const handleExportPDF = () => {
        if (filteredAccounts.length === 0) return;

        const allTables: { title: string; data: any[]; columns: { header: string; dataKey: string }[] }[] = [];

        filteredAccounts.forEach((account, index) => {
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
                    <h1 className="text-3xl font-bold text-foreground">
                        Accounts
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/accounts/new')} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Account
                    </Button>
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
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search accounts by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Accounts Grid */}
            {filteredAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                        <AccountCard
                            key={account.account_id}
                            account={account}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
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
