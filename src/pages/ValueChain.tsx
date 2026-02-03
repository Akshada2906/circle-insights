import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ValueChainMetric } from '@/components/dashboard/ValueChainMetric';
import { mockValueChain } from '@/data/mockData';
import { ValueChainStage } from '@/types/dashboard';

const ValueChain = () => {
  const [valueChain, setValueChain] = useState<ValueChainStage[]>(mockValueChain);

  const handleValueChainUpdate = (updated: ValueChainStage) => {
    setValueChain((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Value Chain Metrics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track progress across Resources, Technology, Engineering, and Business stages
          </p>
        </div>
        <ValueChainMetric stages={valueChain} onUpdate={handleValueChainUpdate} />
      </div>
    </MainLayout>
  );
};

export default ValueChain;
