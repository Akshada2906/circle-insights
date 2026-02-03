import { Account, Stakeholder, AccountFinancials, Circle, ValueChainStage, Opportunity } from '@/types/dashboard';

export const mockStakeholders: Stakeholder[] = [
  {
    id: 'stk-001',
    name: 'Sarah Chen',
    designation: 'VP of Engineering',
    connections: ['John Miller', 'Mike Ross'],
    relationship_score: 8,
    value_chain_category: 'Technology',
    is_champion: true,
    account_id: 'acc-001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-01T14:30:00Z',
  },
  {
    id: 'stk-002',
    name: 'John Miller',
    designation: 'CTO',
    connections: ['Sarah Chen', 'Emily Davis'],
    relationship_score: 9,
    value_chain_category: 'Engineering',
    is_champion: true,
    account_id: 'acc-001',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-02-02T11:00:00Z',
  },
  {
    id: 'stk-003',
    name: 'Emily Davis',
    designation: 'Director of Cloud Operations',
    connections: ['John Miller'],
    relationship_score: 6,
    value_chain_category: 'Resources',
    is_champion: false,
    account_id: 'acc-001',
    created_at: '2024-01-20T15:00:00Z',
    updated_at: '2024-01-25T09:30:00Z',
  },
  {
    id: 'stk-004',
    name: 'Mike Ross',
    designation: 'Head of Business Development',
    connections: ['Sarah Chen', 'Lisa Park'],
    relationship_score: 7,
    value_chain_category: 'Business',
    is_champion: false,
    account_id: 'acc-001',
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-02-03T16:45:00Z',
  },
  {
    id: 'stk-005',
    name: 'Lisa Park',
    designation: 'Data Science Lead',
    connections: ['Mike Ross', 'Sarah Chen'],
    relationship_score: 5,
    value_chain_category: 'Technology',
    is_champion: false,
    account_id: 'acc-001',
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-30T13:20:00Z',
  },
];

export const mockFinancials: AccountFinancials[] = [
  {
    id: 'fin-001',
    account_name: 'TechCorp Global',
    target_2026: 5000000,
    current: 2100000,
    forecast: 3800000,
    shortfall: 1200000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'fin-002',
    account_name: 'DataFlow Systems',
    target_2026: 3500000,
    current: 1800000,
    forecast: 3200000,
    shortfall: 300000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'fin-003',
    account_name: 'CloudNine Industries',
    target_2026: 4200000,
    current: 950000,
    forecast: 2800000,
    shortfall: 1400000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

export const mockCircles: Circle[] = [
  {
    id: 'cir-001',
    account_id: 'acc-001',
    circle_name: 'Cloud',
    penetration_percentage: 72,
    current_work: 'AWS Migration Project - Phase 2',
    reason_for_no_work: null,
    ai_suggestions: [
      'Expand to multi-cloud strategy with Azure integration',
      'Propose Kubernetes orchestration services',
      'Identify cost optimization opportunities',
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'cir-002',
    account_id: 'acc-001',
    circle_name: 'Data',
    penetration_percentage: 45,
    current_work: 'Data Lake Implementation',
    reason_for_no_work: null,
    ai_suggestions: [
      'Propose real-time analytics platform',
      'Introduce data governance framework',
      'Expand to ML pipeline development',
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'cir-003',
    account_id: 'acc-001',
    circle_name: 'AI',
    penetration_percentage: 28,
    current_work: '',
    reason_for_no_work: 'Budget constraints in Q1 2024',
    ai_suggestions: [
      'Start with AI-powered customer service chatbot',
      'Propose predictive maintenance solution',
      'Introduce AI readiness assessment',
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'cir-004',
    account_id: 'acc-001',
    circle_name: 'Security',
    penetration_percentage: 85,
    current_work: 'Zero Trust Architecture Implementation',
    reason_for_no_work: null,
    ai_suggestions: [
      'Expand SIEM capabilities',
      'Introduce AI-driven threat detection',
      'Propose compliance automation',
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'cir-005',
    account_id: 'acc-001',
    circle_name: 'DevOps',
    penetration_percentage: 60,
    current_work: 'CI/CD Pipeline Modernization',
    reason_for_no_work: null,
    ai_suggestions: [
      'Implement GitOps practices',
      'Introduce infrastructure as code',
      'Propose observability platform',
    ],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

export const mockValueChain: ValueChainStage[] = [
  {
    id: 'vc-001',
    stage_name: 'Resources',
    current_percentage: 65,
    state_capture_analysis: 'Strong cloud infrastructure presence. Need to expand into talent management and resource optimization tools.',
    order: 1,
  },
  {
    id: 'vc-002',
    stage_name: 'Technology',
    current_percentage: 78,
    state_capture_analysis: 'Well-established technology partnerships. AI and ML adoption is accelerating with 3 active projects.',
    order: 2,
  },
  {
    id: 'vc-003',
    stage_name: 'Engineering',
    current_percentage: 52,
    state_capture_analysis: 'DevOps practices improving. CI/CD adoption at 60%. Need to focus on platform engineering services.',
    order: 3,
  },
  {
    id: 'vc-004',
    stage_name: 'Business',
    current_percentage: 40,
    state_capture_analysis: 'Limited business consulting engagement. Opportunity for digital transformation and process optimization.',
    order: 4,
  },
];

export const mockOpportunity: Opportunity = {
  id: 'opp-001',
  account_id: 'acc-001',
  ai_analysis: `Based on current penetration analysis:

**High Priority Opportunities:**
1. AI/ML Practice Expansion - 72% probability of success
2. Multi-cloud Strategy Consulting - Client showing interest
3. Data Governance Framework - Regulatory requirements driving demand

**Risk Factors:**
- Competitor XYZ has existing AI relationship
- Budget constraints may delay Q2 initiatives

**Recommended Actions:**
- Schedule executive briefing on AI roadmap
- Propose POC for predictive analytics
- Leverage champion network for introductions`,
  value_adds: 'Strategic partnership for cloud transformation. Exclusive early access to AI platform beta. Dedicated solution architect team.',
  competitor_intelligence: `**XYZ Consulting:** Strong AI practice, proposed chatbot solution last quarter. Pricing aggressive.

**ABC Technologies:** Long-standing data partnership. Risk of expansion into cloud services.

**NewAge Digital:** New entrant, offering competitive DevOps packages.`,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-02-01T00:00:00Z',
};

export const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    name: 'TechCorp Global',
    industry: 'Technology',
    financials: mockFinancials[0],
    stakeholders: mockStakeholders,
    circles: mockCircles,
    value_chain: mockValueChain,
    opportunities: mockOpportunity,
  },
];
