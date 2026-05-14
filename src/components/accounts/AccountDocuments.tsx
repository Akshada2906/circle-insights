import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import {
  Upload,
  FileText,
  Search,
  Eye,
  Brain,
  Download,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
  Target,
  Users,
  Zap,
  Info
} from 'lucide-react';

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
    client?: string;
    reportingPeriod?: string;
    status?: string;
    accomplishments?: string[];
  };
}

interface PendingFile {
  id: string;
  file: File;
  sizeStr: string;
  isOverLimit: boolean;
}

interface AccountDocumentsProps {
  accountId?: string;
  readOnly?: boolean;
}

const CATEGORIES = [
  { id: 'wsr-reports', label: 'WSR Reports', typeName: 'Weekly Status Report' },
  { id: 'financial-statement', label: 'Financial Statement', typeName: 'Financial Statement' },
  { id: 'legal-contract', label: 'Legal Contract', typeName: 'Legal Contract' },
  { id: 'marketing', label: 'Marketing', typeName: 'Marketing' },
  { id: 'invoice', label: 'Invoice', typeName: 'Invoice' },
  { id: 'research', label: 'Research', typeName: 'Research' },
  { id: 'code-quality', label: 'Code Quality', typeName: 'Code Quality Document' },
  { id: 'tech-reviews', label: 'Tech Reviews', typeName: 'Technical Review' },
  { id: 'best-practices', label: 'Best Practices', typeName: 'Best Practices' },
  { id: 'sow-documents', label: 'SOW Documents', typeName: 'Statement of Work' }
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function AccountDocuments({ accountId, readOnly = false }: AccountDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Upload Form States
  const [selectedType, setSelectedType] = useState('financial-statement');
  const [shortDescription, setShortDescription] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Unified Modal State
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const { toast } = useToast();

  const fetchAllDocuments = async () => {
    if (!accountId) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    try {
      const allDocs: Document[] = [];
      const apiCategories = ['wsr-reports', 'code-quality', 'tech-reviews', 'best-practices', 'sow-documents'];
      
      for (const catId of apiCategories) {
        try {
          const data = await api.getDocument(accountId, catId);
          if (data) {
            allDocs.push(mapBackendToFrontend(data, catId));
          }
        } catch (e) {
          // Continue mapping smoothly
        }
      }

      setDocuments(allDocs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, [accountId]);

  const mapBackendToFrontend = (data: any, category: string): Document => {
    try {
      let content = data.content;

      if (typeof content === 'string') {
        const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
        try {
          content = JSON.parse(cleaned);
        } catch (e) {
          content = { summary: content };
        }
      }

      const findContent = (keywords: string[]) => {
        if (!content || typeof content !== 'object') return null;
        const key = Object.keys(content).find(k =>
          keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))
        );
        return key ? content[key] : null;
      };

      const summary = findContent(['summary', 'overview', 'description', 'project_overview']) || 'AI generated analysis summary.';
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

      const formattedSummary = formatValue(summary);
      const isError = formattedSummary.toLowerCase().includes('error:');

      const filteredInsights = Object.entries(content || {})
        .filter(([key]) => {
          const lKey = key.toLowerCase();
          return !['summary', 'overview', 'description', 'objective', 'scope', 'goal', 'stakeholder', 'team', 'resource'].some(kw => lKey.includes(kw));
        })
        .map(([key, value]) => ({
          icon: Info,
          text: `${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}: ${formatValue(value)}`,
          color: 'text-blue-600 bg-blue-50/50'
        }))
        .filter(insight => insight.text.length > insight.text.split(':')[0].length + 5);

      const catObj = CATEGORIES.find(c => c.id === category);
      const docName = data.document_name || `${catObj?.label || 'Document'}_Report_${new Date(data.created_at || Date.now()).getFullYear()}.pdf`;

      const doc: Document = {
        id: data.document_id || String(Date.now()),
        category: category,
        name: docName,
        type: catObj?.label || 'Analyzed Report',
        date: new Date(data.created_at || Date.now()).toISOString().split('T')[0],
        desc: data.description || '-',
        status: isError ? 'Failed' : (data.status || 'Completed'),
        summary: formattedSummary,
        objectives: (Array.isArray(objectives) ? objectives.map(o => formatValue(o)) : [formatValue(objectives)]).filter(o => o.length > 3),
        stakeholders: (Array.isArray(stakeholders) ? stakeholders.map(s => formatValue(s)) : [formatValue(stakeholders)]).filter(s => s.length > 2),
        insights: filteredInsights.slice(0, 6),
        rawContent: content
      };

      if (category === 'wsr-reports' || data.document_type === 'WSR') {
        doc.wsrData = {
          client: formatValue(content?.project_overview_and_reporting_period?.client),
          reportingPeriod: formatValue(content?.project_overview_and_reporting_period?.reporting_period),
          status: formatValue(content?.overall_project_status),
          accomplishments: Array.isArray(content?.key_accomplishments_and_milestones_achieved_this_week)
            ? content.key_accomplishments_and_milestones_achieved_this_week.map((v: any) => formatValue(v))
            : [formatValue(content?.key_accomplishments_and_milestones_achieved_this_week)]
        };
      }

      return doc;
    } catch (e) {
      return {
        id: data?.document_id || String(Date.now()),
        category: category,
        name: 'Parsing Error.pdf',
        type: 'Error',
        date: new Date().toISOString().split('T')[0],
        status: 'Failed',
        summary: 'Error parsing document content structure.',
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
    if (!accountId) {
      toast({
        title: "Account Required",
        description: "Please save or select an account before uploading documents.",
        variant: "destructive"
      });
      return;
    }

    const validFiles = pendingFiles.filter((f) => !f.isOverLimit);
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    const mappedApiCategory = ['wsr-reports', 'code-quality', 'tech-reviews', 'best-practices', 'sow-documents'].includes(selectedType) 
      ? selectedType 
      : 'wsr-reports';

    for (const item of validFiles) {
      try {
        await api.importDocument(accountId, mappedApiCategory, item.file);
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
    if (!accountId) return;
    try {
      await api.deleteDocument(accountId, doc.category);
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

  const filteredData = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.type.toLowerCase().includes(q) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      doc.status.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!readOnly && (
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100/60 pb-4 px-8 pt-6">
            <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Controls */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Document Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200/80 h-11 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600">
                      <SelectValue placeholder="Select Document Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="font-semibold text-slate-700 rounded-lg py-2.5">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Short Description</label>
                  <Input
                    type="text"
                    placeholder="Enter a brief description..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="bg-slate-50 border-slate-200/80 h-11 rounded-xl text-slate-800 font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={pendingFiles.length === 0 && !shortDescription}
                    className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUploadAndProcess}
                    disabled={pendingFiles.length === 0 || isProcessing}
                    className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-100 gap-2 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upload & Process'
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Column: Drag & Drop & Pending List */}
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => document.getElementById('document-drop-input')?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-slate-50/40 group",
                    isDragging ? "border-blue-600 bg-blue-50/40 scale-[0.99]" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/80"
                  )}
                >
                  <input
                    type="file"
                    id="document-drop-input"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-1">
                    Drag & Drop files here or <span className="text-blue-600 underline">Browse File</span>
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Any file type • Multiple files allowed • Max 50 MB per file
                  </p>
                </div>

                {/* Queue Display */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {pendingFiles.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          item.isOverLimit 
                            ? "bg-red-50/50 border-red-200" 
                            : "bg-white border-slate-200/80 shadow-2xs"
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            item.isOverLimit ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
                          )}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400">{item.sizeStr}</span>
                              {item.isOverLimit && (
                                <span className="text-[10px] font-bold text-red-500">File exceeds 50 MB limit</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removePendingFile(item.id); }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents Table Card */}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100/60 pb-4 px-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Uploaded Documents</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search documents..."
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
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider pl-8">Document Name</TableHead>
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Document Type</TableHead>
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Uploaded Date</TableHead>
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider">Short Description</TableHead>
                <TableHead className="h-11 font-bold text-xs text-slate-500 uppercase tracking-wider text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Loading records...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <p className="text-sm font-bold text-slate-400">No documents found matching your search.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((doc) => (
                  <TableRow key={doc.id} className="border-b border-slate-100/60 hover:bg-slate-50/40 transition-colors group">
                    <TableCell className="py-4 pl-8">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                        <span className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">{doc.name}</span>
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
                      <span className="text-xs sm:text-sm font-medium text-slate-600 line-clamp-1 max-w-[220px]">{doc.desc || '-'}</span>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="View Document Insights"
                          onClick={() => openViewModal(doc)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Download Document"
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
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Delete Document"
                            onClick={() => handleDeleteDoc(doc)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-400">
              Showing <span className="text-slate-800">{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</span>-
              <span className="text-slate-800">{Math.min(filteredData.length, currentPage * itemsPerPage)}</span> of{' '}
              <span className="text-slate-800">{filteredData.length}</span> documents
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
                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
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
                disabled={currentPage === totalPages || totalPages === 0}
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

      {/* Deep Intelligence & Summary Unified Dialog */}
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
                {/* Executive Overview Block */}
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl border border-blue-100/40 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5">
                      <Activity className="w-24 h-24 text-indigo-900" />
                    </div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" /> Executive Intelligence Summary
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed relative z-10">
                      {selectedDoc.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/40">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-emerald-500" /> Key Objectives
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
                        <Users className="w-3.5 h-3.5 text-amber-500" /> Stakeholders
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.stakeholders && selectedDoc.stakeholders.length > 0 ? (
                          selectedDoc.stakeholders.map((s, i) => (
                            <Badge key={i} variant="secondary" className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-[11px]">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">No stakeholders mapped</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedDoc.wsrData && (
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
                            <Zap className="w-3 h-3" /> Key Accomplishments
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

                {/* Granular AI Analysis Block */}
                <div className="space-y-4 pt-4 border-t border-slate-100/80">
                  <h4 className="text-xs font-black text-purple-950 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-600" /> Granular AI Structural Analysis
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
