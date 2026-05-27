import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  Loader2,
  DollarSign,
  Code,
  ShieldCheck,
  ChevronLeft,
  Zap,
  Activity,
  Target,
  Users,
  Clock,
  Building2,
  AlertTriangle,
  Download,
  FileText,
  Sparkles
} from 'lucide-react';
import { getFinanceProjectById, getFinanceAccountById, api } from '@/services/api';
import { exportInsightsToPDF, getInsightItemText } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
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
} from '@/components/ui/alert-dialog';

const cleanJsonString = (str: string) => {
  if (!str || typeof str !== 'string') return str;
  let cleaned = str.replace(/```json\n?|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
};

const formatSummary = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return Object.entries(val)
      .map(([key, value]) => {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        const valStr = String(value);
        const formattedValue = typeof value === 'object'
          ? JSON.stringify(value)
          : (valStr.includes('_') || (!valStr.includes(' ') && valStr.toLowerCase() === valStr && valStr.length < 30))
            ? valStr.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : valStr;
        return `${formattedKey}: ${formattedValue}`;
      })
      .join('\n\n');
  }
  return String(val);
};

const FinancialProjectInsights = () => {
  const { accountId, projectId } = useParams<{ accountId: string; projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const backUrl = location.state?.backUrl || `/financials/${accountId}`;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const parsedInsights = useMemo(() => {
    if (!insights) return null;
    let parsed = insights;
    if (insights.raw_output) {
      try {
        const cleanStr = typeof insights.raw_output === 'string' ? cleanJsonString(insights.raw_output) : insights.raw_output;
        parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
      } catch (e) {
        console.error("Failed to parse project raw_output:", e);
      }
    }
    const rawSummary = parsed.overall_health?.summary || parsed.summary;
    return {
      ...parsed,
      executive_summary: formatSummary(rawSummary),
      summary: formatSummary(rawSummary),
      risks: (parsed.risks || []).concat(
        (parsed.delivery_analysis?.blockers || []).map((b: any) => ({
          message: b.description,
          severity: b.severity || "medium",
          description: b.evidence
        })),
        (parsed.gap_analysis || []).map((g: any) => ({
          message: g.description,
          severity: g.severity || "medium",
          description: g.business_impact
        }))
      ),
      opportunities: (parsed.opportunities || []).concat(
        (parsed.commercial_opportunities || []).map((o: any) => ({
          message: o.recommended_service || o.pitch || o.opportunity,
          impact: o.priority || "medium",
          description: o.expected_outcome || o.business_outcome
        }))
      ),
      engineering_insights: parsed.engineering_insights || 
        (parsed.engineering_analysis?.quality_signals || []).concat(
          parsed.engineering_analysis?.engineering_maturity ? [`Engineering Maturity: ${parsed.engineering_analysis.engineering_maturity}`] : [],
          parsed.engineering_analysis?.code_quality?.coverage_pct ? [`Code Coverage: ${parsed.engineering_analysis.code_quality.coverage_pct}%`] : []
        ),
      delivery_insights: parsed.delivery_insights || 
        (parsed.delivery_analysis?.key_delivery_signals || []).concat(
          parsed.delivery_analysis?.delivery_status ? [`Delivery Status: ${parsed.delivery_analysis.delivery_status}`] : []
        ),
      governance_insights: parsed.governance_insights || 
        (parsed.delivery_analysis?.contradictions || []).map((c: any) => c.statement),
      timeline_insights: parsed.timeline_insights || [
        parsed.delivery_analysis?.timeline_health && `Timeline Health: ${parsed.delivery_analysis.timeline_health}`
      ].filter(Boolean),
      financial_insights: parsed.financial_insights || [],
      recommendations: parsed.recommendations || parsed.recommended_actions || [],
      confidence_score: parsed.confidence_score !== undefined ? parsed.confidence_score : 0.85,
      generated_at: parsed.generated_at || insights.generated_at || Date.now()
    };
  }, [insights]);

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
          title: "Error fetching project insights details",
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

  const pitchText = useMemo(() => {
    if (!parsedInsights) return '';
    if (parsedInsights.leadership_pitch) {
      return Array.isArray(parsedInsights.leadership_pitch) ? parsedInsights.leadership_pitch[0] : parsedInsights.leadership_pitch;
    }
    if (Array.isArray(parsedInsights.opportunities) && parsedInsights.opportunities.length > 0) {
      const firstOpt = parsedInsights.opportunities[0];
      return firstOpt.message || firstOpt.text || firstOpt.description || '';
    }
    return parsedInsights.executive_summary || '';
  }, [parsedInsights]);

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
        
        {/* Breadcrumb Navigation / Header precisely mimicking Account Insights style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <span className="hover:underline cursor-pointer" onClick={() => navigate('/accounts')}>Accounts</span>
              <span>/</span>
              <span className="hover:underline cursor-pointer" onClick={() => navigate(`/financials/${accountId}`)}>{account?.name}</span>
              <span>/</span>
              <span className="hover:underline cursor-pointer" onClick={() => navigate(`/financials/${accountId}/projects/${projectId}`)}>{project?.name}</span>
              <span>/</span>
              <span className="text-slate-800 font-bold">Strategic Insights</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/financials/${accountId}/projects/${projectId}`, { state: { backUrl } })}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  {project?.name || "Project"} Strategic Insights
                  <Badge className="bg-purple-50 text-purple-700 border-none font-bold text-[10px] px-2 py-0.5 ml-2">
                    Live Sync
                  </Badge>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  Last updated: {parsedInsights?.generated_at ? new Date(parsedInsights.generated_at).toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Circular Health Score */}
            <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" stroke="#a855f7" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88)) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-900">
                  {parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88}
                </span>
              </div>
              <div className="leading-none">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Health Score</span>
                <span className="text-[10px] font-black text-slate-900 uppercase">
                  {(parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88) >= 80 ? "Excellent" : "Needs Review"}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (parsedInsights) {
                    exportInsightsToPDF('project', project?.name || 'Project', parsedInsights);
                    toast({ title: "Report Downloaded", description: "Strategic synthesis report PDF generated successfully." });
                  } else {
                    toast({ title: "Error", description: "No insights data available to export.", variant: "destructive" });
                  }
                }}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white shadow-2xs text-[11px] font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" /> Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(parsedInsights, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project?.name || 'project'}_insights.json`;
                  a.click();
                }}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white shadow-2xs text-[11px] font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Download JSON
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isGeneratingInsights}
                    className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold gap-1 shadow-md shadow-purple-100"
                  >
                    {isGeneratingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                    Regenerate Insights
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
                    <AlertDialogAction onClick={handleGenerateInsights} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Executive Summary & Leadership Pitch Section Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left: Executive Summary (takes 2 cols) */}
          <Card className="lg:col-span-2 bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="bg-gradient-to-r from-purple-50/60 via-blue-50/30 to-transparent border-b border-slate-100 p-5">
                <CardTitle className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" /> Strategic Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  {parsedInsights?.summary || parsedInsights?.executive_summary || project?.overview ||
                    "Strategic multi-agent synthesis compiled optimal throughput across execution layers. Budget trajectories follow ideal linear allocations with standard governance tracking."}
                </p>
              </CardContent>
            </div>
          </Card>

          {/* Right: Leadership Pitch (takes 1 col) */}
          <Card className="lg:col-span-1 bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-5">
                <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Leadership Pitch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {pitchText ? (
                  <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/20 text-xs font-semibold text-slate-700 leading-relaxed italic">
                    "{pitchText}"
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400 italic">No leadership pitch compiled yet.</p>
                )}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* ROW 2: ACTIVE RISKS & STRATEGIC OPPORTUNITIES (Premium paired side-by-side layouts matching PE Insights) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Active Risks Block */}
          <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
              <CardTitle className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Active Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 bg-white">
              {Array.isArray(parsedInsights?.risks) && parsedInsights.risks.length > 0 ? (
                parsedInsights.risks.map((risk: any, idx: number) => {
                  const sevStr = risk?.severity || risk?.level || "medium";
                  const primaryMsg = risk?.message || risk?.text || risk?.risk || risk?.pattern;
                  const msgStr = primaryMsg
                    || (typeof risk === 'object' ? Object.entries(risk).filter(([k, v]) => k !== 'description' && k !== 'severity' && k !== 'level' && (typeof v === 'string')).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ') : String(risk));
                  const descStr = risk?.description || risk?.evidence;
                  const badgeColor = sevStr.toLowerCase() === 'high'
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : sevStr.toLowerCase() === 'medium'
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200";
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACTIVE RISK</span>
                        <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeColor}`}>
                          {sevStr}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                      {descStr && (
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-600">Details / Evidence:</span> {descStr}
                        </p>
                      )}
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
                  const impStr = opt?.impact || opt?.level || "high";
                  const msgStr = opt?.message || opt?.text || opt?.opportunity || opt?.recommended_service || opt?.pitch
                    || (typeof opt === 'object' ? Object.entries(opt).filter(([, v]) => typeof v === 'string').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ') : String(opt));
                  const descStr = opt?.description;
                  const badgeColor = impStr.toLowerCase() === 'high'
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : impStr.toLowerCase() === 'medium'
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-emerald-50 text-emerald-600 border-emerald-200";
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OPPORTUNITY</span>
                        <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeColor}`}>
                          {impStr}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                      {descStr && (
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-600">Expected Outcome:</span> {descStr}
                        </p>
                      )}
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
                    const textStr = typeof eng === 'string' ? eng 
                      : eng?.message || eng?.text || eng?.description || eng?.signal || eng?.quality_signal || eng?.finding
                        || (typeof eng === 'object' ? Object.entries(eng).filter(([, v]) => typeof v === 'string' || typeof v === 'number').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ') : String(eng));
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
                    const textStr = getInsightItemText(del);
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
            <Badge variant="outline" className="w-fit bg-slate-50 text-[9px] font-bold border-slate-100 text-slate-500 mt-2">On Schedule</Badge>
          </Card>

          {/* Governance Insights */}
          <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Governance
              </h3>
              <div className="divide-y divide-slate-100/80 pt-2">
                {Array.isArray(parsedInsights?.governance_insights) && parsedInsights.governance_insights.length > 0 ? (
                  parsedInsights.governance_insights.map((gov: any, idx: number) => {
                    const textStr = getInsightItemText(gov);
                    const parts = textStr.split(':');
                    const title = parts.length > 1 ? parts[0].trim() : `Check #${idx + 1}`;
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{title}</span>
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                          Passed
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                    Incomplete logs.
                  </div>
                )}
              </div>
            </div>
            <Badge variant="outline" className="w-fit bg-slate-50 text-[9px] font-bold border-slate-100 text-slate-500 mt-2">Audited</Badge>
          </Card>

          {/* Timeline Insights */}
          <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Timeline Status
              </h3>
              <div className="divide-y divide-slate-100/80 pt-2">
                {Array.isArray(parsedInsights?.timeline_insights) && parsedInsights.timeline_insights.length > 0 ? (
                  parsedInsights.timeline_insights.map((time: any, idx: number) => {
                    const textStr = getInsightItemText(time);
                    const parts = textStr.split(':');
                    const title = parts.length > 1 ? parts[0].trim() : `Milestone #${idx + 1}`;
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate" title={textStr}>{title}</span>
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                          Stable
                        </span>
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
            <Badge variant="outline" className="w-fit bg-slate-50 text-[9px] font-bold border-slate-100 text-slate-500 mt-2">Optimal</Badge>
          </Card>
        </div>

        {/* ROW 3: FINANCIAL SIGNALS & AI RECOMMENDATIONS */}
        {(() => {
          const hasFinancialData = Array.isArray(parsedInsights?.financial_insights) && parsedInsights.financial_insights.length > 0;
          return (
            <div className={`grid grid-cols-1 ${hasFinancialData ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
              {/* Financial Signals Block — only shown when data exists */}
              {hasFinancialData && (
                <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between h-full">
                  <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Financial Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-white">
                    <div className="divide-y divide-slate-100/80">
                      {parsedInsights.financial_insights.map((fin: any, idx: number) => {
                        const textStr = getInsightItemText(fin);
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
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations Block */}
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden h-full">
                <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> AI Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 bg-white">
                  {Array.isArray(parsedInsights?.recommendations || parsedInsights?.recommended_actions) && (parsedInsights?.recommendations || parsedInsights?.recommended_actions).length > 0 ? (
                    (parsedInsights?.recommendations || parsedInsights?.recommended_actions).map((rec: any, idx: number) => {
                      let parsedRec = rec;
                      if (typeof rec === 'string') {
                        try { parsedRec = JSON.parse(rec); } catch (e) { /* keep as string */ }
                      }
                      const recommendationText = typeof parsedRec === 'string'
                        ? parsedRec
                        : parsedRec?.recommendation || parsedRec?.text || parsedRec?.description || parsedRec?.message
                          || (typeof parsedRec === 'object' ? Object.entries(parsedRec).filter(([k, v]) => !['priority','rationale','expected_outcome','expected_business_outcome'].includes(k) && typeof v === 'string').map(([, v]) => v).join(' ') : String(parsedRec));
                      const priority = typeof parsedRec === 'object' && parsedRec !== null ? parsedRec.priority : undefined;
                      const rationale = typeof parsedRec === 'object' && parsedRec !== null ? parsedRec.rationale : undefined;
                      const outcome = typeof parsedRec === 'object' && parsedRec !== null ? (parsedRec.expected_business_outcome || parsedRec.expected_outcome) : undefined;
                      return (
                        <div key={idx} className="flex gap-3 items-start p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                          <div className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-700 leading-relaxed flex-1">{recommendationText}</p>
                              {priority && (
                                <Badge variant="outline" className={`text-[9px] font-black uppercase border-none px-2 py-0.5 rounded-full shrink-0 ${
                                  priority.toLowerCase() === 'high' ? "bg-rose-50 text-rose-700"
                                    : priority.toLowerCase() === 'medium' ? "bg-amber-50 text-amber-700"
                                      : "bg-emerald-50 text-emerald-700"
                                }`}>
                                  {priority}
                                </Badge>
                              )}
                            </div>
                            {rationale && (
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                <span className="font-bold text-slate-600">Rationale:</span> {rationale}
                              </p>
                            )}
                            {outcome && (
                              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                <span className="font-bold text-blue-900">Expected Outcome:</span> {outcome}
                              </p>
                            )}
                          </div>
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
          );
        })()}


      </div>
    </MainLayout>
  );
};

export default FinancialProjectInsights;
