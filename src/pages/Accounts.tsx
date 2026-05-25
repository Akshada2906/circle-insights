import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountsList } from '@/components/accounts/AccountsList';
import { useAccounts } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { getPrivateEquities, getFinanceAccounts } from '@/services/api';

const Accounts = () => {
    const { accounts, deleteAccount, refreshAccounts } = useAccounts();
    const { toast } = useToast();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [peFirms, setPeFirms] = useState<any[]>([]);
    const [peAccounts, setPeAccounts] = useState<any[]>([]);
    const [salesAccounts, setSalesAccounts] = useState<any[]>([]);

    useEffect(() => {
        fetchFirms();
    }, []);

    const fetchFirms = async () => {
        try {
            const [firmsData, accountsData] = await Promise.all([
                getPrivateEquities(),
                getFinanceAccounts()
            ]);

            const enrichedFirms = firmsData.map((firm: any) => {
                const firmAccounts = accountsData.filter((a: any) => a.private_equity_id === firm.id);
                const totalRev = firmAccounts.reduce((sum: number, a: any) => sum + (a.current_revenue || a.total_revenue || 0), 0);
                return {
                    ...firm,
                    portfolio_size: firmAccounts.length,
                    total_revenue: totalRev
                };
            });

            setPeFirms(enrichedFirms);
            setPeAccounts(accountsData.filter((a: any) => a.private_equity_id));

            const salesData = accountsData.filter((a: any) => !a.private_equity_id).map((a: any) => ({
                account_id: a.id,
                account_name: a.name,
                domain: '',
                delivery_owner: a.account_manager || '',
                current_pipeline_value: a.forecast_revenue ? `$${a.forecast_revenue.toLocaleString()}` : '$0',
                number_of_active_projects: a.active_project_count || 0,
                overall_delivery_health: a.active_project_count > 0 ? 'Green' : 'Amber',
                engagement_age: '',
                last_year_business_done: a.current_revenue ? `$${a.current_revenue.toLocaleString()}` : '$0',
                target_projection_2026_accounts: a.target_revenue ? `$${a.target_revenue.toLocaleString()}` : '$0',
                company_revenue: a.target_revenue ? `$${a.target_revenue.toLocaleString()}` : '$0',
                engagement_models: '',
                created_at: a.created_at || new Date().toISOString(),
                updated_at: a.updated_at || new Date().toISOString(),
                projects: a.projects || [],
                status: 'ACTIVE',
                delivery_unit: a.delivery_unit,
                id: a.id,
                name: a.name,
                account_manager: a.account_manager,
                target_revenue: a.target_revenue,
                current_revenue: a.current_revenue,
                ai_revenue: a.ai_revenue,
                active_project_count: a.active_project_count,
                inactive_project_count: a.inactive_project_count,
                ai_penetration_pct: a.ai_penetration_pct,
                project_count: a.project_count,
                is_sales: a.is_sales
            }));
            setSalesAccounts(salesData);
        } catch (err) {
            console.error('Failed to fetch PE firms:', err);
        }
    };

    const handleDelete = (accountId: string) => {
        setDeleteId(accountId);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            const success = await deleteAccount(deleteId);
            if (success) {
                toast({
                    title: 'Account deleted',
                    description: 'The account has been successfully deleted.',
                });
                await fetchFirms();
            }
        } catch (error) {
            console.error("Failed to delete account", error);
            toast({
                title: 'Error',
                description: 'Failed to delete account.',
                variant: 'destructive'
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AccountsList accounts={salesAccounts as any} peFirms={peFirms} peAccounts={peAccounts} onDelete={handleDelete} onRefresh={fetchFirms} />

                <ConfirmationDialog
                    open={isDeleteOpen}
                    onOpenChange={setIsDeleteOpen}
                    title="Delete Account"
                    description="Are you sure you want to delete this account? This action cannot be undone and will remove all associated data."
                    onConfirm={confirmDelete}
                    variant="destructive"
                    confirmText="Delete Account"
                    isLoading={isDeleting}
                />
            </div>
        </MainLayout>
    );
};

export default Accounts;
