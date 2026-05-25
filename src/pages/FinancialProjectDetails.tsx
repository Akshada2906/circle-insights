import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Menu, ArrowLeft, Pencil, Calendar, DollarSign, Bot, Code, UploadCloud, FileText, CheckCircle, ShieldCheck, ClipboardList, Loader2, Building2, LayoutGrid, ClipboardCheck, BookOpen, FileCheck, Info, Trash2 as TrashIcon, FileSearch, Activity, Target, Users, ChevronRight, CheckCircle2, AlertTriangle, TrendingUp, Zap, ShieldAlert, Clock, TrendingDown, Flag, PanelLeftClose, PanelLeftOpen, ChevronsLeft, ChevronsRight, Map, Brain, Upload, Download, Eye, Search, X, AlertCircle, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFinanceProjectById, getFinanceAccountById, deleteFinanceProject, api } from '@/services/api';
import { RoadmapViewer } from '@/components/accounts/RoadmapViewer';
import { ProjectAIInsights } from '@/components/accounts/ProjectAIInsights';
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
  status: string;
  summary: string;
  objectives: string[];
  stakeholders: string[];
  insights: Array<{
    icon: any;
    text: string;
    color: string;
  }>;
  rawContent?: any;
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

interface PendingFile {
  id: string;
  file: File;
  sizeStr: string;
  isOverLimit: boolean;
}

