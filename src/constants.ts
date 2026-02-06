// Delivery units for dropdown
export const deliveryUnits = [
    'BFSI', // Note: Usage seemed to vary (DU1 vs BFSI), keeping BFSI as likely desired, but checking original file showed DU1...
    // referencing step 93 content:
    'DU1', 'DU2', 'DU3', 'DU4', 'DU5'
];

// Industries for dropdown
export const industries = [
    'Financial Services',
    'Healthcare Technology',
    'Software & SaaS',
    'Professional Services',
    'Banking',
    'Technology Consulting',
    'Retail',
    'Manufacturing',
    'Telecommunications',
    'Energy',
];

// Circles for dropdown
export const circles: Array<'Cloud' | 'Data' | 'AI' | 'Security' | 'DevOps'> = [
    'Cloud',
    'Data',
    'AI',
    'Security',
    'DevOps',
];

// Designations for stakeholder dropdown
export const designations = [
    'VP',
    'Director',
    'Senior Manager',
    'Manager',
    'Team Lead',
    'Senior Engineer',
    'Engineer',
    'Architect',
    'Principal Engineer',
    'CTO',
    'CEO',
    'CFO',
];

// Departments for stakeholder dropdown
export const departments = [
    'Engineering',
    'Operations',
    'Business',
    'IT',
    'Product',
    'Sales',
    'Marketing',
    'Finance',
    'HR',
    'Executive',
];

// Value chain categories for stakeholder dropdown
export const valueChainCategories: Array<'Resources' | 'Technology' | 'Engineering' | 'Business'> = [
    'Resources',
    'Technology',
    'Engineering',
    'Business',
];
