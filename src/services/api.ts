import { AccountDashboardResponse, AccountDashboardCreate, AccountDashboardUpdate, StakeholderDetailsResponse, StakeholderDetailsCreate, StakeholderDetailsUpdate } from "@/types/dashboard-api";
import {
    CalendarTaskCreate, CalendarTaskResponse, CalendarTaskUpdate,
    CalendarMilestoneCreate, CalendarMilestoneResponse, CalendarMilestoneUpdate,
    CalendarReminderCreate, CalendarReminderResponse, CalendarReminderUpdate,
    CalendarEventResponse
} from "@/types/calendar-api";

const BASE_API_PATH = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const API_BASE_URL = `${BASE_API_PATH}/account-dashboard`;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || response.statusText || "Something went wrong");
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const api = {
    getAccounts: async (): Promise<AccountDashboardResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/`);
        return handleResponse<AccountDashboardResponse[]>(response);
    },

    getAccountById: async (id: string): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        return handleResponse<AccountDashboardResponse>(response);
    },

    createAccount: async (account: AccountDashboardCreate): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(account),
        });
        return handleResponse<AccountDashboardResponse>(response);
    },

    updateAccount: async (id: string, account: AccountDashboardUpdate): Promise<AccountDashboardResponse> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(account),
        });
        return handleResponse<AccountDashboardResponse>(response);
    },

    deleteAccount: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Search
    searchAccountsByUnit: async (deliveryUnit: string): Promise<AccountDashboardResponse[]> => {
        const response = await fetch(`${API_BASE_URL}/search/unit/${deliveryUnit}`);
        return handleResponse<AccountDashboardResponse[]>(response);
    },

    // Stakeholder Details
    getAllStakeholders: async (): Promise<StakeholderDetailsResponse[]> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/`);
        return handleResponse<StakeholderDetailsResponse[]>(response);
    },

    getStakeholderById: async (id: string): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/${id}`);
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    getStakeholderDetailsByAccount: async (accountId: string): Promise<StakeholderDetailsResponse[]> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/account/${accountId}`);
        return handleResponse<StakeholderDetailsResponse[]>(response);
    },

    createStakeholderDetails: async (details: StakeholderDetailsCreate): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(details),
        });
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    updateStakeholderDetails: async (id: string, details: StakeholderDetailsUpdate): Promise<StakeholderDetailsResponse> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(details),
        });
        return handleResponse<StakeholderDetailsResponse>(response);
    },

    deleteStakeholderDetails: async (id: string): Promise<void> => {
        const response = await fetch(`${BASE_API_PATH}/stakeholder-details/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Calendar Events
    getCalendarEvents: async (): Promise<CalendarEventResponse[]> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/events/`);
        return handleResponse<CalendarEventResponse[]>(response);
    },

    // Calendar Task
    createCalendarTask: async (task: CalendarTaskCreate): Promise<CalendarTaskResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/tasks/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
        return handleResponse<CalendarTaskResponse>(response);
    },
    updateCalendarTask: async (id: string, task: CalendarTaskUpdate): Promise<CalendarTaskResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });
        return handleResponse<CalendarTaskResponse>(response);
    },
    deleteCalendarTask: async (id: string): Promise<void> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/tasks/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Calendar Milestone
    createCalendarMilestone: async (milestone: CalendarMilestoneCreate): Promise<CalendarMilestoneResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/milestones/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(milestone),
        });
        return handleResponse<CalendarMilestoneResponse>(response);
    },
    updateCalendarMilestone: async (id: string, milestone: CalendarMilestoneUpdate): Promise<CalendarMilestoneResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/milestones/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(milestone),
        });
        return handleResponse<CalendarMilestoneResponse>(response);
    },
    deleteCalendarMilestone: async (id: string): Promise<void> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/milestones/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Calendar Reminder
    createCalendarReminder: async (reminder: CalendarReminderCreate): Promise<CalendarReminderResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/reminders/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reminder),
        });
        return handleResponse<CalendarReminderResponse>(response);
    },
    updateCalendarReminder: async (id: string, reminder: CalendarReminderUpdate): Promise<CalendarReminderResponse> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/reminders/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reminder),
        });
        return handleResponse<CalendarReminderResponse>(response);
    },
    deleteCalendarReminder: async (id: string): Promise<void> => {
        const response = await fetch(`${BASE_API_PATH}/calendar/reminders/${id}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    },

    // Documents
    importDocument: async (accountId: string, type: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append("file", file);

        const typeMap: Record<string, string> = {
            'wsr-reports': 'wsr',
            'sow-documents': 'sow',
            'best-practices': 'best_practices',
            'code-quality': 'code_quality',
            'tech-reviews': 'tech_review'
        };

        const backendType = typeMap[type] || type;
        const response = await fetch(`${BASE_API_PATH}/document/import_${backendType}/${accountId}`, {
            method: "POST",
            body: formData,
        });
        return handleResponse<any>(response);
    },

    getDocument: async (accountId: string, type: string): Promise<any> => {
        const typeMap: Record<string, string> = {
            'wsr-reports': 'wsr',
            'sow-documents': 'sow',
            'best-practices': 'best_practices',
            'code-quality': 'code_quality',
            'tech-reviews': 'tech_review'
        };

        const backendType = typeMap[type] || type;
        const response = await fetch(`${BASE_API_PATH}/document/${backendType}/${accountId}`);
        return handleResponse<any>(response);
    },

    deleteDocument: async (accountId: string, type: string): Promise<void> => {
        const typeMap: Record<string, string> = {
            'wsr-reports': 'wsr',
            'sow-documents': 'sow',
            'best-practices': 'best_practices',
            'code-quality': 'code_quality',
            'tech-reviews': 'tech_review'
        };

        const backendType = typeMap[type] || type;
        const response = await fetch(`${BASE_API_PATH}/document/${backendType}/${accountId}`, {
            method: "DELETE",
        });
        return handleResponse<void>(response);
    }
};
