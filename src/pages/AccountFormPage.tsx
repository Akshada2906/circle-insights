import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountForm } from '@/components/accounts/AccountForm';
import { Button } from '@/components/ui/button';
import { Account } from '@/types/account';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/contexts/AccountContext';
import { ArrowLeft } from 'lucide-react';

const AccountFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accounts, addAccount, updateAccount } = useAccounts();
    const { toast } = useToast();

    // Get account from context instead of mock file
    const account = id ? accounts.find(a => a.account_id === id) : undefined;
    const isEditing = !!id;

    const handleSubmit = async (accountData: Partial<Account>) => {
        if (isEditing && id) {
            const success = await updateAccount(id, accountData);
            if (success) {
                navigate(`/accounts/${id}`);
            }
        } else {
            // New account
            const newAccount = {
                ...accountData,
                account_id: `acc-${Date.now()}`,
                account_health_score: 50, // Default
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                projects: [],
                stakeholders: [],
                status: 'ACTIVE'
            } as any;

            const success = await addAccount(newAccount);
            if (success) {
                navigate('/accounts');
            }
        }
    };
    const handleCancel = () => {
        if (isEditing && id) {
            navigate(`/accounts/${id}`);
        } else {
            navigate('/accounts');
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={handleCancel} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {isEditing ? 'Edit Account' : 'Create New Account'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? 'Update the account information below'
                            : 'Add a new client account to the system'}
                    </p>
                </div>

                {/* Account Form */}
                <AccountForm account={account} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        </MainLayout>
    );
};

export default AccountFormPage;
