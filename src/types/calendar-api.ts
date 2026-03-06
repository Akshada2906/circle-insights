export interface CalendarTaskCreate {
    account_id?: string | null;
    priority?: string;
    status?: string;
    start_date?: string | null;
    due_date?: string | null;
    estimated_hours?: number;
    task_title?: string | null;
    description?: string | null;
}

export interface CalendarTaskResponse extends CalendarTaskCreate {
    id: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface CalendarMilestoneCreate {
    project_id?: string | null;
    target_date?: string | null;
    owner_id?: string | null;
    impact_level?: string;
    progress_percent?: number;
    milestone_name?: string | null;
    description?: string | null;
}

export interface CalendarMilestoneResponse extends CalendarMilestoneCreate {
    id: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface CalendarReminderCreate {
    project_id?: string | null;
    reminder_date?: string | null;
    reminder_time?: string | null;
    reminder_title?: string | null;
    notes?: string | null;
}

export interface CalendarReminderResponse extends CalendarReminderCreate {
    id: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface CalendarTaskUpdate extends CalendarTaskCreate { }
export interface CalendarMilestoneUpdate extends CalendarMilestoneCreate { }
export interface CalendarReminderUpdate extends CalendarReminderCreate { }

export interface CalendarEventResponse {
    id: string;
    user_id?: string | null;
    event_type?: string | null;
    event_id?: string | null;
    created_at?: string | null;
    details?: any | null;
}
