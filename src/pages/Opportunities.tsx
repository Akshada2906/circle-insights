import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import { mockOpportunity } from '@/data/mockData';
import { Opportunity } from '@/types/dashboard';

const Opportunities = () => {
  const [opportunity, setOpportunity] = useState<Opportunity>(mockOpportunity);

  const handleOpportunityUpdate = (updated: Opportunity) => {
    setOpportunity(updated);
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Opportunities & Competitors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI analysis, value adds, and competitor intelligence
          </p>
        </div>
        <OpportunitiesSection
          opportunity={opportunity}
          onUpdate={handleOpportunityUpdate}
        />
      </div>
    </MainLayout>
  );
};

export default Opportunities;
