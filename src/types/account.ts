// Account and Project type definitions

export interface Account {
    account_id: string;
    account_name: string;
    domain?: string;
    company_revenue?: number;
    know_customer_value_chain?: boolean;
    account_focus?: 'Platinum' | 'Gold' | 'Silver';
    delivery_owner?: string;
    client_partner?: string;
    where_we_fit_in_value_chain?: string;
    engagement_age?: number;
    last_year_business_done?: number;
    target_projection_2026_accounts?: number;
    target_projection_2026_delivery?: number;
    current_pipeline_value?: number;
    revenue_attrition_possibility?: string;
    current_engagement_areas?: string;
    team_size?: number;
    engagement_models?: string;
    current_rate_card_health?: 'Above' | 'At' | 'Below';
    number_of_active_projects?: number;
    overall_delivery_health?: string;
    current_nps?: number;
    champion_customer_side?: string;
    champion_profile?: string;
    connect_with_decision_maker?: boolean;
    total_active_connects?: number;
    visibility_client_roadmap_2026?: string;
    identified_areas_cross_up_selling?: string;
    nitor_executive_connect_frequency?: string;
    growth_action_plan_30days_ready?: boolean;
    account_research_link?: string;

    // Removed legacy/incorrect fields: ai_summary, leadership_comments, and strategic profile fields
    // Strategic fields should be accessed via StrategicStakeholderProfile objects

    created_at: string;
    updated_at: string;
}

export interface Project {
    project_id: string;
    account_id: string;
    project_name: string;
    project_manager: string;
    project_summary: string;
    tech_stack: string[];
    circle: 'Cloud' | 'Data' | 'AI' | 'Security' | 'DevOps';
    connected_with?: string;
    competitor_name?: string;
    competitive_risk?: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

export interface Stakeholder {
    stakeholder_id: string;
    account_id: string;
    project_id: string;
    project_name: string;
    name: string;
    designation: string;
    department: string;
    value_chain_category: 'Resources' | 'Technology' | 'Engineering' | 'Business'; // Dropdown
    relationship_score: number;
    is_champion: boolean;
    connections?: string[];
    created_at: string;
    updated_at: string;
}

export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface StrategicStakeholderProfile {
    id: string;
    account_id?: string;
    account_name?: string;
    executive_sponsor: string;
    technical_decision_maker: string;
    influencer: string;
    neutral_stakeholders: string;
    negative_stakeholder: string;
    succession_risk: string;
    key_competitors: string;
    our_positioning: string;
    incumbency_strength: 'High' | 'Medium' | 'Low';
    areas_competition_stronger: string;
    white_spaces_we_own: string;
    account_review_cadence: string;
    qbr_happening: 'Yes' | 'No';
    technical_audit_frequency: string;

    created_at: string;
    updated_at: string;
}

export interface AccountWithProjects extends Account {
    projects: Project[];
    stakeholders?: Stakeholder[];
    strategic_profiles?: StrategicStakeholderProfile[];
    status: AccountStatus;
}
