import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StakeholderTable } from '@/components/dashboard/StakeholderTable';
import { mockStakeholders } from '@/data/mockData';
import { Stakeholder } from '@/types/dashboard';

const Stakeholders = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);

  const handleStakeholderUpdate = (updated: Stakeholder) => {
    setStakeholders((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Stakeholder Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage stakeholder relationships, connections, and champion status
          </p>
        </div>
        <StakeholderTable
          stakeholders={stakeholders}
          onUpdate={handleStakeholderUpdate}
        />
      </div>
    </MainLayout>
  );
};

export default Stakeholders;
