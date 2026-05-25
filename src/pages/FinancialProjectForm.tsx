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
import { ArrowLeft, Briefcase, Loader2, Map, Menu, ChevronRight, FileText } from 'lucide-react';
import { RoadmapEditor } from '@/components/accounts/RoadmapEditor';
import { AccountDocuments } from '@/components/accounts/AccountDocuments';
import { useToast } from '@/hooks/use-toast';
import { 
  getFinanceProjectById, 
  createFinanceProject, 
  updateFinanceProject,
  getFinanceAccountById, // To read the parent account details (e.g. DU)
  getFinanceDeliveryUnits
} from '@/services/api';

const FinancialProjectForm = () => {
  const { accountId, projectId } = useParams<{ accountId: string, projectId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || `/financials/${accountId}`;
  const isFromPE = backUrl.includes('private-equity');
  const { toast } = useToast();
  
  const isEditing = !!projectId;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryUnits, setDeliveryUnits] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    account_id: accountId || '',
    delivery_unit_id: '',
    overview: '',
    status: 'active',
    project_type: 'T&M',
    total_revenue: '0',
    ytd_revenue: '0',
    total_ai_revenue: '0',
    ai_revenue: '0',
    ai_assisted_revenue: '0',
    expected_revenue: '0',
    from_date: '',
    to_date: '',
    technical_roadmap: '',
    product_roadmap: '',
    ai_roadmap: '',
    ai_recommendations: '',
    code_coverage_pct: '0',
    ai_direct_hours: '0',
    ai_assist_hours: '0',
    ai_direct_people: '0',
    ai_assisted_people: '0',
    tech_stack: ''
  });

  useEffect(() => {
    if (!accountId) {
      navigate(backUrl);
      return;
    }

    const fetchData = async () => {
      try {
        const units = await getFinanceDeliveryUnits();
        setDeliveryUnits(units);
        
        let accountDuId = '';
        if (accountId) {
            const accData = await getFinanceAccountById(accountId);
            accountDuId = accData.delivery_unit_id || '';
        }

        if (isEditing) {
          const pData = await getFinanceProjectById(projectId!);
          setFormData({
            name: pData.name || '',
            account_id: accountId,
            delivery_unit_id: pData.delivery_unit_id || accountDuId || '',
            overview: pData.overview || '',
            status: pData.status || 'active',
            project_type: pData.project_type || 'T&M',
            total_revenue: pData.total_revenue?.toString() || '0',
            ytd_revenue: pData.ytd_revenue?.toString() || '0',
            total_ai_revenue: pData.total_ai_revenue?.toString() || (pData.ai_revenue + pData.ai_assisted_revenue)?.toString() || '0',
            ai_revenue: pData.ai_revenue?.toString() || '0',
            ai_assisted_revenue: pData.ai_assisted_revenue?.toString() || '0',
            expected_revenue: pData.expected_revenue?.toString() || '0',
            from_date: pData.from_date ? new Date(pData.from_date).toISOString().split('T')[0] : '',
            to_date: pData.to_date ? new Date(pData.to_date).toISOString().split('T')[0] : '',
            technical_roadmap: pData.technical_roadmap || '',
            product_roadmap: pData.product_roadmap || '',
            ai_roadmap: pData.ai_roadmap || '',
            ai_recommendations: pData.ai_recommendations || '',
            code_coverage_pct: pData.code_coverage_pct?.toString() || '0',
            ai_direct_hours: pData.ai_direct_hours?.toString() || '0',
            ai_assist_hours: pData.ai_assist_hours?.toString() || '0',
            ai_direct_people: pData.ai_direct_people?.toString() || '0',
            ai_assisted_people: pData.ai_assisted_people?.toString() || '0',
            tech_stack: Array.isArray(pData.tech_stack) ? pData.tech_stack.join(', ') : (pData.tech_stack || '')
          });
        } else {
            setFormData(prev => ({ ...prev, delivery_unit_id: accountDuId }));
        }
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message || "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId, projectId, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        expected_revenue: parseFloat(formData.expected_revenue) || 0,
        total_revenue: parseFloat(formData.total_revenue) || 0,
        ytd_revenue: parseFloat(formData.ytd_revenue) || 0,
        ai_revenue: parseFloat(formData.ai_revenue) || 0,
        ai_assisted_revenue: parseFloat(formData.ai_assisted_revenue) || 0,
        total_ai_revenue: parseFloat(formData.ai_revenue) + parseFloat(formData.ai_assisted_revenue) || parseFloat(formData.total_ai_revenue) || 0,
        code_coverage_pct: parseFloat(formData.code_coverage_pct) || 0,
        ai_direct_hours: parseFloat(formData.ai_direct_hours) || 0,
        ai_assist_hours: parseFloat(formData.ai_assist_hours) || 0,
        ai_direct_people: parseInt(formData.ai_direct_people) || 0,
        ai_assisted_people: parseInt(formData.ai_assisted_people) || 0,
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        from_date: formData.from_date ? new Date(formData.from_date).toISOString() : null,
        to_date: formData.to_date ? new Date(formData.to_date).toISOString() : null
      };

      if (isEditing) {
        await updateFinanceProject(projectId!, payload);
        toast({ title: "Project Updated", description: "The project has been updated successfully." });
        navigate(`/financials/${accountId}/projects/${projectId}`, { state: { backUrl } });
      } else {
        await createFinanceProject(payload);
        toast({ title: "Project Created", description: "New project added to the account." });
        navigate(`/financials/${accountId}`, { state: { backUrl } });
      }
    } catch (error: any) {
      toast({ title: "Error saving project", description: error.message || "Something went wrong.", variant: "destructive" });
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-2 border-b border-gray-200 pb-2">
          <div 
             onClick={() => navigate(backUrl)}
             className="p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors mr-1 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </div>
          <a 
            onClick={() => navigate(backUrl === '/financials' ? '/accounts' : backUrl)} 
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            {isFromPE ? 'Private Equity' : 'Accounts'}
          </a>
          {isFromPE && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <a onClick={() => navigate(backUrl)} className="text-blue-600 hover:underline cursor-pointer font-medium">Portfolio</a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <a onClick={() => navigate(`/financials/${accountId}`, { state: { backUrl } })} className="text-blue-600 hover:underline cursor-pointer font-medium">
            Account Details
          </a>
          {isEditing && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <a onClick={() => navigate(`/financials/${accountId}/projects/${projectId}`, { state: { backUrl } })} className="text-blue-600 hover:underline cursor-pointer font-medium">
                Project Details
              </a>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-semibold">{isEditing ? 'Edit Project' : 'Create Project'}</span>
        </div>

        <div className="flex items-start gap-4 pb-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Project' : 'Add New Project'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? 'Update the details for this project' : 'Add a new project to the account'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-sm border-gray-100 card-enterprise bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                <Briefcase className="w-5 h-5 text-gray-500" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold">Project Name</Label>
                  <Input id="name" placeholder="Enter project name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-white border-gray-200 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700 font-semibold">Project Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger className="bg-white h-11"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700 font-semibold">Project Type</Label>
                  <Select value={formData.project_type || 'T&M'} onValueChange={(val) => setFormData({...formData, project_type: val})}>
                    <SelectTrigger className="bg-white h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent><SelectItem value="T&M">T&M</SelectItem><SelectItem value="FP">FP</SelectItem><SelectItem value="Retainer">Retainer</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="tech_stack" className="text-gray-700 font-semibold">Tech Stack (comma separated)</Label>
                   <Input id="tech_stack" placeholder="React, Node.js, Python..." value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} className="bg-white border-gray-200 h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="from_date" className="text-gray-700 font-semibold">From Date</Label>
                  <Input type="date" id="from_date" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} className="bg-white h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_date" className="text-gray-700 font-semibold">To Date</Label>
                  <Input type="date" id="to_date" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} className="bg-white h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview" className="text-gray-700 font-semibold">Project Overview</Label>
                <Textarea id="overview" placeholder="Provide an overview of the project goals and scope" value={formData.overview} onChange={(e) => setFormData({...formData, overview: e.target.value})} className="bg-white min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 card-enterprise bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                Roadmaps & Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <RoadmapEditor 
                  label="Technical Roadmap" 
                  value={formData.technical_roadmap} 
                  onChange={(val) => setFormData({...formData, technical_roadmap: val})} 
                  placeholder="Enter technical roadmap details" 
               />
               <RoadmapEditor 
                  label="Product Roadmap" 
                  value={formData.product_roadmap} 
                  onChange={(val) => setFormData({...formData, product_roadmap: val})} 
                  placeholder="Enter product roadmap details" 
               />
               <RoadmapEditor 
                  label="AI Roadmap" 
                  value={formData.ai_roadmap} 
                  onChange={(val) => setFormData({...formData, ai_roadmap: val})} 
                  placeholder="Enter AI roadmap details" 
               />
               <div className="space-y-2">
                  <Label htmlFor="ai_recommendations" className="text-gray-700 font-semibold">AI Recommendations</Label>
                  <Textarea id="ai_recommendations" placeholder="AI-specific suggestions for this project" value={formData.ai_recommendations} onChange={(e) => setFormData({...formData, ai_recommendations: e.target.value})} className="bg-white min-h-[100px]" />
               </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 card-enterprise bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                Metrics & AI Revenue Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expected_revenue" className="text-gray-700 font-semibold">Expected Revenue ($)</Label>
                    <Input id="expected_revenue" type="number" value={formData.expected_revenue} onChange={(e) => setFormData({...formData, expected_revenue: e.target.value})} className="bg-white h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_revenue" className="text-gray-700 font-semibold">Current Revenue ($)</Label>
                    <Input id="total_revenue" type="number" value={formData.total_revenue} onChange={(e) => setFormData({...formData, total_revenue: e.target.value})} className="bg-white h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ytd_revenue" className="text-gray-700 font-semibold">YTD Revenue ($)</Label>
                    <Input id="ytd_revenue" type="number" value={formData.ytd_revenue} onChange={(e) => setFormData({...formData, ytd_revenue: e.target.value})} className="bg-white h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code_coverage_pct" className="text-gray-700 font-semibold">Code Coverage (%)</Label>
                    <Input id="code_coverage_pct" type="number" value={formData.code_coverage_pct} onChange={(e) => setFormData({...formData, code_coverage_pct: e.target.value})} className="bg-white h-11" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div className="space-y-4">
                    <h3 className="font-bold text-blue-700 text-sm italic">Generative AI Direct</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label htmlFor="ai_revenue">Revenue ($)</Label>
                          <Input id="ai_revenue" type="number" value={formData.ai_revenue} onChange={(e) => setFormData({...formData, ai_revenue: e.target.value})} className="bg-white h-10" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="ai_direct_hours">Hours</Label>
                          <Input id="ai_direct_hours" type="number" value={formData.ai_direct_hours} onChange={(e) => setFormData({...formData, ai_direct_hours: e.target.value})} className="bg-white h-10" />
                       </div>
                       <div className="space-y-2 col-span-2">
                          <Label htmlFor="ai_direct_people">People Count</Label>
                          <Input id="ai_direct_people" type="number" value={formData.ai_direct_people} onChange={(e) => setFormData({...formData, ai_direct_people: e.target.value})} className="bg-white h-10" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-emerald-700 text-sm italic">Generative AI Assisted</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label htmlFor="ai_assisted_revenue">Revenue ($)</Label>
                          <Input id="ai_assisted_revenue" type="number" value={formData.ai_assisted_revenue} onChange={(e) => setFormData({...formData, ai_assisted_revenue: e.target.value})} className="bg-white h-10" />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="ai_assist_hours">Hours</Label>
                          <Input id="ai_assist_hours" type="number" value={formData.ai_assist_hours} onChange={(e) => setFormData({...formData, ai_assist_hours: e.target.value})} className="bg-white h-10" />
                       </div>
                       <div className="space-y-2 col-span-2">
                          <Label htmlFor="ai_assisted_people">People Count</Label>
                          <Input id="ai_assisted_people" type="number" value={formData.ai_assisted_people} onChange={(e) => setFormData({...formData, ai_assisted_people: e.target.value})} className="bg-white h-10" />
                       </div>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Card className="shadow-sm border-gray-100 card-enterprise bg-white animate-in fade-in duration-500">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Project Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <AccountDocuments ownerType="project" accountId={projectId} />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4 pb-12">
            <Button type="button" variant="outline" onClick={() => navigate(isEditing ? `/financials/${accountId}/projects/${projectId}` : `/financials/${accountId}`, { state: { backUrl } })} className="bg-white" disabled={submitting}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default FinancialProjectForm;
