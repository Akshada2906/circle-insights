// Account and Project type definitions

export interface Account {
    account_id: string; // Primary Key
    account_name: string;
    account_leader: string;
    delivery_unit: string;
    industry: string;
    target_2026: number;
    current_revenue: number;
    forecast_revenue: number;
    shortfall: number; // Calculated: target_2026 - forecast_revenue
    account_health_score: number; // Read-only, calculated based on performance
    ai_summary?: string; // Text descriptive - AI-generated summary
    leadership_comments?: string; // Text descriptive - Leadership feedback

    // New Fields
    domain?: string;
    company_revenue?: number; // USD
    customer_value_chain?: string;
    account_focus?: 'Platinum' | 'Gold' | 'Silver';
    // delivery_unit is already defined above
    delivery_owner?: string;
    client_partner?: string;
    value_chain_fit?: string;
    engagement_age?: string;
    last_year_business?: number; // USD
    target_projection_2026_accounts?: number;
    target_projection_2026_delivery?: number;
    current_pipeline_value?: number;
    revenue_attrition_risk?: string; // "Yes" / "No" or detailed text
    current_engagement_areas?: string;
    team_size?: number;
    engagement_models?: string;
    rate_card_health?: 'Above' | 'At' | 'Below';
    active_projects_count?: number; // Can be calculated or manual override
    overall_delivery_health?: string;
    current_nps?: number;
    champion_name?: string;
    champion_profile?: string;
    decision_maker_connect?: boolean; // Yes/No
    total_active_connects?: number;
    roadmap_visibility_2026?: string;
    cross_sell_areas?: string;
    executive_connect_frequency?: string;
    growth_action_plan_ready?: boolean; // Yes/No
    miro_board_link?: string;

    // Strategy & Stakeholder Landscape Fields
    executive_sponsor?: string;
    technical_decision_maker?: string;
    influencer?: string;
    neutral_stakeholders?: string;
    negative_stakeholder?: string;
    succession_risk?: string;

    // Competition & Positioning
    key_competitors?: string;
    our_positioning?: string;
    incumbency_strength?: 'High' | 'Medium' | 'Low';
    areas_competition_stronger?: string;
    white_spaces_we_own?: string;

    // Internal Readiness
    account_review_cadence?: string;
    qbr_happening?: 'Yes' | 'No';
    technical_audit_frequency?: string;

    created_at: string;
    updated_at: string;
}

export interface Project {
    project_id: string; // Primary Key
    account_id: string; // Foreign Key
    project_name: string;
    project_manager: string;
    project_summary: string;
    tech_stack: string[];
    circle: 'Cloud' | 'Data' | 'AI' | 'Security' | 'DevOps';
    connected_with?: string; // Text - Connected entities or partners
    competitor_name?: string; // Text - Competitor name
    competitive_risk?: string; // Text descriptive - Competitive risk analysis
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

// Stakeholder type definition
export interface Stakeholder {
    stakeholder_id: string; // Primary Key (UUID)
    account_id: string; // Foreign Key
    project_id: string; // Foreign Key
    project_name: string; // Fetched from projects table
    name: string; // Stakeholder name
    designation: string; // Dropdown
    department: string; // Dropdown
    value_chain_category: 'Resources' | 'Technology' | 'Engineering' | 'Business'; // Dropdown
    relationship_score: number; // System calculated (1-10)
    is_champion: boolean; // Yes/No
    connections?: string[]; // Optional array of connection names
    created_at: string;
    updated_at: string;
}

export type AccountStatus = 'ACTIVE' | 'INACTIVE';

// New Strategic Profile Type
export interface StrategicStakeholderProfile {
    id: string;
    account_id?: string;
    account_name?: string;
    // Roles
    executive_sponsor: string;
    technical_decision_maker: string;
    influencer: string;
    neutral_stakeholders: string;
    negative_stakeholder: string;
    succession_risk: string;

    // Competition
    key_competitors: string;
    our_positioning: string;
    incumbency_strength: 'High' | 'Medium' | 'Low';
    areas_competition_stronger: string;
    white_spaces_we_own: string;

    // Readiness
    account_review_cadence: string;
    qbr_happening: 'Yes' | 'No';
    technical_audit_frequency: string;

    created_at: string;
    updated_at: string;
}

export interface AccountWithProjects extends Account {
    projects: Project[];
    stakeholders?: Stakeholder[];
    strategic_profiles?: StrategicStakeholderProfile[]; // Optional link
    status: AccountStatus;
}
