import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AccountFinancialsTracker } from '@/components/dashboard/AccountFinancialsTracker';
import { mockFinancials } from '@/data/mockData';
import { AccountFinancials } from '@/types/dashboard';

const Financials = () => {
  const [financials, setFinancials] = useState<AccountFinancials[]>(mockFinancials);

  const handleFinancialsUpdate = (updated: AccountFinancials) => {
    setFinancials((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Account Financials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track targets, forecasts, and financial performance across accounts
          </p>
        </div>
        <AccountFinancialsTracker
          financials={financials}
          onUpdate={handleFinancialsUpdate}
        />
      </div>
    </MainLayout>
  );
};

export default Financials;
