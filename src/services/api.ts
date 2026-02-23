import { AccountDashboardResponse, AccountDashboardCreate, AccountDashboardUpdate, StakeholderDetailsResponse, StakeholderDetailsCreate, StakeholderDetailsUpdate } from "@/types/dashboard-api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || response.statusText || "Something went wrong");
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const api = {
    getAccounts: async (): Promise<AccountDashboardResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/`);
        return handleResponse<AccountDashboardResponse[]>(response);
    },

    getAccountById: async (id: string): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/${id}`);
        return handleResponse<AccountDashboardResponse>(response);
    },

    createAccount: async (account: AccountDashboardCreate): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(account),
        });
        return handleResponse<AccountDashboardResponse>(response);
    },

    updateAccount: async (id: string, account: AccountDashboardUpdate): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(account),
        });
        return handleResponse<AccountDashboardResponse>(response);
    },

    deleteAccount: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Search
    searchAccountsByUnit: async (deliveryUnit: string): Promise<AccountDashboardResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/account-dashboard/search/unit/${deliveryUnit}`);
        return handleResponse<AccountDashboardResponse[]>(response);
    },

    // Stakeholder Details
    getAllStakeholders: async (): Promise<StakeholderDetailsResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/`);
        return handleResponse<StakeholderDetailsResponse[]>(response);
    },

    getStakeholderById: async (id: string): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/${id}`);
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    getStakeholderDetailsByAccount: async (accountId: string): Promise<StakeholderDetailsResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/account/${accountId}`);
        return handleResponse<StakeholderDetailsResponse[]>(response);
    },

    createStakeholderDetails: async (details: StakeholderDetailsCreate): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(details),
        });
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    updateStakeholderDetails: async (id: string, details: StakeholderDetailsUpdate): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(details),
        });
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    deleteStakeholderDetails: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/stakeholder-details/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    }
};
