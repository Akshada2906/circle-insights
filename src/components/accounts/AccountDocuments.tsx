import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileSearch,
  Upload,
  Activity,
  Target,
  Users,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  ClipboardCheck,
  FileCheck,
  LayoutGrid,
  FileText,
  AlertCircle,
  Flag,
  Calendar,
  Briefcase,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import {
  Loader2,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';

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

interface AccountDocumentsProps {
  accountId?: string;
  readOnly?: boolean;
}

const CATEGORIES = [
  { id: 'wsr-reports', label: 'WSR Reports', icon: LayoutGrid, title: 'Weekly Status Reports' },
  { id: 'code-quality', label: 'Code Quality', icon: ShieldCheck, title: 'Code Quality Documents' },
  { id: 'tech-reviews', label: 'Tech Reviews', icon: ClipboardCheck, title: 'Technical Review Reports' },
  { id: 'best-practices', label: 'Best Practices', icon: BookOpen, title: 'Engineering Best Practices' },
  { id: 'sow-documents', label: 'SOW Documents', icon: FileCheck, title: 'Statement of Work Documents' }
];

export function AccountDocuments({ accountId, readOnly = false }: AccountDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('wsr-reports');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategorySidebarCollapsed, setIsCategorySidebarCollapsed] = useState(false);
  const [isFileSidebarCollapsed, setIsFileSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const filteredDocs = documents.filter(d => d.category === activeTab);
  const activeDoc = filteredDocs.find(d => d.id === activeDocId) || (filteredDocs.length > 0 ? filteredDocs[0] : null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!accountId) {
        setDocuments([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.getDocument(accountId, activeTab);
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
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [accountId, activeTab]);

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

      // Helper to find content by partial key match
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
        .filter(insight => insight.text.length > insight.text.split(':')[0].length + 5); // Filter out insights with virtually no content

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
        insights: filteredInsights.slice(0, 6)
      };

      // Special handling for WSR-reports
      if (category === 'wsr-reports' || data.document_type === 'WSR') {
        doc.wsrData = {
          projectName: formatValue(content.project_overview_and_reporting_period?.project_name),
          client: formatValue(content.project_overview_and_reporting_period?.client),
          reportingPeriod: formatValue(content.project_overview_and_reporting_period?.reporting_period),
          status: formatValue(content.overall_project_status),
          accomplishments: Array.isArray(content.key_accomplishments_and_milestones_achieved_this_week)
            ? content.key_accomplishments_and_milestones_achieved_this_week.map((v: any) => formatValue(v))
            : [formatValue(content.key_accomplishments_and_milestones_achieved_this_week)],
          upcomingTasks: Array.isArray(content.upcoming_tasks_and_planned_activities_for_next_week)
            ? content.upcoming_tasks_and_planned_activities_for_next_week.map((v: any) => formatValue(v))
            : [formatValue(content.upcoming_tasks_and_planned_activities_for_next_week)],
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
    if (!accountId) {
      toast({
        title: "Error",
        description: "No account selected. Please select or create an account first.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Upload Started",
      description: `Uploading ${file.name} to ${CATEGORIES.find(c => c.id === activeTab)?.label}...`,
    });

    setIsLoading(true);
    try {
      const response = await api.importDocument(accountId, activeTab, file);

      toast({
        title: "Upload Successful",
        description: `${file.name} has been processed and analyzed.`,
      });

      // Fetch the updated document
      const data = await api.getDocument(accountId, activeTab);
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
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!accountId || !activeDocId) return;

    setIsLoading(true);
    try {
      await api.deleteDocument(accountId, activeTab);
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
      setIsLoading(false);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[800px] animate-in fade-in duration-500 relative">
      {/* Left Sidebar: Vertical Category Tabs */}
      <div className={cn(
        "flex flex-col gap-6 transition-all duration-300",
        isCategorySidebarCollapsed ? "w-16" : "w-full lg:w-60"
      )}>
        <div className={cn(
          "bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-slate-200/60 shadow-sm transition-all h-full",
          isCategorySidebarCollapsed && "items-center overflow-hidden"
        )}>
          <div className="flex items-center justify-between mb-4">
            {!isCategorySidebarCollapsed && (
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Categories</h3>
            )}
            <button
              type="button"
              onClick={() => setIsCategorySidebarCollapsed(!isCategorySidebarCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              {isCategorySidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                title={cat.label}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold group relative",
                  activeTab === cat.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-1 ring-blue-500"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm",
                  isCategorySidebarCollapsed && "justify-center px-0"
                )}
              >
                <cat.icon className={cn("w-4.5 h-4.5 transition-colors shrink-0", activeTab === cat.id ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                {!isCategorySidebarCollapsed && cat.label}
                {activeTab === cat.id && !isCategorySidebarCollapsed && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        {!isCategorySidebarCollapsed && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileSearch className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold text-sm">AI Processing</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All uploaded documents are instantly analyzed to extract key insights, objectives, and stakeholders.
            </p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {!readOnly && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-upload-input')?.click()}
            className={cn(
              "relative group overflow-hidden rounded-[2.5rem] border-2 border-dashed transition-all duration-300 cursor-pointer",
              isDragging
                ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/30"
            )}
          >
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="p-12 flex flex-col items-center text-center gap-4">
              <div className={cn(
                "p-6 rounded-[2rem] transition-all duration-500",
                isDragging ? "bg-blue-600 text-white rotate-12 scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-110"
              )}>
                <Upload className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">
                  Upload {CATEGORIES.find(c => c.id === activeTab)?.label}
                </h3>
                <p className="text-slate-500 font-medium">
                  Drag and drop your file here, or <span className="text-blue-600 font-bold underline decoration-2 underline-offset-4">browse files</span>
                </p>
              </div>
              <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                <span className="bg-slate-100 px-3 py-1 rounded-full">PDF</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full">DOCX</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full">TXT</span>
              </div>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Bottom: Files & Analysis Details */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          {filteredDocs.length > 0 ? (
            <div className="flex flex-col md:flex-row h-full">
              {/* Internal File Sidebar */}
              <div className={cn(
                "border-r border-slate-100 bg-slate-50/30 flex flex-col transition-all duration-300 relative",
                isFileSidebarCollapsed ? "w-12" : "w-full md:w-64"
              )}>
                <button
                  type="button"
                  onClick={() => setIsFileSidebarCollapsed(!isFileSidebarCollapsed)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-20 hover:text-blue-600 transition-all"
                >
                  {isFileSidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
                
                <div className={cn(
                  "flex-1 overflow-hidden transition-all h-full",
                  isFileSidebarCollapsed && "opacity-0 invisible w-0"
                )}>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                      {CATEGORIES.find(c => c.id === activeTab)?.label}
                      <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500">
                        {filteredDocs.length}
                      </Badge>
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredDocs.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setActiveDocId(doc.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                          activeDocId === doc.id
                            ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50"
                            : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className={cn("w-4 h-4", activeDocId === doc.id ? "text-blue-600" : "text-slate-400")} />
                            <span className={cn(
                              "text-sm font-bold truncate",
                              activeDocId === doc.id ? "text-blue-700" : "text-slate-700"
                            )}>
                              {doc.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-6">{doc.date}</p>
                        </div>
                        {activeDocId === doc.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Content View */}
              <div className="flex-1 p-10 overflow-y-auto max-h-[850px] scrollbar-thin scrollbar-thumb-slate-200 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 animate-pulse">Analyzing Document...</p>
                    </div>
                  </div>
                )}
                {activeDoc && (
                  <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-100">
                          <FileSearch className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeDoc.name}</h2>
                            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-slate-50 text-slate-400 border-slate-200 uppercase font-black tracking-tighter">
                              {activeDoc.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 font-medium">AI Intelligence Analysis • {activeDoc.date}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleDelete}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-[2rem] border border-blue-100/50 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Activity className="w-20 h-20 text-indigo-900" />
                        </div>
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Executive Intelligence Summary
                        </h4>
                        <p className="text-slate-700 leading-relaxed font-bold text-lg relative z-10">{activeDoc.summary}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-[2rem] border-slate-100 shadow-none hover:shadow-md hover:border-blue-100 transition-all duration-300">
                          <CardHeader className="pb-3 px-6 pt-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
                              <Target className="w-4 h-4 text-emerald-500" />
                              Key Objectives
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-6 pb-6">
                            <ul className="space-y-3">
                              {activeDoc.objectives.map((obj, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-tight">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-100 shadow-none hover:shadow-md hover:border-blue-100 transition-all duration-300">
                          <CardHeader className="pb-3 px-6 pt-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
                              <Users className="w-4 h-4 text-amber-500" />
                              Identified Stakeholders
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-6 pb-6">
                            <div className="flex flex-wrap gap-2">
                              {activeDoc.stakeholders.map((s, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border-none font-bold text-xs hover:bg-amber-50 hover:text-amber-700 transition-colors">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-4 pt-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Deep AI Insights & Gaps</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {activeDoc.insights.map((insight, i) => (
                            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all group">
                              <div className={cn("p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition-transform group-hover:scale-110", insight.color)}>
                                <insight.icon className="w-5 h-5 shrink-0" />
                              </div>
                              <p className="text-sm text-slate-600 font-bold self-center leading-relaxed">{insight.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Specialized WSR View Extension */}
                      {activeDoc.wsrData && (
                        <div className="space-y-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
                          <div className="flex flex-wrap items-center gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                              <Briefcase className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-black text-slate-400 uppercase tracking-tight">Client:</span>
                              <span className="text-xs font-bold text-slate-900">{activeDoc.wsrData.client || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              <span className="text-xs font-black text-slate-400 uppercase tracking-tight">Period:</span>
                              <span className="text-xs font-bold text-slate-900">{activeDoc.wsrData.reportingPeriod || 'N/A'}</span>
                            </div>
                            <div className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm ml-auto",
                              activeDoc.wsrData.status?.toLowerCase().includes('risk')
                                ? "bg-red-50 border-red-100 text-red-700"
                                : activeDoc.wsrData.status?.toLowerCase().includes('on track')
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                  : "bg-amber-50 border-amber-100 text-amber-700"
                            )}>
                              {activeDoc.wsrData.status?.toLowerCase().includes('risk') ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                              <span className="text-xs font-black uppercase tracking-widest">{activeDoc.wsrData.status || 'Status Unknown'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            {activeDoc.wsrData.accomplishments && activeDoc.wsrData.accomplishments.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Zap className="w-4 h-4" /> Major Accomplishments
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {activeDoc.wsrData.accomplishments.map((item, i) => (
                                    <div key={i} className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex gap-3 items-start">
                                      <div className="p-1 bg-emerald-500 rounded-full mt-1">
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                      </div>
                                      <p className="text-sm font-semibold text-emerald-900/80 leading-snug">{item}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {activeDoc.wsrData.risks && activeDoc.wsrData.risks.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> Identified Risks & Issues
                                  </h4>
                                  <div className="space-y-3">
                                    {activeDoc.wsrData.risks.map((risk, i) => (
                                      <div key={i} className="p-4 bg-red-50/30 border border-red-100/50 rounded-2xl flex gap-3 items-start">
                                        <div className="p-1 bg-red-500 rounded-lg mt-0.5">
                                          <TrendingDown className="w-3 h-3 text-white" />
                                        </div>
                                        <p className="text-sm font-semibold text-red-900/80 leading-snug">{risk}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {activeDoc.wsrData.upcomingTasks && activeDoc.wsrData.upcomingTasks.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Planned for Next Week
                                  </h4>
                                  <div className="space-y-3">
                                    {activeDoc.wsrData.upcomingTasks.map((task, i) => (
                                      <div key={i} className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl flex gap-3 items-start">
                                        <div className="p-1 bg-blue-500 rounded-lg mt-0.5">
                                          <ChevronRight className="w-3 h-3 text-white" />
                                        </div>
                                        <p className="text-sm font-semibold text-blue-900/80 leading-snug">{task}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {activeDoc.wsrData.budgetStatus && !activeDoc.wsrData.budgetStatus.includes('Not explicitly') && (
                              <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-indigo-500" /> Project Health & Timeline
                                </h4>
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                                  "{activeDoc.wsrData.budgetStatus}"
                                </p>
                              </div>
                            )}

                            {activeDoc.wsrData.blockers && activeDoc.wsrData.blockers.length > 0 && (
                              <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                  <Flag className="w-4 h-4 text-red-500" /> Critical Blockers & Dependencies
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {activeDoc.wsrData.blockers.map((blocker, i) => (
                                    <div key={i} className="px-5 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-2xl border border-white/10 flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                      <span className="text-sm font-bold text-slate-100">{blocker}</span>
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
                )}
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 flex items-center justify-center mb-8 animate-bounce duration-1000">
                {(() => {
                  const CatIcon = CATEGORIES.find(c => c.id === activeTab)?.icon || LayoutGrid;
                  return <CatIcon className="w-16 h-16 text-slate-200" />;
                })()}
              </div>
              <h4 className="text-2xl font-black text-slate-800 mb-3">No {CATEGORIES.find(c => c.id === activeTab)?.label} Found</h4>
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                {readOnly
                  ? `No documents have been uploaded for this category yet. Click 'Edit Account' to upload and analyze documents.`
                  : "Start by uploading a document above to see the AI-powered analysis and deep insights."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
