import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0A2647] mb-3">Select Dashboard</h1>
          <p className="text-[#64748B] text-lg">Choose which dashboard you would like to view</p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          {/* Sales Dashboard Card */}
          <Card
            className="group cursor-pointer border-t-[6px] border-t-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
            onClick={() => navigate('/accounts')}
          >
            <CardContent className="flex flex-col items-center text-center p-10 pt-12">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <PieChart className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-[#0A2647] mb-3">Sales Dashboard</h2>
              <p className="text-[#64748B]">View your strategic accounts and sales metrics</p>
            </CardContent>
          </Card>

          {/* Finance Dashboard Card */}
          <Card
            className="group cursor-pointer border-t-[6px] border-t-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
            onClick={() => navigate('/finance-dashboard')}
          >
            <CardContent className="flex flex-col items-center text-center p-10 pt-12">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-semibold text-[#0A2647] mb-3">Accounts Dashboard</h2>
              <p className="text-[#64748B]">View comprehensive financial performance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
