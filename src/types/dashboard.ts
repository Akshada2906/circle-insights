// Types aligned with Python/PostgreSQL backend structure

export interface Stakeholder {
  id: string;
  name: string;
  designation: string;
  department?: string; // Department field
  project_name?: string; // Project name field
  connections: string[];
  relationship_score: number;
  value_chain_category: 'Resources' | 'Technology' | 'Engineering' | 'Business';
  is_champion: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface AccountFinancials {
  id: string;
  account_name: string;
  target_2026: number;
  current: number;
  forecast: number;
  shortfall: number; // Auto-calculated: target - forecast
  created_at: string;
  updated_at: string;
}

export interface Circle {
  id: string;
  account_id: string;
  circle_name: 'Cloud' | 'Data' | 'AI' | 'Security' | 'DevOps';
  penetration_percentage: number;
  current_work: string;
  reason_for_no_work: string | null;
  ai_suggestions: string[];
  created_at: string;
  updated_at: string;
}

export interface ValueChainStage {
  id: string;
  stage_name: 'Resources' | 'Technology' | 'Engineering' | 'Business';
  current_percentage: number;
  state_capture_analysis: string;
  order: number;
}

export interface Opportunity {
  id: string;
  account_id: string;
  ai_analysis: string;
  value_adds: string;
  competitor_intelligence: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  financials: AccountFinancials;
  stakeholders: Stakeholder[];
  circles: Circle[];
  value_chain: ValueChainStage[];
  opportunities: Opportunity;
}
