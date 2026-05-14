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

    useEffect(() => {
        refreshAccounts();
        fetchFirms();
    }, [refreshAccounts]);

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
            await deleteAccount(deleteId);
            toast({
                title: 'Account deleted',
                description: 'The account has been successfully deleted.',
            });
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
                <AccountsList accounts={accounts} peFirms={peFirms} peAccounts={peAccounts} onDelete={handleDelete} onRefresh={refreshAccounts} />

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
