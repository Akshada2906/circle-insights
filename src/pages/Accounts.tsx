import { MainLayout } from '@/components/layout/MainLayout';
import { AccountsList } from '@/components/accounts/AccountsList';
import { useAccounts } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';

const Accounts = () => {
    const { accounts, deleteAccount } = useAccounts();
    const { toast } = useToast();

    const handleDelete = (accountId: string) => {
        // Show confirmation dialog
        const confirmed = window.confirm('Are you sure you want to delete this account?');
        if (confirmed) {
            deleteAccount(accountId);
            toast({
                title: 'Account deleted',
                description: 'The account has been successfully deleted.',
            });
        }
    };

    // Filter accounts if needed, but AccountsList handles internal filtering mostly
    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AccountsList accounts={accounts} onDelete={handleDelete} />
            </div>
        </MainLayout>
    );
};

export default Accounts;
