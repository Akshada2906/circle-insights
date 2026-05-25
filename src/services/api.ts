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
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
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
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
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
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
    };

    const backendType = typeMap[type] || type;
    const response = await fetch(`${BASE_API_PATH}/document/${backendType}/${accountId}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },

  // Finance Documents
  importFinanceDocument: async (projectId: string, type: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const typeMap: Record<string, string> = {
      'wsr-reports': 'wsr',
      'sow-documents': 'sow',
      'best-practices': 'best_practices',
      'code-quality': 'code_quality',
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
    };

    const backendType = typeMap[type] || type;
    const response = await fetch(`${BASE_API_PATH}/finance/document/import_${backendType}/${projectId}`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<any>(response);
  },

  getFinanceDocument: async (projectId: string, type: string): Promise<any> => {
    const typeMap: Record<string, string> = {
      'wsr-reports': 'wsr',
      'sow-documents': 'sow',
      'best-practices': 'best_practices',
      'code-quality': 'code_quality',
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
    };

    const backendType = typeMap[type] || type;
    const response = await fetch(`${BASE_API_PATH}/finance/document/${backendType}/${projectId}`);
    return handleResponse<any>(response);
  },

  deleteFinanceDocument: async (projectId: string, type: string): Promise<void> => {
    const typeMap: Record<string, string> = {
      'wsr-reports': 'wsr',
      'sow-documents': 'sow',
      'best-practices': 'best_practices',
      'code-quality': 'code_quality',
      'tech-reviews': 'tech_review',
      'other-docs': 'other_docs'
    };

    const backendType = typeMap[type] || type;
    const response = await fetch(`${BASE_API_PATH}/finance/document/${backendType}/${projectId}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },

  // Insights
  generateProjectInsights: async (projectId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/project/${projectId}`, {
      method: "POST",
    });
    return handleResponse<any>(response);
  },

  getProjectInsights: async (projectId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/project/${projectId}`);
    return handleResponse<any>(response);
  },

  generateAccountInsights: async (accountId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/account/${accountId}`, {
      method: "POST",
    });
    return handleResponse<any>(response);
  },

  getAccountInsights: async (accountId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/account/${accountId}`);
    return handleResponse<any>(response);
  },

  generatePeInsights: async (peId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/pe/${peId}`, {
      method: "POST",
    });
    return handleResponse<any>(response);
  },

  getPeInsights: async (peId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/pe/${peId}`);
    return handleResponse<any>(response);
  },

  generateCircleAllocationInsights: async (projectId: string): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/circle-allocation/${projectId}`, {
      method: "POST",
    });
    return handleResponse<any>(response);
  },

  importOtherDocument: async (entityId: string, entityType: 'account' | 'project' | 'pe', file: File, contextHint?: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const query = contextHint ? `?context_hint=${encodeURIComponent(contextHint)}` : '';
    const response = await fetch(`${BASE_API_PATH}/insights/document/${entityType}/${entityId}${query}`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<any>(response);
  },

  getOtherDocuments: async (entityId: string, entityType: 'account' | 'project' | 'pe'): Promise<any> => {
    const response = await fetch(`${BASE_API_PATH}/insights/document/${entityType}/${entityId}`);
    return handleResponse<any>(response);
  },

  deleteOtherDocument: async (documentInsightId: string): Promise<void> => {
    const response = await fetch(`${BASE_API_PATH}/insights/document/${documentInsightId}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  }
};

// Import Data Export & Files
export const uploadImportProjectFile = async (file: File, dryRun = false) => {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${BASE_API_PATH}/import/project?dry_run=${dryRun ? 'true' : 'false'}`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to import Project file");
  }
  return response.json();
};

export const uploadImportRevenueFile = async (file: File, dryRun = false) => {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${BASE_API_PATH}/import/revenue?dry_run=${dryRun ? 'true' : 'false'}`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to import Revenue file");
  }
  return response.json();
};

export const exportAllProjectsAPI = async () => {
  const response = await fetch(`${BASE_API_PATH}/export_data/all_projects`);
  if (!response.ok) {
    throw new Error("Failed to export all projects");
  }
  return response.json();
};

