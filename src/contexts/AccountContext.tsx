import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AccountWithProjects, Project } from '@/types/account';
import { api } from '@/services/api';
import { AccountDashboardResponse, AccountDashboardCreate, AccountDashboardUpdate } from '@/types/dashboard-api';
import { useToast } from '@/hooks/use-toast';

interface AccountContextType {
    accounts: AccountWithProjects[];
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    addAccount: (account: AccountWithProjects) => Promise<boolean>;
    updateAccount: (accountId: string, updates: Partial<AccountWithProjects>) => Promise<boolean>;
    deleteAccount: (accountId: string) => Promise<boolean>;
    addProject: (project: Project) => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (projectId: string) => void;
    getAccountById: (id: string) => AccountWithProjects | undefined;
    refreshAccounts: () => Promise<void>;
    fetchAccount: (accountId: string) => Promise<void>;
    fetchAccountStakeholders: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Mapper function to convert API response to frontend AccountWithProjects
const mapApiToAccount = (apiAccount: AccountDashboardResponse): AccountWithProjects => {
    return {
        account_id: apiAccount.account_id,
        account_name: apiAccount.account_name,
        domain: apiAccount.domain,
        company_revenue: apiAccount.company_revenue,
        know_customer_value_chain: apiAccount.know_customer_value_chain,
        account_focus: apiAccount.account_focus as any,
        delivery_owner: apiAccount.delivery_owner,
        client_partner: apiAccount.client_partner,
        where_we_fit_in_value_chain: apiAccount.where_we_fit_in_value_chain,
        engagement_age: apiAccount.engagement_age,
        last_year_business_done: apiAccount.last_year_business_done,
        target_projection_2026_accounts: apiAccount.target_projection_2026_accounts,
        target_projection_2026_delivery: apiAccount.target_projection_2026_delivery,
        current_pipeline_value: apiAccount.current_pipeline_value,
        revenue_attrition_possibility: apiAccount.revenue_attrition_possibility,
        current_engagement_areas: apiAccount.current_engagement_areas,
        team_size: apiAccount.team_size,
        engagement_models: apiAccount.engagement_models,
        current_rate_card_health: apiAccount.current_rate_card_health as any,
        number_of_active_projects: apiAccount.number_of_active_projects,
        overall_delivery_health: apiAccount.overall_delivery_health,
        current_nps: apiAccount.current_nps,
        champion_customer_side: apiAccount.champion_customer_side,
        champion_profile: apiAccount.champion_profile,
        connect_with_decision_maker: apiAccount.connect_with_decision_maker,
        total_active_connects: apiAccount.total_active_connects,
        visibility_client_roadmap_2026: apiAccount.visibility_client_roadmap_2026,
        nitor_executive_connect_frequency: apiAccount.nitor_executive_connect_frequency,
        growth_action_plan_30days_ready: apiAccount.growth_action_plan_30days_ready,
        account_research_link: apiAccount.account_research_link,

        created_at: apiAccount.created_at,
        updated_at: apiAccount.updated_at,

        projects: [],
        status: 'ACTIVE', // Default
    };
};
const mapApiToStrategicProfile = (apiDetails: any): any => {
    return {
        id: apiDetails.id,
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

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<AccountWithProjects[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();




    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getAccounts();
            const mappedAccounts = data.map(mapApiToAccount);
            setAccounts(mappedAccounts);
        } catch (err: any) {
            console.error("Failed to fetch accounts:", err);
            setError(err.message || 'Failed to fetch accounts');
            toast({
                title: 'Error',
                description: 'Failed to load accounts. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const fetchAccount = useCallback(async (accountId: string) => {
        try {
            const accountData = await api.getAccountById(accountId);
            const mappedAccount = mapApiToAccount(accountData);

            setAccounts(prevAccounts => {
                const existingIndex = prevAccounts.findIndex(acc => acc.account_id === accountId);
                if (existingIndex >= 0) {
                    // Update existing account
                    const updated = [...prevAccounts];
                    updated[existingIndex] = { ...updated[existingIndex], ...mappedAccount };
                    return updated;
                } else {
                    // Add new account if not found
                    return [...prevAccounts, mappedAccount];
                }
            });
        } catch (e) {
            console.warn(`Failed to fetch account details for ${accountId}`, e);
        }
    }, []);

    const fetchAccountStakeholders = useCallback(async (accountId: string) => {
        try {
            const stakeholders = await api.getStakeholderDetailsByAccount(accountId);
            if (stakeholders && stakeholders.length > 0) {
                const profile = mapApiToStrategicProfile(stakeholders[0]);

                setAccounts(prevAccounts => prevAccounts.map(acc => {
                    if (acc.account_id === accountId) {
                        return {
                            ...acc,
                            strategic_profiles: [profile],
                        };
                    }
                    return acc;
                }));
            }
        } catch (e) {
            console.warn(`Failed to fetch stakeholder details for account ${accountId}`, e);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const refreshAccounts = useCallback(async () => {
        await fetchAccounts();
    }, [fetchAccounts]);

    const addAccount = async (newAccount: AccountWithProjects): Promise<boolean> => {
        try {
            const apiPayload: AccountDashboardCreate = {
                account_name: newAccount.account_name,
                domain: newAccount.domain,
                know_customer_value_chain: newAccount.know_customer_value_chain,
                account_focus: newAccount.account_focus,
                delivery_owner: newAccount.delivery_owner,
                client_partner: newAccount.client_partner,
                where_we_fit_in_value_chain: newAccount.where_we_fit_in_value_chain,
                engagement_age: newAccount.engagement_age,
                last_year_business_done: newAccount.last_year_business_done,
                target_projection_2026_accounts: newAccount.target_projection_2026_accounts,
                target_projection_2026_delivery: newAccount.target_projection_2026_delivery,
                current_pipeline_value: newAccount.current_pipeline_value,
                revenue_attrition_possibility: newAccount.revenue_attrition_possibility,
                current_engagement_areas: newAccount.current_engagement_areas,
                team_size: newAccount.team_size,
                engagement_models: newAccount.engagement_models,
                current_rate_card_health: newAccount.current_rate_card_health,
                number_of_active_projects: newAccount.number_of_active_projects,
                overall_delivery_health: newAccount.overall_delivery_health,
                current_nps: newAccount.current_nps,
                champion_customer_side: newAccount.champion_customer_side,
                champion_profile: newAccount.champion_profile,
                connect_with_decision_maker: newAccount.connect_with_decision_maker,
                total_active_connects: newAccount.total_active_connects,
                visibility_client_roadmap_2026: newAccount.visibility_client_roadmap_2026,
                identified_areas_cross_up_selling: newAccount.identified_areas_cross_up_selling,
                nitor_executive_connect_frequency: newAccount.nitor_executive_connect_frequency,
                growth_action_plan_30days_ready: newAccount.growth_action_plan_30days_ready,
                account_research_link: newAccount.account_research_link,

            };

            const createdAccount = await api.createAccount(apiPayload);

            await fetchAccounts(); // Refresh list
            toast({
                title: 'Success',
                description: 'Account created successfully',
            });
            return true;
        } catch (err: any) {
            console.error("Failed to create account:", err);
            toast({
                title: 'Error',
                description: 'Failed to create account',
                variant: 'destructive',
            });
            return false;
        }
    };

    const updateAccount = async (accountId: string, updates: Partial<AccountWithProjects>): Promise<boolean> => {
        try {
            const apiPayload: AccountDashboardUpdate = {
                account_name: updates.account_name
            };
            Object.assign(apiPayload, {
                ...updates as any
            });

            await api.updateAccount(accountId, apiPayload);

            await fetchAccounts();
            toast({
                title: 'Success',
                description: 'Account updated successfully',
            });
            return true;
        } catch (err: any) {
            console.error("Failed to update account:", err);
            toast({
                title: 'Error',
                description: 'Failed to update account',
                variant: 'destructive',
            });
            return false;
        }
    };

    const deleteAccount = async (accountId: string): Promise<boolean> => {
        try {
            await api.deleteAccount(accountId);
            setAccounts((prev) => prev.filter((account) => account.account_id !== accountId));
            toast({
                title: 'Success',
                description: 'Account deleted successfully',
            });
            return true;
        } catch (err: any) {
            console.error("Failed to delete account:", err);
            toast({
                title: 'Error',
                description: 'Failed to delete account',
                variant: 'destructive',
            });
            return false;
        }
    };
    const addProject = (newProject: Project) => {
        setProjects((prev) => [...prev, newProject]);
    };

    const updateProject = (projectId: string, updates: Partial<Project>) => {
        setProjects((prev) =>
            prev.map((project) =>
                project.project_id === projectId ? { ...project, ...updates } : project
            )
        );
    };

    const deleteProject = (projectId: string) => {
        setProjects((prev) => prev.filter((project) => project.project_id !== projectId));
    };

    const getAccountById = (id: string) => {
        return accounts.find((acc) => acc.account_id === id);
    };

    return (
        <AccountContext.Provider
            value={{
                accounts,
                projects,
                isLoading,
                error,
                addAccount,
                updateAccount,
                deleteAccount,
                addProject,
                updateProject,
                deleteProject,
                getAccountById,
                refreshAccounts,
                fetchAccount,
                fetchAccountStakeholders,
            }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export const useAccounts = () => {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAccounts must be used within an AccountProvider');
    }
    return context;
};
