import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CirclePanel } from '@/components/dashboard/CirclePanel';
import { mockCircles } from '@/data/mockData';
import { Circle } from '@/types/dashboard';

const Circles = () => {
  const [circles, setCircles] = useState<Circle[]>(mockCircles);

  const handleCircleUpdate = (updated: Circle) => {
    setCircles((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Circle Penetration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor AI penetration across Cloud, Data, and AI circles
          </p>
        </div>
        <CirclePanel circles={circles} onUpdate={handleCircleUpdate} />
      </div>
    </MainLayout>
  );
};

export default Circles;
