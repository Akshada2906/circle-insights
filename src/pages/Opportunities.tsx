import { MainLayout } from '@/components/layout/MainLayout';

const Opportunities = () => {
  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Opportunities & Competitors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI analysis, value adds, and competitor intelligence
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold text-muted-foreground">Opportunities Integration Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2">This module is currently being connected to real-time data sources.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Opportunities;
