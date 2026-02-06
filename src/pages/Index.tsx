import { useAccounts } from '@/contexts/AccountContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { accounts } = useAccounts();
  const navigate = useNavigate();

  const totalAccounts = accounts.length;
  const totalStakeholders = accounts.reduce((acc, account) => acc + (account.strategic_profiles?.length || 0), 0);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your strategic landscape</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Accounts Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAccounts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active strategic accounts
              </p>
              <Button variant="link" className="px-0 mt-4 text-primary" onClick={() => navigate('/accounts')}>
                View Accounts <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Stakeholders Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stakeholder Profiles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStakeholders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documented strategic profiles
              </p>
              <Button variant="link" className="px-0 mt-4 text-primary" onClick={() => navigate('/stakeholders')}>
                View Stakeholders <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Placeholder for future metrics */}
          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-6 text-center h-full">
              <p className="text-muted-foreground font-medium">More analytics coming soon</p>
              <p className="text-xs text-muted-foreground mt-1">Financials, Circles, and Value Chain metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
