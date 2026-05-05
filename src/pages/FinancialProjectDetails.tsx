import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Menu, ArrowLeft, Pencil, Calendar, DollarSign, Bot, Code, UploadCloud, FileText, CheckCircle, ShieldCheck, ClipboardList, Loader2, Building2, LayoutGrid, ClipboardCheck, BookOpen, FileCheck, Info, Trash2 as TrashIcon, FileSearch, Activity, Target, Users, ChevronRight, CheckCircle2, AlertTriangle, TrendingUp, Zap, ShieldAlert, Clock, TrendingDown, Flag, PanelLeftClose, PanelLeftOpen, ChevronsLeft, ChevronsRight, Map, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFinanceProjectById, getFinanceAccountById, deleteFinanceProject, api } from '@/services/api';
import { RoadmapViewer } from '@/components/accounts/RoadmapViewer';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  category: string;
  name: string;
  type: string;
  date: string;
  desc?: string;
  summary: string;
  objectives: string[];
  stakeholders: string[];
  insights: Array<{
    icon: any;
    text: string;
    color: string;
  }>;
  wsrData?: {
    projectName?: string;
    client?: string;
    reportingPeriod?: string;
    status?: string;
    accomplishments?: string[];
    upcomingTasks?: string[];
    risks?: string[];
    blockers?: string[];
    budgetStatus?: string;
    summary?: string;
  };
}

const CATEGORIES = [
  { id: 'wsr-reports', label: 'WSR Reports', icon: LayoutGrid, title: 'Weekly Status Reports' },
  { id: 'code-quality', label: 'Code Quality', icon: ShieldCheck, title: 'Code Quality Documents' },
  { id: 'tech-reviews', label: 'Tech Reviews', icon: ClipboardCheck, title: 'Technical Review Reports' },
  { id: 'best-practices', label: 'Best Practices', icon: BookOpen, title: 'Engineering Best Practices' },
  { id: 'sow-documents', label: 'SOW Documents', icon: FileCheck, title: 'Statement of Work Documents' }
];