export const exportAllRevenuesAPI = async () => {
  const response = await fetch(`${BASE_API_PATH}/export_data/all_revenues`);
  if (!response.ok) {
    throw new Error("Failed to export all revenues");
  }
  return response.json();
};

export const getPmoFiles = async () => {
  const response = await fetch(`${BASE_API_PATH}/pmo/pmo-files`);
  if (!response.ok) {
    throw new Error("Failed to fetch PMO files");
  }
  return response.json();
};

export const getRevenueFiles = async () => {
  const response = await fetch(`${BASE_API_PATH}/pmo/revenue-files`);
  if (!response.ok) {
    throw new Error("Failed to fetch Revenue files");
  }
  return response.json();
};

// --- Financial Accounts ---
export const getFinanceAccounts = async (limit: number | null = null) => {
  const url = limit !== null ? `${BASE_API_PATH}/accounts/?limit=${limit}` : `${BASE_API_PATH}/accounts/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
};

export const getFinanceAccountById = async (accountId: string) => {
  const response = await fetch(`${BASE_API_PATH}/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch finance account");
  }
  return response.json();
};

export const deleteFinanceAccount = async (accountId: string) => {
  const response = await fetch(`${BASE_API_PATH}/accounts/${accountId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
  return response.json();
};

export const createFinanceAccount = async (accountData: any) => {
  const response = await fetch(`${BASE_API_PATH}/accounts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(accountData),
  });
  if (!response.ok) throw new Error("Failed to create account");
  return response.json();
};

export const updateFinanceAccount = async (id: string, accountData: any) => {
  const response = await fetch(`${BASE_API_PATH}/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(accountData),
  });
  if (!response.ok) throw new Error("Failed to update account");
  return response.json();
};

export const toggleIsSalesAccount = async (id: string, isSales: boolean) => {
  const response = await fetch(`${BASE_API_PATH}/accounts/${id}/toggle-is-sales`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_sales: isSales }),
  });
  if (!response.ok) throw new Error("Failed to toggle is_sales status");
  return response.json();
};


export const getFinanceDeliveryUnits = async () => {
  const response = await fetch(`${BASE_API_PATH}/delivery_units/`);
  if (!response.ok) throw new Error("Failed to fetch delivery units");
  return response.json();
};

export const getFinanceProjectById = async (id: string) => {
  const response = await fetch(`${BASE_API_PATH}/projects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
};

export const createFinanceProject = async (projectData: any) => {
  const response = await fetch(`${BASE_API_PATH}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
};

export const updateFinanceProject = async (id: string, projectData: any) => {
  const response = await fetch(`${BASE_API_PATH}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
};

export const deleteFinanceProject = async (id: string) => {
  const response = await fetch(`${BASE_API_PATH}/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return response.json();
};

export const getFinanceDashboardStats = async (filters: any = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  const url = `${BASE_API_PATH}/dashboard/get_data?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json(); // Returns ProjectSummary[]
};

export const getFinanceAccountSummary = async (filters: any = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  const url = `${BASE_API_PATH}/dashboard/account_summary?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch account summary");
  return response.json();
};

// --- Private Equity ---
export const getPrivateEquities = async () => {
  const response = await fetch(`${BASE_API_PATH}/finance/private-equity/`);
  if (!response.ok) throw new Error("Failed to fetch private equities");
  return response.json();
};

export const getPrivateEquityById = async (id: string) => {
  const response = await fetch(`${BASE_API_PATH}/finance/private-equity/${id}`);
  if (!response.ok) throw new Error("Failed to fetch private equity");
  return response.json();
};

export const createPrivateEquity = async (peData: any) => {
  const response = await fetch(`${BASE_API_PATH}/finance/private-equity/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(peData),
  });
  if (!response.ok) throw new Error("Failed to create private equity");
  return response.json();
};

export const updatePrivateEquity = async (id: string, peData: any) => {
  const response = await fetch(`${BASE_API_PATH}/finance/private-equity/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(peData),
  });
  if (!response.ok) throw new Error("Failed to update private equity");
  return response.json();
};

export const deletePrivateEquity = async (id: string) => {
  const response = await fetch(`${BASE_API_PATH}/finance/private-equity/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete private equity");
};

