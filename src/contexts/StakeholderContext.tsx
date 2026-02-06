import { createContext, useContext, useState, ReactNode } from 'react';
import { Stakeholder } from '@/types/account';

interface StakeholderContextType {
    stakeholders: Stakeholder[];
    addStakeholder: (stakeholder: Stakeholder) => void;
    updateStakeholder: (stakeholderId: string, data: Partial<Stakeholder>) => void;
    deleteStakeholder: (stakeholderId: string) => void;
    getStakeholdersByAccount: (accountId: string) => Stakeholder[];
}

const StakeholderContext = createContext<StakeholderContextType | undefined>(undefined);

export function StakeholderProvider({ children }: { children: ReactNode }) {
    const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

    const addStakeholder = (stakeholder: Stakeholder) => {
        setStakeholders((prev) => [...prev, stakeholder]);
    };

    const updateStakeholder = (stakeholderId: string, data: Partial<Stakeholder>) => {
        setStakeholders((prev) =>
            prev.map((s) => (s.stakeholder_id === stakeholderId ? { ...s, ...data } : s))
        );
    };

    const deleteStakeholder = (stakeholderId: string) => {
        setStakeholders((prev) => prev.filter((s) => s.stakeholder_id !== stakeholderId));
    };

    const getStakeholdersByAccount = (accountId: string) => {
        return stakeholders.filter((s) => s.account_id === accountId);
    };

    return (
        <StakeholderContext.Provider
            value={{
                stakeholders,
                addStakeholder,
                updateStakeholder,
                deleteStakeholder,
                getStakeholdersByAccount,
            }}
        >
            {children}
        </StakeholderContext.Provider>
    );
}

export function useStakeholders() {
    const context = useContext(StakeholderContext);
    if (context === undefined) {
        throw new Error('useStakeholders must be used within a StakeholderProvider');
    }
    return context;
}
