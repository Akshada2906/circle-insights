import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountForm } from '@/components/accounts/AccountForm';
import { Button } from '@/components/ui/button';
import { Account } from '@/types/account';
import { useToast } from '@/hooks/use-toast';
import { useAccounts } from '@/contexts/AccountContext';
import { ArrowLeft } from 'lucide-react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { getFinanceAccounts, getFinanceAccountById } from '@/services/api';

const AccountFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accounts, addAccount, updateAccount, fetchAccount, getAccountById, fetchAccountStakeholders } = useAccounts();
    const { toast } = useToast();

    const [pendingUpdate, setPendingUpdate] = useState<Partial<Account> | null>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Finance data state for cross-referencing records
    const [financeData, setFinanceData] = useState<any>(null);
    const financeFetchedRef = useRef<string | null>(null);

    // Fetch primary legacy account details
    useEffect(() => {
        if (id) {
            fetchAccount(id);
        }
    }, [id, fetchAccount]);

    const contextAccountInit = getAccountById(id || '');

    // Fetch finance data by name or ID to establish parity with AccountDetails hydration logic
    useEffect(() => {
        if (!id) return;

        const hasValidName = contextAccountInit?.account_name && contextAccountInit.account_name.trim() !== '';
        if (financeFetchedRef.current === id && (financeData || hasValidName)) {
            return;
        }

        const fetchFinance = async () => {
            try {
                const allFinanceAccounts = await getFinanceAccounts();
                let match = allFinanceAccounts.find((a: any) => a.id === id);

                if (!match && contextAccountInit?.account_name) {
                    const searchName = contextAccountInit.account_name.trim().toLowerCase();
                    if (searchName) {
                        match = allFinanceAccounts.find((a: any) => {
                            const financeName = (a.name || a.account_name || "").trim().toLowerCase();
                            return financeName === searchName || financeName.includes(searchName) || searchName.includes(financeName);
                        });
                    }
                }

                if (match) {
                    financeFetchedRef.current = id;
                    const data = await getFinanceAccountById(match.id);
                    setFinanceData(data);
                } else {
                    if (hasValidName) {
                        financeFetchedRef.current = id;
                    }
                    setFinanceData(null);
                }
            } catch (error) {
                console.error("Failed to fetch finance data in form page:", error);
            }
        };

        fetchFinance();
    }, [id, contextAccountInit?.account_name]);

    // Resolve the true legacy dashboard account object by ID or by matching financeData.name
    const resolvedContextAccount = useMemo(() => {
        const byId = getAccountById(id || '');
        if (byId && byId.account_name?.trim()) return byId;

        if (financeData?.name) {
            const searchName = financeData.name.trim().toLowerCase();
            const byName = accounts.find(a => a.account_name?.trim().toLowerCase() === searchName);
            if (byName) return byName;
        }
        return byId;
    }, [id, getAccountById, financeData?.name, accounts]);

    // Ensure stakeholders are loaded if they are missing
    const realAccountId = resolvedContextAccount?.account_id;
    const hasProfiles = resolvedContextAccount?.strategic_profiles && resolvedContextAccount.strategic_profiles.length > 0;
    const stakeholdersFetchedRef = useRef<string | null>(null);

    useEffect(() => {
        if (realAccountId && !hasProfiles && stakeholdersFetchedRef.current !== realAccountId) {
            stakeholdersFetchedRef.current = realAccountId;
            fetchAccountStakeholders(realAccountId);
        }
    }, [realAccountId, hasProfiles, fetchAccountStakeholders]);

    const account = resolvedContextAccount;
    const isEditing = !!id;

    const confirmUpdate = async () => {
        if (!isEditing || !id || !pendingUpdate) return;

        setIsUpdating(true);
        const targetId = realAccountId || id;
        const success = await updateAccount(targetId, pendingUpdate);
        setIsUpdating(false);

        if (success) {
            navigate(`/accounts/${id}`);
        }
        setIsUpdateOpen(false);
        setPendingUpdate(null);
    };

    const handleSubmit = async (accountData: Partial<Account>) => {
        if (isEditing && id) {
            setPendingUpdate(accountData);
            setIsUpdateOpen(true);
        } else {
            // New account
            setIsCreating(true);
            const newAccount = {
                ...accountData,
                account_id: `acc-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                projects: [],
                stakeholders: [],
                status: 'ACTIVE'
            } as any;

            const success = await addAccount(newAccount);
            setIsCreating(false);

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
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
                <AccountForm
                    account={account}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isCreating || isUpdating}
                />

                <ConfirmationDialog
                    open={isUpdateOpen}
                    onOpenChange={setIsUpdateOpen}
                    title="Update Account"
                    description="Are you sure you want to update this account?"
                    onConfirm={confirmUpdate}
                    confirmText="Update Account"
                    isLoading={isUpdating}
                />
            </div>
        </MainLayout>
    );
};

export default AccountFormPage;