const CATEGORIES = [
  { id: 'wsr-reports', label: 'WSR Reports', icon: LayoutGrid, title: 'Weekly Status Reports' },
  { id: 'sow-documents', label: 'SOW Documents', icon: FileCheck, title: 'Statement of Work Documents' },
  { id: 'code-quality', label: 'Code Quality', icon: ShieldCheck, title: 'Code Quality Documents' },
  { id: 'tech-reviews', label: 'Tech Reviews', icon: ClipboardCheck, title: 'Technical Review Reports' },
  { id: 'best-practices', label: 'Best Practices', icon: BookOpen, title: 'Engineering Best Practices' },
  { id: 'other-docs', label: 'Other Documents', icon: FileText, title: 'Other Documents' }
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const cleanJsonString = (str: string) => {
  if (!str || typeof str !== 'string') return str;
  let cleaned = str.replace(/```json\n?|```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
};

const FinancialProjectDetails = () => {
  const { accountId, projectId } = useParams<{ accountId: string, projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backUrl = location.state?.backUrl || '/accounts';
  const isFromPE = backUrl.includes('private-equity');
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  // Document states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('wsr-reports'); // kept for category tab highlight if needed
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDocLoading, setIsDocLoading] = useState(false);
  const [isFileSidebarCollapsed, setIsFileSidebarCollapsed] = useState(false);

  // Advanced Bento Dashboard States
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Queue states
  const [selectedType, setSelectedType] = useState('wsr-reports');
  const [shortDescription, setShortDescription] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // Unified Modal state
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Insights state
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);

  const parsedInsights = useMemo(() => {
    if (!insights) return null;
    let parsed = insights;
    if (insights.raw_output) {
      try {
        const cleanStr = typeof insights.raw_output === 'string' ? cleanJsonString(insights.raw_output) : insights.raw_output;
        parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
      } catch (e) {
        console.error("Failed to parse raw_output", e);
      }
    }
    return parsed;
  }, [insights]);

  const filteredDocs = documents.filter(d => d.category === activeTab);
  const activeDoc = filteredDocs.find(d => d.id === activeDocId) || (filteredDocs.length > 0 ? filteredDocs[0] : null);

  const mapOtherDocToFrontend = (data: any): Document => {
    return {
      id: data.document_insight_id,
      category: 'other-docs',
      name: data.file_name,
      type: 'Other Document',
      date: new Date(data.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: data.context_hint || '-',
      status: 'Completed',
      summary: data.insight_markdown || 'No insights generated.',
      objectives: [],
      stakeholders: [],
      insights: []
    };
  };

  const fetchAllDocuments = async () => {
    if (!projectId) {
      setDocuments([]);
      return;
    }

    setIsDocLoading(true);
    try {
      const allDocs: Document[] = [];
      const apiCategories = ['wsr-reports', 'code-quality', 'tech-reviews', 'best-practices', 'sow-documents', 'other-docs'];

      for (const catId of apiCategories) {
        try {
          const data = await api.getFinanceDocument(projectId, catId);
          if (data) {
            allDocs.push(mapBackendToFrontend(data, catId));
          }
        } catch (e) {
          // Continue gracefully
        }
      }

      setDocuments(allDocs);
    } catch (error) {
      console.error('Failed to fetch finance documents:', error);
    } finally {
      setIsDocLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, [projectId]);

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

      const formattedSummary = formatValue(summary);
      const isError = formattedSummary.toLowerCase().includes('error:');

      const catObj = CATEGORIES.find(c => c.id === category);
      const docName = data.document_name || `${catObj?.label || 'Document'}`;

      const doc: Document = {
        id: data.document_id || String(Date.now()),
        category: category,
        name: docName,
        type: data.document_type || catObj?.label || 'AI Analyzed',
        date: new Date(data.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        desc: data.description || '-',
        status: isError ? 'Failed' : (data.status || 'Completed'),
        summary: formattedSummary,
        objectives: (Array.isArray(objectives) ? objectives.map(o => formatValue(o)) : [formatValue(objectives)])
          .filter(o => o.length > 5 && !/^\d+$/.test(o.replace(/[.\s]/g, ''))),
        stakeholders: (Array.isArray(stakeholders) ? stakeholders.map(s => formatValue(s)) : [formatValue(stakeholders)])
          .filter(s => s.length > 2 && !/^\d+$/.test(s.replace(/[.\s]/g, ''))),
        insights: filteredInsights.slice(0, 6),
        rawContent: content
      };

      if (category === 'wsr-reports' || data.document_type === 'WSR') {
        doc.wsrData = {
          projectName: formatValue(content?.project_overview?.project_name || content?.project_overview_and_reporting_period?.project_name),
          client: formatValue(content?.project_overview?.client || content?.project_overview_and_reporting_period?.client),
          reportingPeriod: formatValue(content?.project_overview?.reporting_period || content?.project_overview_and_reporting_period?.reporting_period),
          status: formatValue(content?.overall_project_status),
          accomplishments: Array.isArray(content?.key_accomplishments_and_milestones || content?.key_accomplishments_and_milestones_achieved_this_week)
            ? (content?.key_accomplishments_and_milestones || content?.key_accomplishments_and_milestones_achieved_this_week).map((v: any) => formatValue(v))
            : [formatValue(content?.key_accomplishments_and_milestones || content?.key_accomplishments_and_milestones_achieved_this_week)],
          upcomingTasks: Array.isArray(content?.upcoming_tasks_and_planned_activities || content?.upcoming_tasks_and_planned_activities_for_next_week)
            ? (content?.upcoming_tasks_and_planned_activities || content?.upcoming_tasks_and_planned_activities_for_next_week).map((v: any) => formatValue(v))
            : [formatValue(content?.upcoming_tasks_and_planned_activities || content?.upcoming_tasks_and_planned_activities_for_next_week)],
          risks: Array.isArray(content?.risks_and_issues_identified)
            ? content?.risks_and_issues_identified.map((v: any) => formatValue(v))
            : [formatValue(content?.risks_and_issues_identified)],
          blockers: Array.isArray(content?.blockers_and_dependencies)
            ? content?.blockers_and_dependencies.map((v: any) => formatValue(v))
            : [formatValue(content?.blockers_and_dependencies)],
          budgetStatus: formatValue(content?.budget_and_timeline_status),
          summary: formatValue(content?.resource_utilization_and_team_status)
        };
      }
      return doc;
    } catch (e) {
      console.error('Error mapping document:', e);
      return {
        id: data?.document_id || String(Date.now()),
        category: category,
        name: 'Parsing Error',
        type: 'Error',
        date: new Date().toLocaleDateString(),
        status: 'Failed',
        summary: 'There was an error parsing the document content structure.',
        objectives: [],
        stakeholders: [],
        insights: []
      };
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPending: PendingFile[] = [];
    Array.from(files).forEach((file) => {
      const isOverLimit = file.size > 50 * 1024 * 1024;
      newPending.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        sizeStr: formatFileSize(file.size),
        isOverLimit
      });
    });

    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCancel = () => {
    setPendingFiles([]);
    setShortDescription('');
  };

  const handleUploadAndProcess = async () => {
    if (!projectId) return;

    const validFiles = pendingFiles.filter((f) => !f.isOverLimit);
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    for (const item of validFiles) {
      try {
        const mappedApiCategory = ['wsr-reports', 'code-quality', 'tech-reviews', 'best-practices', 'sow-documents', 'other-docs'].includes(selectedType)
          ? selectedType
          : 'tech-reviews';
        await api.importFinanceDocument(projectId, mappedApiCategory, item.file);
        successCount++;
      } catch (error: any) {
        toast({
          title: `Failed to upload ${item.file.name}`,
          description: error.message || "Processing error occurred.",
          variant: "destructive"
        });
      }
    }

    setIsProcessing(false);
    if (successCount > 0) {
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${successCount} document(s).`
      });
      setPendingFiles((prev) => prev.filter((f) => f.isOverLimit));
      setShortDescription('');
      await fetchAllDocuments();
    }
  };

  const handleDeleteDoc = async (doc: Document) => {
    if (!projectId) return;
    try {
      await api.deleteFinanceDocument(projectId, doc.category);
      toast({
        title: "Document Deleted",
        description: `${doc.name} has been removed successfully.`
      });
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete document.",
        variant: "destructive"
      });
    }
  };

  // Keep a safe placeholder if activeTab drop triggers reference it
  const handleFileUpload = async (file: File) => {
    if (!projectId) return;
    try {
      setIsDocLoading(true);
      await api.importFinanceDocument(projectId, activeTab, file);
      toast({ title: "Upload Successful", description: `${file.name} processed successfully.` });
      await fetchAllDocuments();
    } catch (e: any) {
      toast({ title: "Upload Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsDocLoading(false);
    }
  };

  const handleDocDelete = async () => {
    if (!projectId || !activeDocId) return;
    const targetDoc = documents.find(d => d.id === activeDocId);
    if (targetDoc) await handleDeleteDoc(targetDoc);
  };

  const docFilteredData = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.type.toLowerCase().includes(q) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      doc.status.toLowerCase().includes(q)
    );
  });

  const docTotalPages = Math.ceil(docFilteredData.length / itemsPerPage);
  const docPaginatedData = docFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openViewModal = (doc: Document) => {
    setSelectedDoc(doc);
  };

  const renderNestedContent = (obj: any, depth = 0): React.ReactNode => {
    if (obj === null || obj === undefined) return null;

    if (Array.isArray(obj)) {
      return (
        <ul className="space-y-2 mt-2 ml-1">
          {obj.map((item, idx) => (
            <li key={idx} className="text-xs font-semibold text-slate-700 flex items-start gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100/80 leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div className="flex-1">
                {typeof item === 'object' ? renderNestedContent(item, depth + 1) : String(item)}
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof obj === 'object') {
      return (
        <div className={cn("space-y-4", depth > 0 ? "pt-3 border-t border-slate-100/80 mt-3" : "")}>
          {Object.entries(obj).map(([key, val]) => {
            const readableKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
            const isSimpleVal = typeof val === 'string' || typeof val === 'number';

            return (
              <div key={key} className={cn(
                depth === 0 ? "p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs hover:border-slate-300 transition-all duration-200" : "space-y-1.5"
              )}>
                <div className="flex items-center justify-between gap-3">
                  <h5 className={cn(
                    "font-bold tracking-tight text-slate-900",
                    depth === 0 ? "text-xs font-black text-blue-950 uppercase tracking-widest pb-2.5 border-b border-slate-100 block w-full" : "text-xs text-slate-800"
                  )}>
                    {readableKey}
                  </h5>
                  {isSimpleVal && (
                    <Badge variant="secondary" className="px-2.5 py-1 text-xs font-black bg-blue-50 text-blue-700 border-none ml-auto">
                      {String(val)}
                    </Badge>
                  )}
                </div>

                {!isSimpleVal && (
                  <div className="pt-1">
                    {renderNestedContent(val, depth + 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return <p className="text-xs font-medium text-slate-600 leading-relaxed pt-1">{String(obj)}</p>;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (!accountId || !projectId) {
          navigate(backUrl);
          return;
        }

        const [projData, accData] = await Promise.all([
          getFinanceProjectById(projectId),
          getFinanceAccountById(accountId)
        ]);

        setProject(projData);
        setAccount(accData);

        try {
          const res = await api.getProjectInsights(projectId);
          if (res && res.status === 'success' && res.insights) {
            setInsights(res.insights);
          } else if (projData.overall_insights) {
            setInsights(projData.overall_insights);
          }
        } catch (e) {
          if (projData.overall_insights) {
            setInsights(projData.overall_insights);
          }
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

  useEffect(() => {
    if (location.pathname.endsWith('/insights')) {
      setIsInsightsDialogOpen(true);
    }
  }, [location.pathname]);

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
              <a onClick={() => navigate(backUrl.replace('/insights', ''))} className="text-blue-600 hover:underline cursor-pointer font-medium">Portfolio</a>
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
            {false && (
              <DialogContent className="max-w-[96vw] w-full h-[94vh] max-h-[94vh] overflow-hidden flex flex-col p-0 bg-[#F8FAFC] border-none rounded-2xl shadow-2xl">
                <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
                  {/* TOP BAR */}
                  <div className="h-14 bg-white border-b border-slate-100/80 px-8 flex items-center justify-between shrink-0">
                    <span className="text-sm font-black text-slate-900 tracking-tight">Project Insights</span>
                    {/* The native close button injected by Shadcn/Radix handles the close cleanly without a duplicate button icon */}
                    <div className="w-8 h-8" />
                  </div>

                  {/* DASHBOARD SCROLLABLE GRID */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Master Card Header / Executive Summary Block matching Private Equity styling perfectly */}
                    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden shrink-0">
                      <CardHeader className="bg-gradient-to-r from-purple-50/60 via-blue-50/30 to-transparent border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Badge variant="secondary" className="bg-blue-50 text-[#0EA5E9] font-black text-[9px] px-2 py-0.5 border-none">
                              Project ID: {project?.id?.substring(0, 10)?.toUpperCase() || "PAI-882-QX"}
                            </Badge>
                            <span>•</span>
                            <span>Last updated 12 mins ago</span>
                          </div>
                          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                            {project?.name || "Cloud Migration Strategy"}
                          </CardTitle>
                        </div>

                        {/* Circular Score Indicator */}
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-2xs shrink-0">
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                              <circle cx="50" cy="50" r="40" stroke="#0EA5E9" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset="35" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-xs font-black text-slate-900">
                              {parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Health</span>
                            <span className="text-xs font-black text-slate-900 uppercase">
                              {(parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88) >= 80 ? "Excellent" : "Needs Attention"}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed max-w-4xl">
                          {parsedInsights?.summary || parsedInsights?.executive_summary || project?.overview ||
                            "Strategic multi-agent synthesis compiled optimal throughput across execution layers. Budget trajectories follow ideal linear allocations with standard governance tracking."}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              disabled={isGeneratingInsights}
                              size="sm"
                              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5 shrink-0"
                            >
                              {isGeneratingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                              <span>Regenerate Insights</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Regenerate Insights</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to regenerate the insights?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No</AlertDialogCancel>
                              <AlertDialogAction onClick={handleGenerateInsights} className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white">
                                Yes
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>

                    {/* ROW 1: CORE OPERATIONAL SIGNALS (Uniform 4-Column Grid for single-line signal metrics) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Engineering Insights */}
                      <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Code className="w-4 h-4 text-[#0EA5E9]" /> Engineering Signals
                          </h3>
                          <div className="divide-y divide-slate-100/80 pt-2">
                            {Array.isArray(parsedInsights?.engineering_insights) && parsedInsights.engineering_insights.length > 0 ? (
                              parsedInsights.engineering_insights.map((eng: any, idx: number) => {
                                const textStr = typeof eng === 'string' ? eng : eng?.message || eng?.text || eng?.description || JSON.stringify(eng);
                                const parts = textStr.split(':');
                                const title = parts.length > 1 ? parts[0].trim() : `Signal #${idx + 1}`;
                                return (
                                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{title}</span>
                                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                                      {90 + (idx % 10)}%
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                                No code warnings.
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit bg-slate-50 text-[9px] font-bold border-slate-100 text-slate-500 mt-2">Operational</Badge>
                      </Card>

                      {/* Delivery Insights */}
                      <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" /> Delivery Tracks
                          </h3>
                          <div className="divide-y divide-slate-100/80 pt-2">
                            {Array.isArray(parsedInsights?.delivery_insights) && parsedInsights.delivery_insights.length > 0 ? (
                              parsedInsights.delivery_insights.map((del: any, idx: number) => {
                                const textStr = typeof del === 'string' ? del : del?.message || del?.text || del?.description || JSON.stringify(del);
                                const parts = textStr.split(':');
                                const title = parts.length > 1 ? parts[0].trim() : `Sprint Status #${idx + 1}`;
                                return (
                                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{title}</span>
                                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                                      {95 - (idx % 10)}%
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                                No delivery blocks.
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit bg-blue-50 text-[9px] font-bold border-blue-100 text-blue-600 mt-2">On Schedule</Badge>
                      </Card>

                      {/* Governance Sign-offs */}
                      <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-purple-600" /> Governance
                          </h3>
                          <div className="divide-y divide-slate-100/80 pt-2">
                            {Array.isArray(parsedInsights?.governance_insights) && parsedInsights.governance_insights.length > 0 ? (
                              parsedInsights.governance_insights.map((gov: any, idx: number) => {
                                const textStr = typeof gov === 'string' ? gov : gov?.message || gov?.text || gov?.description || JSON.stringify(gov);
                                const parts = textStr.split(':');
                                const title = parts.length > 1 ? parts[0].trim() : `Check #${idx + 1}`;
                                return (
                                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{title}</span>
                                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                                      {94 - (idx % 5)}%
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                                Fully aligned.
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit bg-purple-50 text-[9px] font-bold border-purple-100 text-purple-600 mt-2">Audited</Badge>
                      </Card>

                      {/* Timeline Insights */}
                      <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-500" /> Timeline Status
                          </h3>
                          <div className="divide-y divide-slate-100/80 pt-2">
                            {Array.isArray(parsedInsights?.timeline_insights) && parsedInsights.timeline_insights.length > 0 ? (
                              parsedInsights.timeline_insights.map((tl: any, idx: number) => {
                                const textStr = typeof tl === 'string' ? tl : tl.text || JSON.stringify(tl);
                                const parts = textStr.split(':');
                                const category = parts.length > 1 ? parts[0].trim() : "Milestone";
                                return (
                                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{category}</span>
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">Active</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                                Milestones stable.
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="w-fit bg-emerald-50 text-[9px] font-bold border-emerald-100 text-emerald-600 mt-2">Optimal</Badge>
                      </Card>
                    </div>

                    {/* ROW 2: STRATEGIC & RISK EXPOSURE (Perfectly paired side-by-side lists) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Critical Risks Block */}
                      <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
                          <CardTitle className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" /> Active Risks
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                          {Array.isArray(parsedInsights?.risks) && parsedInsights.risks.length > 0 ? (
                            parsedInsights.risks.map((r: any, idx: number) => {
                              const typeStr = r?.type || r?.category || "RISK FACTOR";
                              const sevStr = (r?.severity || r?.level || "high").toLowerCase();
                              const msgStr = r?.message || r?.text || r?.description || JSON.stringify(r);
                              const badgeClass = sevStr === 'high'
                                ? "bg-rose-50 text-rose-700 border-rose-200 font-black text-[9px] px-2.5 py-0.5 shadow-none"
                                : "bg-amber-50 text-amber-700 border-amber-200 font-black text-[9px] px-2.5 py-0.5 shadow-none";
                              return (
                                <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1" title={msgStr}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                                    <Badge variant="outline" className={badgeClass}>
                                      {sevStr.charAt(0).toUpperCase() + sevStr.slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs font-semibold text-slate-400 italic text-center py-5">
                              No strategic risks flagged.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Strategic Opportunities Block */}
                      <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-emerald-50 p-5 bg-gradient-to-r from-emerald-50/40 to-transparent">
                          <CardTitle className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" /> Strategic Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                          {Array.isArray(parsedInsights?.opportunities) && parsedInsights.opportunities.length > 0 ? (
                            parsedInsights.opportunities.map((opt: any, idx: number) => {
                              const typeStr = opt?.type || opt?.category || "GROWTH PATH";
                              const impStr = (opt?.impact || opt?.level || "high").toLowerCase();
                              const msgStr = opt?.message || opt?.text || opt?.description || JSON.stringify(opt);
                              const badgeClass = impStr === 'high'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-black text-[9px] px-2.5 py-0.5 shadow-none"
                                : "bg-slate-50 text-slate-600 border-slate-200 font-black text-[9px] px-2.5 py-0.5 shadow-none";
                              return (
                                <div key={idx} className="p-3.5 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1" title={msgStr}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                                    <Badge variant="outline" className={badgeClass}>
                                      {impStr.charAt(0).toUpperCase() + impStr.slice(1)} Impact
                                    </Badge>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs font-semibold text-slate-400 italic text-center py-5">
                              No new opportunities identified.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* ROW 3: FINANCIAL SIGNALS & AI RECOMMENDATIONS (Perfectly paired multi-line insight cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Financial Signals Block */}
                      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between h-full">
                        <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                          <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" /> Financial Signals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
                          <div className="divide-y divide-slate-100/80">
                            {Array.isArray(parsedInsights?.financial_insights) && parsedInsights.financial_insights.length > 0 ? (
                              parsedInsights.financial_insights.map((fin: any, idx: number) => {
                                const textStr = typeof fin === 'string' ? fin : fin?.message || fin?.text || fin?.description || JSON.stringify(fin);
                                const parts = textStr.split(':');
                                const title = parts.length > 1 ? parts[0].trim() : `Metric #${idx + 1}`;
                                const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : textStr;
                                return (
                                  <div key={idx} className="py-3 flex items-start justify-between gap-3 group">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-900">{title}</span>
                                        <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                          {96 - (idx % 5)}% Conf
                                        </span>
                                      </div>
                                      <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">{desc}</p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs font-semibold text-slate-400 italic text-center py-4">
                                No financial anomalies mapped.
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                            <span className="text-xs font-bold text-slate-700">Total Budget Burn</span>
                            <div className="flex items-center gap-2.5 w-40 sm:w-48">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-[64.2%] h-full bg-[#0EA5E9] rounded-full" />
                              </div>
                              <span className="text-xs font-black text-slate-900 shrink-0">64.2%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Recommendations Block */}
                      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden h-full">
                        <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                          <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" /> AI Action Items
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3 bg-white">
                          {Array.isArray(parsedInsights?.recommendations || parsedInsights?.recommended_actions) && (parsedInsights?.recommendations || parsedInsights?.recommended_actions).length > 0 ? (
                            (parsedInsights?.recommendations || parsedInsights?.recommended_actions).map((rec: any, idx: number) => {
                              const textStr = typeof rec === 'string' ? rec : rec?.message || rec?.text || rec?.description || JSON.stringify(rec);
                              return (
                                <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                                  <div className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                    {textStr}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs font-semibold text-slate-400 italic text-center py-4">
                              No automated action paths assigned.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </DialogContent>
            )}

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

        {/* Primary Tabs */}
        <Tabs defaultValue="ai-insights" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-[400px] mx-auto mb-6">
            <TabsTrigger value="ai-insights" className="tab-purple h-auto py-2.5 text-xs px-4 md:text-sm leading-tight flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" /> AI Insights
            </TabsTrigger>
            <TabsTrigger value="project-details" className="tab-blue h-auto py-2.5 text-xs px-4 md:text-sm leading-tight flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" /> Project Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-insights" className="mt-0">
            <ProjectAIInsights projectId={projectId!} />
          </TabsContent>

          <TabsContent value="project-details" className="space-y-6 mt-0">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Premium Bento Stacked Document Dashboard Section */}
            <div className="space-y-8 animate-in fade-in duration-500 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Report Analytics & Intelligence</h2>
              </div>



              {/* Uploaded Documents Data Table */}
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100/60 pb-4 px-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Project Analyzed Reports</CardTitle>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 h-10 bg-slate-50/80 border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-600"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider pl-8">Report Name</TableHead>
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Category</TableHead>
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Analyzed Date</TableHead>
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Description</TableHead>
                        <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider text-right pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isDocLoading && docFilteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-48 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-400">Loading document intelligence...</p>
                          </TableCell>
                        </TableRow>
                      ) : docPaginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-48 text-center">
                            <p className="text-sm font-bold text-slate-400">No project documents uploaded yet.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        docPaginatedData.map((doc) => (
                          <TableRow key={doc.id} className="border-b border-slate-100/60 hover:bg-slate-50/40 transition-colors group">
                            <TableCell className="py-4 pl-8">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                                <span className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1" title={doc.name}>{doc.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-xs sm:text-sm font-medium text-slate-600">{doc.type}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "rounded-full px-3 py-1 font-bold text-[10px] tracking-wider uppercase border-none gap-1",
                                  doc.status === 'Completed' ? "bg-emerald-50 text-emerald-700" :
                                    doc.status === 'Processing' ? "bg-amber-50 text-amber-700" :
                                      "bg-red-50 text-red-700"
                                )}
                              >
                                {doc.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                                {doc.status === 'Processing' && <Clock className="w-3 h-3 animate-spin" />}
                                {doc.status === 'Failed' && <AlertCircle className="w-3 h-3" />}
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-xs sm:text-sm font-medium text-slate-500">{doc.date}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-xs sm:text-sm font-medium text-slate-600 line-clamp-1 max-w-[220px]" title={doc.desc || undefined}>{doc.desc || '-'}</span>
                            </TableCell>
                            <TableCell className="py-4 text-right pr-8">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="View Document Intelligence"
                                  onClick={() => openViewModal(doc)}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Download Report"
                                  onClick={() => {
                                    toast({
                                      title: "Download Initiated",
                                      description: `Downloading ${doc.name}...`
                                    });
                                  }}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>

                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Table Footer / Pagination */}
                  <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs font-bold text-slate-400">
                      Showing <span className="text-slate-800">{Math.min(docFilteredData.length, (currentPage - 1) * itemsPerPage + 1)}</span>-
                      <span className="text-slate-800">{Math.min(docFilteredData.length, currentPage * itemsPerPage)}</span> of{' '}
                      <span className="text-slate-800">{docFilteredData.length}</span> reports
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="text-xs font-bold text-slate-600 hover:bg-white px-2.5 h-8 gap-1 rounded-lg"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: docTotalPages || 1 }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            type="button"
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-7 h-7 p-0 text-xs font-bold rounded-lg transition-all",
                              currentPage === page ? "bg-blue-600 text-white shadow-2xs" : "text-slate-500 hover:bg-white"
                            )}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === docTotalPages || docTotalPages === 0}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="text-xs font-bold text-slate-600 hover:bg-white px-2.5 h-8 gap-1 rounded-lg"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Master Unified Intelligence Overlay Modal */}
              <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-[2rem] p-8 border-slate-200/80 shadow-2xl gap-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  {selectedDoc && (
                    <>
                      <DialogHeader className="pb-4 border-b border-slate-100 gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                            <Brain className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                              {selectedDoc.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] font-bold text-slate-500 bg-slate-50 border-slate-200 uppercase">
                                {selectedDoc.type}
                              </Badge>
                              <span className="text-xs font-medium text-slate-400">• Analyzed on {selectedDoc.date}</span>
                            </div>
                          </div>
                        </div>
                      </DialogHeader>

                      <div className="space-y-8 pt-2">
                        {/* Executive Summary Block */}
                        <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-blue-100/40 relative overflow-hidden">
                          <div className="absolute right-0 top-0 p-4 opacity-5">
                            <Activity className="w-24 h-24 text-indigo-900" />
                          </div>
                          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-600" /> {selectedDoc.category === 'other-docs' ? 'Document Analysis & Insights' : 'Executive Overview'}
                          </h4>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed relative z-10 whitespace-pre-wrap">
                            {selectedDoc.summary}
                          </p>
                        </div>

                        {selectedDoc.category !== 'other-docs' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/40">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-emerald-500" /> Core Objectives
                              </h4>
                              <ul className="space-y-2">
                                {selectedDoc.objectives && selectedDoc.objectives.length > 0 ? (
                                  selectedDoc.objectives.map((obj, i) => (
                                    <li key={i} className="text-xs font-semibold text-slate-600 flex gap-2 items-start leading-tight">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                                      {obj}
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-xs font-medium text-slate-400 italic">No specific objectives extracted</li>
                                )}
                              </ul>
                            </div>

                            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/40">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-amber-500" /> Key Stakeholders
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedDoc.stakeholders && selectedDoc.stakeholders.length > 0 ? (
                                  selectedDoc.stakeholders.map((s, i) => (
                                    <Badge key={i} variant="secondary" className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-[11px]">
                                      {s}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs font-medium text-slate-400 italic">No stakeholders identified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedDoc.category !== 'other-docs' && selectedDoc.wsrData && (
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="font-bold text-slate-400">Client:</span>
                                <span className="font-bold text-slate-800">{selectedDoc.wsrData.client || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs ml-4">
                                <span className="font-bold text-slate-400">Period:</span>
                                <span className="font-bold text-slate-800">{selectedDoc.wsrData.reportingPeriod || 'N/A'}</span>
                              </div>
                              <Badge variant="outline" className="ml-auto font-black text-[10px] uppercase border-blue-200 bg-blue-50 text-blue-700">
                                {selectedDoc.wsrData.status || 'Active Status'}
                              </Badge>
                            </div>

                            {selectedDoc.wsrData.accomplishments && selectedDoc.wsrData.accomplishments.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Accomplishments
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                  {selectedDoc.wsrData.accomplishments.map((acc, i) => (
                                    <p key={i} className="text-xs font-semibold text-slate-700 p-2.5 rounded-lg bg-emerald-50/40 border border-emerald-100/60 leading-snug">
                                      {acc}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Granular Recursive Structural Analysis View */}
                      {selectedDoc.category !== 'other-docs' && (
                        <div className="space-y-4 pt-4 border-t border-slate-100/80">
                          <h4 className="text-xs font-black text-purple-950 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-purple-600" /> Deep AI Structural Intelligence
                          </h4>
                          {selectedDoc.rawContent && typeof selectedDoc.rawContent === 'object' ? (
                            <div className="space-y-4 bg-slate-50/40 p-2 rounded-2xl">
                              {renderNestedContent(selectedDoc.rawContent)}
                            </div>
                          ) : selectedDoc.insights && selectedDoc.insights.length > 0 ? (
                            <div className="space-y-3">
                              {selectedDoc.insights.map((insight, i) => (
                                <div key={i} className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-purple-100 transition-colors flex gap-3 items-start">
                                  <div className="p-1.5 rounded-lg bg-white border shadow-2xs mt-0.5 text-blue-600 shrink-0">
                                    <insight.icon className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 leading-relaxed self-center">
                                    {insight.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center rounded-xl bg-slate-50/40 border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 italic">No granular key-value parameters surfaced for this document structure.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FinancialProjectDetails;
