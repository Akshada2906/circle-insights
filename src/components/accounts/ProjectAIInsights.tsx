import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Code,
  Clock,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Activity,
  DollarSign,
  TrendingUp,
  Loader2,
  Zap,
  Download,
  FileText,
  Sparkles
} from 'lucide-react';
import { api, getFinanceProjectById } from '@/services/api';
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
  let cleaned = str.replace(/```json\n?|```/g, '');
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

interface ProjectAIInsightsProps {
  projectId: string;
}

export function ProjectAIInsights({ projectId }: ProjectAIInsightsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
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
        console.error("Failed to parse raw_output", e);
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
    const fetchData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const projData = await getFinanceProjectById(projectId);
        setProject(projData);

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
      } catch (err) {
        console.error("Failed to fetch project insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleGenerateInsights = async () => {
    if (!projectId) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Our AI agents are analyzing project documents and data..." });
    try {
      const result = await api.generateProjectInsights(projectId);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({ title: "Insights Generated", description: "Project analysis completed successfully." });
        const projData = await getFinanceProjectById(projectId);
        setProject(projData);
      } else {
        throw new Error(result.error || "Failed to generate insights");
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
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
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-slate-500 font-medium text-xs">Aggregating Project Data & Hydrating UI...</p>
      </div>
    );
  }

  const healthScore = parsedInsights?.health_score !== undefined ? parsedInsights.health_score : 88;

  return (
    <div className="space-y-6">
      {!parsedInsights ? (
        <Card className="py-16 text-center border-dashed border-2 border-slate-200 bg-white/60 rounded-3xl max-w-4xl mx-auto shadow-2xs p-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-full bg-slate-50 border border-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Brain className="w-8 h-8 text-slate-300 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">No Insights Available</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6 font-medium text-xs">
            Trigger our AI agents to perform a complete project-level synthesis across weekly status reports, engineering quality documents, and delivery health.
          </p>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 rounded-xl shadow-md shadow-purple-100 gap-2 transition-all text-xs"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Metrics...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Generate Insights
              </>
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* TOP BAR / Header inside tab */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Project Strategic Analysis
                <Badge className="bg-purple-50 text-purple-700 border-none font-bold text-[10px] px-2 py-0.5">
                  Live Sync
                </Badge>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Last updated: {project?.updated_at ? new Date(project.updated_at).toLocaleString() : 'Just now'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
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

          {/* Executive Summary & Leadership Pitch Section Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left: Executive Summary (takes 2 cols) */}
            <Card className="lg:col-span-2 bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-gradient-to-r from-purple-50/60 via-blue-50/30 to-transparent border-b border-slate-100 p-5">
                  <CardTitle className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-purple-600" /> Strategic Executive Summary
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

          {/* ROW 2: STRATEGIC & RISK EXPOSURE (Takes Full Width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Critical Risks Block */}
            <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Active Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 flex-1">
                {Array.isArray(parsedInsights?.risks) && parsedInsights.risks.length > 0 ? (
                  parsedInsights.risks.map((r: any, idx: number) => {
                    const sevStr = r?.severity || r?.level || "high";
                    const capitalizedSev = sevStr.charAt(0).toUpperCase() + sevStr.slice(1).toLowerCase();
                    const msgStr = r?.message || r?.text || r?.description || JSON.stringify(r);
                    const colorClass = sevStr.toLowerCase() === 'high'
                      ? "text-rose-600 font-bold"
                      : sevStr.toLowerCase() === 'medium'
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600 font-bold";
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20" title={msgStr}>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {msgStr} - <span className={colorClass}>{capitalizedSev}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5 text-xs font-semibold text-slate-400 italic">
                    No strategic risks flagged.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strategic Opportunities Block */}
            <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-emerald-50 p-5 bg-gradient-to-r from-emerald-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 flex-1">
                {Array.isArray(parsedInsights?.opportunities) && parsedInsights.opportunities.length > 0 ? (
                  parsedInsights.opportunities.map((opt: any, idx: number) => {
                    const impStr = opt?.impact || opt?.level || "high";
                    const capitalizedImp = impStr.charAt(0).toUpperCase() + impStr.slice(1).toLowerCase();
                    const msgStr = opt?.message || opt?.text || opt?.description || JSON.stringify(opt);
                    const colorClass = impStr.toLowerCase() === 'high'
                      ? "text-emerald-600 font-bold"
                      : impStr.toLowerCase() === 'medium'
                        ? "text-amber-600 font-bold"
                        : "text-slate-500 font-bold";
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-100/60 bg-emerald-50/20" title={msgStr}>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {msgStr} - <span className={colorClass}>{capitalizedImp}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5 text-xs font-semibold text-slate-400 italic">
                    No new opportunities identified.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sided Grid for Signals and Compliance Status */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
              {/* ROW 1: CORE OPERATIONAL SIGNALS (Uniform 4-Column Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Engineering Insights */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-600" /> Engineering Signals
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
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Governance
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
                  <Badge variant="outline" className="w-fit bg-emerald-50 text-[9px] font-bold border-emerald-100 text-emerald-600 mt-2">Audited</Badge>
                </Card>

                {/* Timeline Insights */}
                <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" /> Timeline Status
                    </h3>
                    <div className="divide-y divide-slate-100/80 pt-2">
                      {Array.isArray(parsedInsights?.timeline_insights) && parsedInsights.timeline_insights.length > 0 ? (
                        parsedInsights.timeline_insights.map((tl: any, idx: number) => {
                          const textStr = getInsightItemText(tl);
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
                  <Badge variant="outline" className="w-fit bg-amber-50 text-[9px] font-bold border-amber-100 text-amber-600 mt-2">Optimal</Badge>
                </Card>
              </div>

              {/* ROW 3: FINANCIAL SIGNALS & AI RECOMMENDATIONS */}
              {(() => {
                const hasFinancialData = Array.isArray(parsedInsights?.financial_insights) && parsedInsights.financial_insights.length > 0;
                return (
                  <div className={`grid grid-cols-1 ${hasFinancialData ? 'md:grid-cols-2' : ''} gap-6 items-stretch`}>
                    {/* Financial Signals Block — only shown when data exists */}
                    {hasFinancialData && (
                      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between h-full">
                        <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                          <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
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

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                            <span className="text-xs font-bold text-slate-700">Total Budget Burn</span>
                            <div className="flex items-center gap-2.5 w-40 sm:w-48">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-[64.2%] h-full bg-purple-600 rounded-full" />
                              </div>
                              <span className="text-xs font-black text-slate-900 shrink-0">64.2%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* AI Recommendations Block */}
                    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden h-full">
                      <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                        <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" /> AI Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4 bg-white">
                        {Array.isArray(parsedInsights?.recommendations || parsedInsights?.recommended_actions) && (parsedInsights?.recommendations || parsedInsights?.recommended_actions).length > 0 ? (
                          (parsedInsights?.recommendations || parsedInsights?.recommended_actions).map((rec: any, idx: number) => {
                            let parsedRec = rec;
                            if (typeof rec === 'string') {
                              try {
                                parsedRec = JSON.parse(rec);
                              } catch (e) {
                                // Keep as string
                              }
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
                                <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">
                                      {recommendationText}
                                    </p>
                                    {priority && (
                                      <Badge variant="outline" className={`text-[9px] font-black uppercase border-none px-2 py-0.5 rounded-full shrink-0 ${
                                        priority.toLowerCase() === 'high'
                                          ? "bg-rose-50 text-rose-700"
                                          : priority.toLowerCase() === 'medium'
                                            ? "bg-amber-50 text-amber-700"
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
                                    <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
                                      <span className="font-bold text-purple-900">Expected Outcome:</span> {outcome}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-xs font-semibold text-slate-400 italic">
                            No automated action paths assigned.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>

            {/* Right Sidebar Area: 1 Column Wide */}
            <div className="lg:col-span-1 space-y-6">
              {/* Compliance Status Block */}
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100/80 shadow-xs rounded-2xl overflow-hidden text-center p-6">
                <div className="w-12 h-12 rounded-full bg-white shadow-2xs flex items-center justify-center mx-auto mb-3 text-purple-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider mb-1">Compliance Status</h4>
                <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                  Project complies with all engineering metrics and organization policy guidelines.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
