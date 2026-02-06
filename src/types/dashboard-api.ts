export interface AccountDashboardResponse {
    account_id: string;
    account_name: string;
    account_leader?: string;
    industry?: string;
    domain?: string;
    company_revenue?: number;
    know_customer_value_chain?: boolean;
    account_focus?: string;
    delivery_unit?: string;
    delivery_owner?: string;
    client_partner?: string;
    where_we_fit_in_value_chain?: string;
    engagement_age?: number;
    last_year_business_done?: number;

    // New Fields
    target_2026?: number;
    current_revenue?: number;
    forecast_revenue?: number;
    shortfall?: number;
    account_health_score?: number;

    target_projection_2026_accounts?: number;
    target_projection_2026_delivery?: number;
    current_pipeline_value?: number;
    revenue_attrition_possibility?: string;
    current_engagement_areas?: string;
    team_size?: number;
    engagement_models?: string;
    current_rate_card_health?: string;
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
    miro_board_link?: string;
    created_at: string;
    updated_at: string;
}

export interface AccountDashboardCreate {
    account_name: string;
    account_leader?: string;
    industry?: string;
    domain?: string;
    company_revenue?: number;
    know_customer_value_chain?: boolean;
    account_focus?: string;
    delivery_unit?: string;
    delivery_owner?: string;
    client_partner?: string;
    where_we_fit_in_value_chain?: string;
    engagement_age?: number;
    last_year_business_done?: number;

    // New Fields
    target_2026?: number;
    current_revenue?: number;
    forecast_revenue?: number;
    shortfall?: number;
    account_health_score?: number;

    target_projection_2026_accounts?: number;
    target_projection_2026_delivery?: number;
    current_pipeline_value?: number;
    revenue_attrition_possibility?: string;
    current_engagement_areas?: string;
    team_size?: number;
    engagement_models?: string;
    current_rate_card_health?: string;
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
    miro_board_link?: string;
}

export interface AccountDashboardUpdate extends Partial<AccountDashboardCreate> { }

// Stakeholder Details Types
export interface StakeholderDetailsResponse {
    id: string;
    account_id: string;
    account_name: string;
    executive_sponsor?: string;
    technical_decision_maker?: string;
    influencers?: string;
    neutral_stakeholders?: string;
    negative_stakeholder?: string;
    succession_risk?: string;
    key_competitors?: string;
    our_positioning_vs_competition?: string;
    incumbency_strength?: string;
    areas_competition_stronger?: string;
    white_spaces_we_own?: string;
    account_review_cadence_frequency?: string;
    qbr_happening?: boolean;
    technical_audit_frequency?: string;
    created_at: string;
    updated_at: string;
}

export interface StakeholderDetailsCreate {
    account_id: string;
    account_name: string;
    executive_sponsor?: string;
    technical_decision_maker?: string;
    influencers?: string;
    neutral_stakeholders?: string;
    negative_stakeholder?: string;
    succession_risk?: string;
    key_competitors?: string;
    our_positioning_vs_competition?: string;
    incumbency_strength?: string;
    areas_competition_stronger?: string;
    white_spaces_we_own?: string;
    account_review_cadence_frequency?: string;
    qbr_happening?: boolean;
    technical_audit_frequency?: string;
}

export interface StakeholderDetailsUpdate {
    account_name?: string;
    executive_sponsor?: string;
    technical_decision_maker?: string;
    influencers?: string;
    neutral_stakeholders?: string;
    negative_stakeholder?: string;
    succession_risk?: string;
    key_competitors?: string;
    our_positioning_vs_competition?: string;
    incumbency_strength?: string;
    areas_competition_stronger?: string;
    white_spaces_we_own?: string;
    account_review_cadence_frequency?: string;
    qbr_happening?: boolean;
    technical_audit_frequency?: string;
}
