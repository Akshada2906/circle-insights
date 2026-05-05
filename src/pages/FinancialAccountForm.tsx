import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, Loader2, Menu, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getFinanceAccountById, 
  createFinanceAccount, 
  updateFinanceAccount,
  getFinanceDeliveryUnits
} from '@/services/api';

const FinancialAccountForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || '/financials';
  const privateEquityId = location.state?.private_equity_id || null;
  const { toast } = useToast();
  
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryUnits, setDeliveryUnits] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    delivery_unit_id: '',
    account_manager: '',
    customer_overview: '',
    ai_recommendations: '',
    target_revenue: 0,
    forecast_revenue: 0,
    total_revenue: 0,
    ai_revenue: 0,
    private_equity_id: privateEquityId,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const units = await getFinanceDeliveryUnits();
        setDeliveryUnits(units);
        
        if (isEditing) {
          const accountData = await getFinanceAccountById(id!);
          setFormData({
            name: accountData.name || '',
            delivery_unit_id: accountData.delivery_unit?.id || accountData.delivery_unit_id || '',
            account_manager: accountData.account_manager || '',
            customer_overview: accountData.customer_overview || '',
            ai_recommendations: accountData.ai_recommendations || '',
            target_revenue: accountData.target_revenue || 0,
            forecast_revenue: accountData.forecast_revenue || 0,
            total_revenue: accountData.total_revenue || 0,
            ai_revenue: accountData.ai_revenue || 0,
            private_equity_id: accountData.private_equity_id || privateEquityId || null
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message || "Failed to load account details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.delivery_unit_id) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateFinanceAccount(id!, formData);
        toast({
          title: "Account Updated",
          description: "The account has been updated successfully."
        });
        navigate(`/financials/${id}`, { state: { backUrl } });
      } else {
        const result = await createFinanceAccount(formData);
        toast({
          title: "Account Created",
          description: "New account added to the system."
        });
        navigate(`/financials/${result.id}`, { state: { backUrl } });
      }
    } catch (error: any) {
      toast({
        title: "Error saving account",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-2">
          <div 
             onClick={() => navigate(backUrl)}
             className="p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors mr-1 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </div>
          <a 
            onClick={() => navigate(backUrl)} 
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            {backUrl.includes('private-equity') ? 'Private Equity' : 'Accounts'}
          </a>
          {backUrl.includes('private-equity') && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <a onClick={() => navigate(backUrl)} className="text-blue-600 hover:underline cursor-pointer font-medium">Portfolio</a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-semibold">{isEditing ? 'Edit Account' : 'Create Account'}</span>
        </div>

        {/* Header section matching Updated-AI-Insight UI */}
        <div className="flex items-start gap-4 pb-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Account' : 'Create New Account'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? 'Update the details for this account' : 'Add a new client account to the system'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-sm border-gray-100 card-enterprise bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                <Building2 className="w-5 h-5 text-gray-500" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Account Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name"
                  placeholder="Enter account name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white border-gray-200 shadow-sm h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryUnit" className="text-gray-700">Delivery Unit <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.delivery_unit_id} 
                  onValueChange={(val) => setFormData({...formData, delivery_unit_id: val})}
                  required
                >
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm h-11">
                    <SelectValue placeholder="Select delivery unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager" className="text-gray-700">Account Manager</Label>
                <Input 
                  id="manager"
                  placeholder="Enter account manager name"
                  value={formData.account_manager}
                  onChange={(e) => setFormData({...formData, account_manager: e.target.value})}
                  className="bg-white border-gray-200 shadow-sm h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview" className="text-gray-700">Customer Overview</Label>
                <Textarea 
                  id="overview"
                  placeholder="Provide an overview of the customer and their business"
                  value={formData.customer_overview}
                  onChange={(e) => setFormData({...formData, customer_overview: e.target.value})}
                  className="bg-white border-gray-200 shadow-sm min-h-[120px] resize-y"
                />
                <p className="text-xs text-gray-400">Optional: Describe the customer's business, industry, and key characteristics</p>
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Current Revenue ($)</Label>
                    <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-semibold shadow-sm">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.total_revenue || 0)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Current AI Revenue ($)</Label>
                    <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md text-emerald-700 font-semibold shadow-sm">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formData.ai_revenue || 0)}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_revenue" className="text-gray-700">Target Revenue ($)</Label>
                  <Input 
                    id="target_revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter target revenue"
                    value={formData.target_revenue || ''}
                    onChange={(e) => setFormData({...formData, target_revenue: parseFloat(e.target.value) || 0})}
                    className="bg-white border-gray-200 shadow-sm h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forecast_revenue" className="text-gray-700">Forecast Revenue ($)</Label>
                  <Input 
                    id="forecast_revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter forecast revenue"
                    value={formData.forecast_revenue || ''}
                    onChange={(e) => setFormData({...formData, forecast_revenue: parseFloat(e.target.value) || 0})}
                    className="bg-white border-gray-200 shadow-sm h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations" className="text-gray-700">AI Recommendations</Label>
                <Textarea 
                  id="recommendations"
                  placeholder="Enter AI-related recommendations for this account"
                  value={formData.ai_recommendations}
                  onChange={(e) => setFormData({...formData, ai_recommendations: e.target.value})}
                  className="bg-white border-gray-200 shadow-sm min-h-[120px] resize-y"
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-12">
            <Button type="button" variant="outline" onClick={() => navigate(backUrl)} className="bg-white shadow-sm" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] shadow-sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Update Account' : 'Create Account')}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FinancialAccountForm;
