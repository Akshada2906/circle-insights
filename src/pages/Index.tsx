import { useState, useEffect } from 'react';
import { useAccounts } from '@/contexts/AccountContext';
import { api } from '@/services/api';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { accounts, refreshAccounts } = useAccounts();
  const navigate = useNavigate();
  const [stakeholderCount, setStakeholderCount] = useState<number>(0);

  const totalAccounts = accounts.length;

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    const fetchStakeholderCount = async () => {
      try {
        const stakeholders = await api.getAllStakeholders();
        setStakeholderCount(stakeholders.length);
      } catch (error) {
        console.error("Failed to fetch stakeholder count", error);
      }
    };

    fetchStakeholderCount();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your strategic landscape</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Accounts Summary */}
          <Card className="border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-50/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50/50 to-transparent">
              <CardTitle className="text-sm font-medium text-blue-950">Total Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalAccounts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active strategic accounts
              </p>
              <Button variant="link" className="px-0 mt-4 text-blue-600 hover:text-blue-700" onClick={() => navigate('/accounts')}>
                View Accounts <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Stakeholders Summary */}
          <Card className="border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-50/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50/50 to-transparent">
              <CardTitle className="text-sm font-medium text-blue-950">Stakeholder Profiles</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stakeholderCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documented strategic profiles
              </p>
              <Button variant="link" className="px-0 mt-4 text-blue-600 hover:text-blue-700" onClick={() => navigate('/stakeholders')}>
                View Stakeholders <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
