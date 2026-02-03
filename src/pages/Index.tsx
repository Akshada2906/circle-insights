import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StakeholderTable } from '@/components/dashboard/StakeholderTable';
import { AccountFinancialsTracker } from '@/components/dashboard/AccountFinancialsTracker';
import { CirclePanel } from '@/components/dashboard/CirclePanel';
import { ValueChainMetric } from '@/components/dashboard/ValueChainMetric';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import {
  mockStakeholders,
  mockFinancials,
  mockCircles,
  mockValueChain,
  mockOpportunity,
} from '@/data/mockData';
import { Stakeholder, AccountFinancials, Circle, ValueChainStage, Opportunity } from '@/types/dashboard';

const Index = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
  const [financials, setFinancials] = useState<AccountFinancials[]>(mockFinancials);
  const [circles, setCircles] = useState<Circle[]>(mockCircles);
  const [valueChain, setValueChain] = useState<ValueChainStage[]>(mockValueChain);
  const [opportunity, setOpportunity] = useState<Opportunity>(mockOpportunity);

  const handleStakeholderUpdate = (updated: Stakeholder) => {
    setStakeholders((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleFinancialsUpdate = (updated: AccountFinancials) => {
    setFinancials((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleCircleUpdate = (updated: Circle) => {
    setCircles((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleValueChainUpdate = (updated: ValueChainStage) => {
    setValueChain((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleOpportunityUpdate = (updated: Opportunity) => {
    setOpportunity(updated);
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader
          accountName="TechCorp Global"
          lastUpdated="Feb 3, 2026 • 2:45 PM"
        />

        <div className="grid gap-6">
          {/* Row 1: Stakeholder Table */}
          <StakeholderTable
            stakeholders={stakeholders}
            onUpdate={handleStakeholderUpdate}
          />

          {/* Row 2: Financials and Circle Penetration */}
          <div className="grid lg:grid-cols-2 gap-6">
            <AccountFinancialsTracker
              financials={financials}
              onUpdate={handleFinancialsUpdate}
            />
            <CirclePanel circles={circles} onUpdate={handleCircleUpdate} />
          </div>

          {/* Row 3: Value Chain */}
          <ValueChainMetric stages={valueChain} onUpdate={handleValueChainUpdate} />

          {/* Row 4: Opportunities */}
          <OpportunitiesSection
            opportunity={opportunity}
            onUpdate={handleOpportunityUpdate}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>Organization Management – AI Penetration Dashboard v1.0</p>
        </footer>
      </div>
    </MainLayout>
  );
};

export default Index;
