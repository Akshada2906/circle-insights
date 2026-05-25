export interface RoadmapVersion {
  version: number;
  content: string;
  date: string;
  label?: string;
}

export type ValueAddStatus = 'planned' | 'in_progress' | 'completed';
export type FileOwnerType = 'account' | 'project';
export type FileKind = 'wsr' | 'code_quality' | 'tech_review' | 'best_practices' | 'sow' | 'ai_matrix';
export type UserRoleType = 'admin' | 'editor';
export type ProjectStatus = 'active' | 'proposal' | 'poc' | 'completed' | 'inactive';

export interface DeliveryUnit {
  id: string;
  name: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  delivery_unit_id: string;
  private_equity_id?: string;
  account_manager?: string;
  customer_overview?: string;
  ai_recommendations?: string;
  created_at: string;
  delivery_unit?: DeliveryUnit;
  project_count: number;
  current_revenue?: number;
  total_revenue: number;
  ai_revenue: number;
  ai_penetration_pct: number;
  total_ai_hours: number;
  active_project_count: number;
  inactive_project_count: number;
  target_revenue?: number;
  forecast_revenue?: number;
  is_sales?: boolean;
  projects: Project[];
}

export interface Project {
  id: string;
  account_id: string;
  name: string;
  overview?: string;
  expected_outcome?: string;
  technical_roadmap?: string;
  product_roadmap?: string;
  ai_roadmap?: string;
  tech_stack?: string[];
  ai_recommendations?: string;
  ai_direct_hours: number;
  ai_assist_hours: number;
  ai_direct_people: number;
  ai_assisted_people: number;
  code_coverage_pct: number;
  expected_revenue: number;
  ytd_revenue: number;
  ai_revenue: number;
  ai_assisted_revenue: number;
  total_ai_revenue: number;
  ai_penetration?: number;
  from_date?: string;
  to_date?: string;
  status?: ProjectStatus;
  proposal_end_date?: string;
  expected_win_date?: string;
  project_type?: string;
  created_at: string;
  account?: Account;
  total_revenue: number;
  ai_penetration_pct: number;
}

export interface ValueAdd {
  id: string;
  title: string;
  description?: string;
  impact?: string;
  status: ValueAddStatus;
  project_id?: string;
  created_at: string;
  project?: Project;
}

export interface FileRecord {
  id: string;
  owner_type: FileOwnerType;
  owner_id: string;
  kind: FileKind;
  original_name: string;
  storage_path: string;
  file_size?: number;
  content_type?: string;
  created_at: string;
  uploaded_by?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

export interface ProjectMetrics {
  total_revenue: number;
  ai_revenue: number;
  ai_direct_revenue?: number;
  ai_assisted_revenue?: number;
  ai_penetration_pct: number;
  total_ai_hours: number;
  ai_work_pct?: number;
}

export interface AccountMetrics extends ProjectMetrics {
  project_count: number;
}

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  account_id: string;
  account_name: string;
  delivery_unit_name?: string;
  total_expected_rev: number;
  total_ytd_rev: number;
  total_ai_rev: number;
  total_ai_assist_rev: number;
  total_ai_direct_hours: number;
  total_ai_assist_hours: number;
  total_project_count: number;
  month?: number;
  year?: number;
  total_revenue: number;
  project_status?: string;
  project_type?: string;
  from_date?: string;
  to_date?: string;
}

export interface DashboardStatsOut {
  total_accounts: number;
  active_accounts: number;
  inactive_accounts: number;
  total_projects: number;
  active_projects: number;
  non_active_projects: number;
  total_revenue: number;
  active_revenue: number;
  non_active_revenue: number;
  total_ai_assisted_revenue: number;
  total_ai_direct_revenue: number;
  project_bifurcation: { type: string; count: number }[];
  projects: ProjectSummary[];
}

export interface AccountRevenueSummary {
  account_name: string;
  total_revenue: number;
  total_ai_rev: number;
  total_ai_assist_rev: number;
}