const FinancialProjectDetails = () => {
  const { accountId, projectId } = useParams<{ accountId: string, projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || '/financials';
  const isFromPE = backUrl.includes('private-equity');
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  // Document states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('wsr-reports');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [isFileSidebarCollapsed, setIsFileSidebarCollapsed] = useState(false);

  // Insights state
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);

  const filteredDocs = documents.filter(d => d.category === activeTab);
  const activeDoc = filteredDocs.find(d => d.id === activeDocId) || (filteredDocs.length > 0 ? filteredDocs[0] : null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId) {
        setDocuments([]);
        return;
      }

      setIsDocLoading(true);
      try {
        const data = await api.getFinanceDocument(projectId, activeTab);
        if (data) {
          const mappedDoc = mapBackendToFrontend(data, activeTab);
          setDocuments([mappedDoc]);
          setActiveDocId(mappedDoc.id);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        setDocuments([]);
      } finally {
        setIsDocLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId, activeTab]);

  const mapBackendToFrontend = (data: any, category: string): Document => {
    try {
      let content = data.content;

      // Handle string content that might be JSON or wrapped in markdown
      if (typeof content === 'string') {
        const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
        try {
          content = JSON.parse(cleaned);
        } catch (e) {
          console.error('Failed to parse content as JSON:', e);
          content = { summary: content };
        }
      }

      const findContent = (keywords: string[]) => {
        const key = Object.keys(content).find(k =>
          keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))
        );
        return key ? content[key] : null;
      };

      const summary = findContent(['summary', 'overview', 'description', 'project_overview']) || 'AI generated summary of the document.';
      const objectives = findContent(['objective', 'scope', 'goal', 'accomplishments']) || [];
      const stakeholders = findContent(['stakeholder', 'team', 'resource']) || [];

      const formatValue = (v: any): string => {
        if (v === null || v === undefined) return '';
        if (Array.isArray(v)) return v.map(item => formatValue(item)).join(', ');
        if (typeof v === 'object' && v !== null) {
          if ('text' in v) return String(v.text);
          if ('description' in v) return String(v.description);
          if ('finding' in v) return String(v.finding);
          if ('value' in v) return String(v.value);
          if ('name' in v) return String(v.name);
          const values = Object.values(v)
            .map(item => formatValue(item))
            .filter(val => val.length > 2 && !/^\d+$/.test(val.replace(/[.\s]/g, '')));
          return values.join('. ');
        }
        return String(v);
      };

      const filteredInsights = Object.entries(content)
        .filter(([key]) => {
          const lKey = key.toLowerCase();
          return !['summary', 'overview', 'description', 'objective', 'scope', 'goal', 'stakeholder', 'team', 'resource', 'wsr', 'reporting'].some(kw => lKey.includes(kw));
        })
        .map(([key, value]) => ({
          icon: Info,
          text: `${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}: ${formatValue(value)}`,
          color: 'text-indigo-600 bg-indigo-50/50'
        }))
        .filter(insight => insight.text.length > insight.text.split(':')[0].length + 5);

      const doc: Document = {
        id: data.document_id,
        category: category,
        name: `${CATEGORIES.find(c => c.id === category)?.label || 'Document'} - ${new Date(data.created_at).toLocaleDateString()}`,
        type: data.document_type || 'AI Analyzed',
        date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        summary: formatValue(summary),
        objectives: (Array.isArray(objectives) ? objectives.map(o => formatValue(o)) : [formatValue(objectives)])
          .filter(o => o.length > 5 && !/^\d+$/.test(o.replace(/[.\s]/g, ''))),
        stakeholders: (Array.isArray(stakeholders) ? stakeholders.map(s => formatValue(s)) : [formatValue(stakeholders)])
          .filter(s => s.length > 2 && !/^\d+$/.test(s.replace(/[.\s]/g, ''))),
        insights: filteredInsights
      };

      if (category === 'wsr-reports' || data.document_type === 'WSR') {
        doc.wsrData = {
          projectName: formatValue(content.project_overview?.project_name || content.project_overview_and_reporting_period?.project_name),
          client: formatValue(content.project_overview?.client || content.project_overview_and_reporting_period?.client),
          reportingPeriod: formatValue(content.project_overview?.reporting_period || content.project_overview_and_reporting_period?.reporting_period),
          status: formatValue(content.overall_project_status),
          accomplishments: Array.isArray(content.key_accomplishments_and_milestones || content.key_accomplishments_and_milestones_achieved_this_week)
            ? (content.key_accomplishments_and_milestones || content.key_accomplishments_and_milestones_achieved_this_week).map((v: any) => formatValue(v))
            : [formatValue(content.key_accomplishments_and_milestones || content.key_accomplishments_and_milestones_achieved_this_week)],
          upcomingTasks: Array.isArray(content.upcoming_tasks_and_planned_activities || content.upcoming_tasks_and_planned_activities_for_next_week)
            ? (content.upcoming_tasks_and_planned_activities || content.upcoming_tasks_and_planned_activities_for_next_week).map((v: any) => formatValue(v))
            : [formatValue(content.upcoming_tasks_and_planned_activities || content.upcoming_tasks_and_planned_activities_for_next_week)],
          risks: Array.isArray(content.risks_and_issues_identified)
            ? content.risks_and_issues_identified.map((v: any) => formatValue(v))
            : [formatValue(content.risks_and_issues_identified)],
          blockers: Array.isArray(content.blockers_and_dependencies)
            ? content.blockers_and_dependencies.map((v: any) => formatValue(v))
            : [formatValue(content.blockers_and_dependencies)],
          budgetStatus: formatValue(content.budget_and_timeline_status),
          summary: formatValue(content.resource_utilization_and_team_status)
        };
      }
      return doc;
    } catch (e) {
      console.error('Error mapping document:', e);
      return {
        id: data.document_id,
        category: category,
        name: 'Parsing Error',
        type: 'Error',
        date: new Date().toLocaleDateString(),
        summary: 'There was an error parsing the document content.',
        objectives: [],
        stakeholders: [],
        insights: []
      };
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!projectId) return;

    toast({
      title: "Upload Started",
      description: `Uploading ${file.name} to ${CATEGORIES.find(c => c.id === activeTab)?.label}...`,
    });

    setIsDocLoading(true);
    try {
      await api.importFinanceDocument(projectId, activeTab, file);
      toast({
        title: "Upload Successful",
        description: `${file.name} has been processed and analyzed.`,
      });
      const data = await api.getFinanceDocument(projectId, activeTab);
      if (data) {
        const mappedDoc = mapBackendToFrontend(data, activeTab);
        setDocuments([mappedDoc]);
        setActiveDocId(mappedDoc.id);
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and process the document.",
        variant: "destructive"
      });
    } finally {
      setIsDocLoading(false);
    }
  };

  const handleDocDelete = async () => {
    if (!projectId || !activeDocId) return;

    setIsDocLoading(true);
    try {
      await api.deleteFinanceDocument(projectId, activeTab);
      setDocuments([]);
      setActiveDocId(null);
      toast({
        title: "Deleted",
        description: "Document deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document.",
        variant: "destructive"
      });
    } finally {
      setIsDocLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (!accountId || !projectId) {
          navigate('/financials');
          return;
        }
        
        const [projData, accData] = await Promise.all([
          getFinanceProjectById(projectId),
          getFinanceAccountById(accountId)
        ]);
        
        setProject(projData);
        setAccount(accData);
        
        if (projData.overall_insights) {
          setInsights(projData.overall_insights);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching project details",
          description: error.message,
          variant: "destructive"
        });
        navigate(`/financials/${accountId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [accountId, projectId, navigate, toast]);


  const handleGenerateInsights = async () => {
    if (!projectId) return;
    
    setIsGeneratingInsights(true);
    toast({
      title: "Generating Insights",
      description: "Our AI agents are analyzing project documents and data...",
    });
    
    try {
      const result = await api.generateProjectInsights(projectId);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({
          title: "Insights Generated",
          description: "Project analysis completed successfully.",
        });
        // Optionally refresh project data to get updated timestamps
        const projData = await getFinanceProjectById(projectId);
        setProject(projData);
      } else {
        throw new Error(result.error || "Failed to generate insights");
      }
    } catch (err: any) {
      console.error("Failed to generate insights:", err);
      toast({
        title: "Generation Failed",
        description: err.message || "An unexpected error occurred during analysis.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFinanceProject(projectId!);
      toast({
        title: "Project Deleted",
        description: "The project has been successfully removed."
      });
      navigate(`/financials/${accountId}`);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete project.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!project) return null;

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-2 border-b border-gray-200 pb-2">
          <div 
             onClick={() => navigate(isFromPE ? backUrl : '/financials')}
             className="p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors mr-1 shadow-sm"
          >
            <Menu className="w-4 h-4" />
          </div>
          <a 
            onClick={() => navigate(isFromPE ? backUrl : '/financials')} 
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
            {account?.name || 'Account Details'}
          </a>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-semibold">{project?.name || 'Project Details'}</span>
        </div>

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-2">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1 font-medium">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {account?.name || 'Account'}
                </div>
                <Badge className={
                    project.status?.toLowerCase() === 'active' 
                    ? "bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-100"
                    : "bg-red-100 text-red-700 border-red-200 shadow-none hover:bg-red-100"
                }>
                  {project.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Start: {project.from_date ? formatDate(project.from_date) : 'N/A'} | End: {project.to_date ? formatDate(project.to_date) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-sm">
                  <Brain className="w-4 h-4" />
                  Generate Insights
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2 border-b">
                  <DialogTitle className="flex items-center justify-between text-2xl">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-600" /> Project AI Insights
                    </div>
                    <Button 
                      onClick={handleGenerateInsights} 
                      disabled={isGeneratingInsights}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGeneratingInsights ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Regenerate
                        </>
                      )}
                    </Button>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                  {isGeneratingInsights && !insights ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900">AI Agents at Work</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Analyzing WSRs, SOWs, and technical documents for this project...</p>
                      </div>
                    </div>
                  ) : insights ? (
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="overview">Analysis Overview</TabsTrigger>
                        <TabsTrigger value="details">Detailed Insights</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                          <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5" /> Executive Summary
                          </h4>
                          <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                            {insights.executive_summary || insights.summary || "No executive summary available."}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-emerald-100 bg-emerald-50/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Opportunities
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-xs text-slate-600 space-y-2">
                                {Array.isArray(insights.opportunities) ? insights.opportunities.map((opt: any, i: number) => (
                                  <li key={i} className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                    {typeof opt === 'string' ? opt : opt.text || opt.description}
                                  </li>
                                )) : <li>No specific opportunities identified.</li>}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="border-amber-100 bg-amber-50/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Risks & Issues
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-xs text-slate-600 space-y-2">
                                {Array.isArray(insights.risks) ? insights.risks.map((risk: any, i: number) => (
                                  <li key={i} className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                                    {typeof risk === 'string' ? risk : risk.text || risk.description}
                                  </li>
                                )) : <li>No significant risks identified.</li>}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <Bot className="w-4 h-4 text-blue-500" /> Strategic Recommendations
                          </h4>
                          <div className="space-y-3">
                            {Array.isArray(insights.recommended_actions) ? insights.recommended_actions.map((action: any, i: number) => (
                              <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <p className="text-sm text-slate-700 font-medium">{typeof action === 'string' ? action : action.text || action.recommendation}</p>
                              </div>
                            )) : <p className="text-sm text-slate-500 italic">No recommendations available.</p>}
                          </div>
                        </div>

                        {insights.evidence_summary && (
                          <div className="mt-6">
                            <h4 className="font-bold text-slate-900 text-sm mb-2">Evidence Summary</h4>
                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                              {insights.evidence_summary}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="text-xs text-slate-400">
                            Confidence Score: <span className="font-bold text-slate-600">{(insights.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                          <div className="text-xs text-slate-400 italic">
                            Generated: {new Date(insights.generated_at || Date.now()).toLocaleString()}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Brain className="w-12 h-12 text-slate-200 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900">Project AI Analysis</h3>
                      <p className="text-slate-500 max-w-xs mb-6">Our AI agents will analyze all uploaded project documents (WSR, SOW, etc.) to provide deep insights.</p>
                      <Button 
                        onClick={handleGenerateInsights} 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={isGeneratingInsights}
                      >
                        {isGeneratingInsights ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                        Generate Project Insights
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="gap-2 bg-white" onClick={() => navigate(`/financials/${accountId}/projects/${projectId}/edit`, { state: { backUrl } })}>
              <Pencil className="w-4 h-4" />
              Edit Project
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none">
                  <TrashIcon className="w-4 h-4" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project and all its associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete Project</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Total Revenue Card */}
            <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-950 text-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Current Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 <p className="text-3xl font-bold text-emerald-900 mb-4">{formatCurrency(project.total_revenue)}</p>
                 <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                        <span className="font-semibold block">Expected</span>
                        {formatCurrency(project.expected_revenue)}
                    </div>
                    <div>
                        <span className="font-semibold block">YTD</span>
                        {formatCurrency(project.ytd_revenue)}
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Total AI Revenue Card */}
            <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100 pb-3">
                 <div className="flex justify-between items-center w-full">
                    <CardTitle className="flex items-center gap-2 text-blue-950 text-lg">
                      <Bot className="w-5 h-5 text-blue-600" />
                      Total AI Revenue
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 font-medium whitespace-nowrap px-2">
                        Penetration: {(project.ai_penetration || project.ai_penetration_pct || (project.total_revenue > 0 ? (((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0)) / project.total_revenue) * 100 : 0)).toFixed(1)}%
                    </Badge>
                 </div>
              </CardHeader>
              <CardContent className="pt-6">
                 <p className="text-3xl font-bold text-blue-900 mb-4">{formatCurrency((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0) || project.total_ai_revenue || 0)}</p>
                 <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                        <span className="font-semibold block ml-1 text-gray-500">Direct / Assist</span>
                        {formatCurrency(project.ai_revenue)} / {formatCurrency(project.ai_assisted_revenue)}
                    </div>
                    <div>
                        <span className="font-semibold block ml-1 text-gray-500">People</span>
                        {project.ai_direct_people || 0} / {project.ai_assisted_people || 0}
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Code Coverage Card */}
            <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-indigo-950 text-lg">
                  <Code className="w-5 h-5 text-indigo-600" />
                  Code Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-indigo-900 mb-6">{project.code_coverage_pct?.toFixed(1) || '0.0'}%</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                    <span className="text-[10px] font-semibold text-gray-400 block mb-1">MEASUREMENT</span>
                    <Progress 
                      value={project.code_coverage_pct || 0} 
                      className="h-2 bg-gray-200 [&>div]:bg-indigo-600" 
                    />
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Tabbed Section */}
        <Tabs defaultValue="overview" className="w-full mt-6">
          <TabsList className="grid grid-cols-4 w-full gap-2 h-auto">
              <TabsTrigger value="overview" className="tab-blue h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight flex items-center justify-center gap-2">
                Overview
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="tab-purple h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight flex items-center justify-center gap-2">
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="tab-emerald h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight flex items-center justify-center gap-2">
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="circle-penetration" className="tab-rose h-auto py-2 whitespace-normal text-xs px-1 sm:px-2 md:text-sm leading-tight flex items-center justify-center gap-2">
                Circle Penetration
              </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Project Overview</h3>
                <div className="bg-blue-50/30 border border-blue-100/50 rounded-lg p-6 min-h-[100px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {insights?.executive_summary || insights?.summary || project.overview || 'No project overview defined.'}
                </div>
              </CardContent>
            </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <RoadmapViewer 
                title="Technical Roadmap" 
                content={project.technical_roadmap} 
                icon={Map}
              />
              <RoadmapViewer 
                title="Product Roadmap" 
                content={project.product_roadmap} 
                icon={Map}
              />
              <RoadmapViewer 
                title="AI Roadmap" 
                content={project.ai_roadmap} 
                icon={Map}
              />
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" /> AI Recommendations
                </h3>
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-8 min-h-[200px] text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {Array.isArray(insights?.recommended_actions) 
                    ? insights.recommended_actions.map((a: any) => typeof a === 'string' ? a : a.text || a.recommendation).join('\n\n')
                    : project.ai_recommendations || 'No AI recommendations defined for this project.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliverables">
            <Card className="shadow-sm border-gray-100 p-8 text-center text-gray-500">
              Deliverables content goes here.
            </Card>
          </TabsContent>

          <TabsContent value="circle-penetration">
            <Card className="shadow-sm border-gray-100 p-8 text-center text-gray-500">
              Circle Penetration metrics go here.
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Analytics Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Report Analytics</h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto bg-gray-100/50 p-1 rounded-lg gap-1 border border-gray-100 mb-6">
              {CATEGORIES.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id} 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded py-2 px-4 flex items-center gap-2 text-sm"
                >
                  <cat.icon className="w-4 h-4" /> 
                  {cat.label} {activeTab === cat.id ? `(${filteredDocs.length})` : ''}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="flex flex-col gap-6">
                  {/* Upload Area */}
                  <label
                    htmlFor={`file-upload-${cat.id}`}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && !isDocLoading) handleFileUpload(file);
                    }}
                    className={cn(
                      "relative group overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer block",
                      isDragging
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50/50",
                      isDocLoading && "pointer-events-none opacity-80"
                    )}
                  >
                    <input
                      type="file"
                      id={`file-upload-${cat.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = ''; // Allow selecting the same file again
                      }}
                    />
                    <div className="p-10 flex flex-col items-center text-center gap-4">
                      {isDocLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                          <p className="text-sm font-bold text-gray-900">Processing Document...</p>
                        </div>
                      ) : (
                        <>
                          <div className={cn(
                            "p-4 rounded-full transition-all duration-300",
                            isDragging ? "bg-blue-600 text-white scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-110"
                          )}>
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              Upload {cat.label}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Drag and drop your file here, or <span className="text-blue-600 font-bold underline">browse files</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Document Display Area */}
                  {filteredDocs.length > 0 ? (
                    <Card className="shadow-sm border border-gray-100 bg-white overflow-hidden">
                      <div className="flex flex-col md:flex-row min-h-[500px]">
                        {/* File Sidebar */}
                        <div className={cn(
                          "border-r border-gray-100 bg-gray-50/30 flex flex-col transition-all duration-300 relative",
                          isFileSidebarCollapsed ? "w-12" : "w-full md:w-64"
                        )}>
                          <button
                            type="button"
                            onClick={() => setIsFileSidebarCollapsed(!isFileSidebarCollapsed)}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-20 hover:text-blue-600"
                          >
                            {isFileSidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                          </button>
                          
                          <div className={cn("p-4 border-b border-gray-100", isFileSidebarCollapsed && "hidden")}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documents</h4>
                          </div>
                          
                          <div className={cn("flex-1 overflow-y-auto p-2 space-y-1", isFileSidebarCollapsed && "hidden")}>
                            {filteredDocs.map((doc) => (
                              <button
                                key={doc.id}
                                onClick={() => setActiveDocId(doc.id)}
                                className={cn(
                                  "w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group",
                                  activeDocId === doc.id
                                    ? "bg-white border border-blue-100 shadow-sm text-blue-700"
                                    : "text-gray-600 hover:bg-white hover:border-gray-100"
                                )}
                              >
                                <div className="truncate flex items-center gap-2">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <span className="truncate">{doc.name}</span>
                                </div>
                                {activeDocId === doc.id && <ChevronRight className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 p-8 overflow-y-auto">
                          {activeDoc && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                                    <FileSearch className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h2 className="text-xl font-bold text-gray-900">{activeDoc.name}</h2>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{activeDoc.type} • {activeDoc.date}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleDocDelete}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </Button>
                              </div>

                              <div className="space-y-8">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> AI Analysis Summary
                                  </h4>
                                  <p className="text-gray-700 leading-relaxed font-medium">{activeDoc.summary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card className="rounded-2xl border-gray-100 shadow-none">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-800">
                                        <Target className="w-4 h-4 text-emerald-500" /> Key Objectives
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {activeDoc.objectives.map((obj, i) => (
                                          <li key={i} className="flex gap-2 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            {obj}
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>

                                  <Card className="rounded-2xl border-gray-100 shadow-none">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-800">
                                        <Users className="w-4 h-4 text-amber-500" /> Stakeholders
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex flex-wrap gap-2">
                                        {activeDoc.stakeholders.map((s, i) => (
                                          <Badge key={i} variant="secondary" className="px-2 py-0 border-none bg-gray-100 text-gray-600">
                                            {s}
                                          </Badge>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {activeDoc.wsrData && (
                                  <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-4">
                                      <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold">
                                        Status: <span className={cn(
                                          activeDoc.wsrData.status?.toLowerCase().includes('risk') ? "text-red-600" : "text-emerald-600"
                                        )}>{activeDoc.wsrData.status}</span>
                                      </div>
                                      <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold">
                                        Period: <span className="text-gray-900">{activeDoc.wsrData.reportingPeriod}</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4" /> Accomplishments
                                        </h5>
                                        {activeDoc.wsrData.accomplishments?.filter(Boolean).map((item, i) => (
                                          <div key={i} className="p-3 bg-emerald-50/50 rounded-xl text-sm text-gray-700">{item}</div>
                                        ))}
                                      </div>
                                      <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2">
                                          <Clock className="w-4 h-4" /> Upcoming Tasks
                                        </h5>
                                        {activeDoc.wsrData.upcomingTasks?.filter(Boolean).map((item, i) => (
                                          <div key={i} className="p-3 bg-blue-50/50 rounded-xl text-sm text-gray-700">{item}</div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {activeDoc.insights && activeDoc.insights.length > 0 && (
                                  <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deep AI Insights</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                      {activeDoc.insights.map((insight, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                          <div className={cn("p-2.5 rounded-lg shrink-0 flex items-center justify-center", insight.color)}>
                                            <insight.icon className="w-5 h-5" />
                                          </div>
                                          <p className="text-sm text-gray-700 font-medium self-center">{insight.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/30 text-gray-400">
                      <cat.icon className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No {cat.label} uploaded yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

      </div>
    </MainLayout>
  );
};

export default FinancialProjectDetails;
