import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Brain,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Loader2,
  Target,
  Activity,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Search,
  Download,
  FileText,
  Briefcase,
  PieChart,
  Globe,
  Eye,
  Sparkles
} from 'lucide-react';
import {
  getFinanceAccounts,
  getFinanceAccountById,
  getPrivateEquityById,
  api
} from '@/services/api';
import { exportInsightsToPDF, getInsightItemText } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/types/finance-database';
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

interface PEAIInsightsProps {
  firmId: string;
}

export function PEAIInsights({ firmId }: PEAIInsightsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    const rawSummary = parsed.executive_summary || parsed.summary || parsed.portfolio_summary;
    return {
      ...parsed,
      executive_summary: formatSummary(rawSummary),
      portfolio_summary: formatSummary(rawSummary),
      recommended_actions: parsed.recommended_actions || parsed.strategic_recommendations,
      risks: (parsed.risks || parsed.investment_risk_signals || []).map((r: any) => ({
        type: r.risk || r.type || r.title || r.name || "",
        severity: r.risk_level || r.severity || r.level || "High",
        description: r.business_impact || r.description || r.message || r.text || JSON.stringify(r),
        affected_accounts: r.affected_accounts || []
      })),
      opportunities: (parsed.opportunities || parsed.portfolio_standardisation_opportunities || []).map((o: any) => ({
        type: o.opportunity || o.type || o.title || o.name || o.standardization_area || "",
        level: o.priority || o.impact || o.level || "High",
        description: o.expected_business_outcome || o.description || o.message || o.text || JSON.stringify(o),
        affected_accounts: o.affected_accounts || []
      })),
      portfolio_insights: parsed.portfolio_insights || [
        ...(parsed.portfolio_operational_analysis?.portfolio_patterns || []).map((p: any) => ({
          type: 'pattern',
          pattern: p.pattern,
          severity: p.severity,
          impact: p.business_impact,
          affected_accounts: p.affected_accounts || []
        })),
        ...(parsed.pe_strategy_alignment?.misaligned_areas || []).map((m: any) => ({
          type: 'misalignment',
          pattern: `Gap in ${m.strategy_goal}: ${m.portfolio_gap}`,
          severity: 'medium',
          impact: '',
          affected_accounts: m.affected_accounts || []
        }))
      ],
      strategic_gaps: (parsed.strategic_gaps || parsed.portfolio_gap_analysis || []).map((g: any) => ({
        gap_type: g.gap || g.gap_type || g.title || g.name || "Strategic Gap",
        description: g.business_impact || g.description || g.desc || g.text || "—",
        severity: g.severity || g.impact || "medium",
        affected_accounts: g.affected_accounts || []
      })),
      capability_alignment: (parsed.capability_alignment || parsed.capability_to_opportunity_mapping || []).map((c: any) => ({
        gap: c.gap || c.identified_gap || c.gap_type || "",
        relevant_capability: c.company_capability || c.relevant_capability || c.capability || "",
        solution_approach: c.transformation_approach || c.solution_approach || c.solution || "",
        roi: c.expected_business_outcome || c.roi || c.estimated_roi || c.impact || ""
      })),
      leadership_pitch: parsed.leadership_pitch || (parsed.leadership_pitches || []).map((l: any) =>
        `Pitch: ${l.pitch} - Proof Point: ${l.proof_point} (Outcome: ${l.expected_business_outcome})`
      ),
      evidence_summary: parsed.evidence_summary,
      confidence_score: parsed.confidence_score !== undefined ? parsed.confidence_score : 0.85,
      generated_at: parsed.generated_at || insights.generated_at || Date.now()
    };
  }, [insights]);

  useEffect(() => {
    const fetchData = async () => {
      if (!firmId) return;
      try {
        setLoading(true);
        const [accData, firmData] = await Promise.all([
          getFinanceAccounts(),
          getPrivateEquityById(firmId)
        ]);
        const matchedAccountsBasic = accData.filter((a: { private_equity_id: string }) => a.private_equity_id === firmId);
        const fullAccounts = await Promise.all(matchedAccountsBasic.map(async (a: { id: string }) => {
          const acc = await getFinanceAccountById(a.id);
          try {
            const responseData = await api.getAccountInsights(a.id);
            const account_insights = responseData.insights || responseData.account_insights || responseData;
            return { ...acc, account_insights };
          } catch (e) {
            return acc;
          }
        }));
        setAccounts(fullAccounts);
        setFirm(firmData);
        try {
          const peIns = await api.getPeInsights(firmId);
          if (peIns && peIns.status === 'success' && peIns.insights) {
            setInsights(peIns.insights);
          } else if (firmData.pe_insights) {
            setInsights(firmData.pe_insights);
          }
        } catch (e) {
          console.error("Failed to fetch dedicated PE insights:", e);
          if (firmData.pe_insights) {
            setInsights(firmData.pe_insights);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [firmId]);

  const handleGenerateInsights = async () => {
    if (!firmId) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Analyzing portfolio strategy across all holdings..." });
    try {
      const result = await api.generatePeInsights(firmId);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({ title: "Insights Generated", description: "Portfolio strategic synthesis completed." });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingInsights(false);
    }
  };



  const getAccountOverviewMetrics = (acc: Account, index: number) => {
    const vertical = (acc as any).domain || "-";
    const manager = acc.account_manager?.trim() || "Unassigned";
    const totalRev = acc.current_revenue || acc.total_revenue || 0;
    const targetRev = acc.target_revenue || 0;
    const val = targetRev > 0 ? targetRev * 10 : totalRev > 0 ? totalRev * 10 : 0;
    return { vertical, manager, val };
  };

  const filteredAccountsTable = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((acc as any).domain && (acc as any).domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const pitchText = useMemo(() => {
    if (!parsedInsights) return '';
    if (Array.isArray(parsedInsights.leadership_pitch)) {
      return parsedInsights.leadership_pitch.length > 0 ? parsedInsights.leadership_pitch[0] : '';
    }
    return parsedInsights.leadership_pitch || '';
  }, [parsedInsights]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-slate-500 font-medium text-xs">Aggregating Strategic Portfolio Data & Hydrating UI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!parsedInsights ? (
        <Card className="py-16 text-center border-dashed border-2 border-slate-200 bg-white/60 rounded-3xl max-w-4xl mx-auto shadow-2xs p-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-full bg-slate-50 border border-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Brain className="w-8 h-8 text-slate-300 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">No Insights Available</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6 font-medium text-xs">
            Trigger our AI agents to perform a complete portfolio level synthesis across all accounts and key performance metrics.
          </p>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 rounded-xl shadow-md shadow-purple-100 gap-2 transition-all text-xs"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Holdings...
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
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Strategic Synthesis
                <Badge className="bg-purple-50 text-purple-700 border-none font-bold text-[10px] px-2 py-0.5">
                  Live Analysis
                </Badge>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Last updated: {new Date(parsedInsights.generated_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (parsedInsights) {
                    exportInsightsToPDF('pe', firm?.name || 'Private Equity', parsedInsights);
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
                  a.download = `${firm?.name || 'portfolio'}_insights.json`;
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
                <CardHeader className="bg-gradient-to-r from-purple-50/60 via-indigo-50/20 to-transparent border-b border-purple-50 p-4">
                  <CardTitle className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-purple-600" /> Portfolio Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {parsedInsights.executive_summary || "No executive summary available. Trigger analysis above."}
                  </p>
                </CardContent>
              </div>
            </Card>

            {/* Right: Leadership Pitch (takes 1 col) */}
            <Card className="lg:col-span-1 bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4">
                  <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Leadership Pitch
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
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

          {/* Strategic Opportunities & Critical Risks Section Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Risks Column */}
            <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Critical Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Array.isArray(parsedInsights?.risks) && parsedInsights.risks.length > 0 ? (
                  parsedInsights.risks.map((risk: any, idx: number) => {
                    const sevStr = (risk?.severity || risk?.level || "High").toLowerCase();
                    const sevLabel = sevStr.toUpperCase();
                    const msgStr = risk?.message || risk?.text || risk?.description || risk?.pattern || risk?.risk
                      || (typeof risk === 'object' ? Object.entries(risk).filter(([k, v]) => !['severity', 'level', 'affected_accounts'].includes(k) && typeof v === 'string').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ') : String(risk));
                    const impactStr = risk?.impact || risk?.business_impact;
                    const badgeBg = sevStr === 'high'
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : sevStr === 'medium'
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200";
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CRITICAL RISK</span>
                          <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeBg}`}>
                            {sevLabel}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                        {impactStr && (
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            <span className="font-bold text-slate-600">Impact:</span> {impactStr}
                          </p>
                        )}
                        {Array.isArray(risk?.affected_accounts) && risk.affected_accounts.length > 0 && (
                          <p className="text-[10px] text-rose-700 font-semibold pt-1 border-t border-rose-100/30">
                            Affected: <span className="font-bold text-rose-900">{risk.affected_accounts.join(', ')}</span>
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs font-semibold text-slate-400 italic">
                    No critical risks reported.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opportunities Column */}
            <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-emerald-50 p-5 bg-gradient-to-r from-emerald-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Array.isArray(parsedInsights?.opportunities) && parsedInsights.opportunities.length > 0 ? (
                  parsedInsights.opportunities.map((opt: any, idx: number) => {
                    const impStr = (opt?.impact || opt?.level || opt?.priority || "High").toLowerCase();
                    const impLabel = impStr.toUpperCase();
                    const msgStr = opt?.message || opt?.text || opt?.description || opt?.opportunity
                      || (typeof opt === 'object' ? Object.entries(opt).filter(([k, v]) => !['impact', 'level', 'priority', 'affected_accounts'].includes(k) && typeof v === 'string').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ') : String(opt));
                    const outcomeStr = opt?.expected_outcome || opt?.expected_business_outcome || opt?.business_outcome;
                    const badgeBg = impStr === 'high'
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : impStr === 'medium'
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200";
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPPORTUNITY</span>
                          <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeBg}`}>
                            {impLabel}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">{msgStr}</p>
                        {outcomeStr && (
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            <span className="font-bold text-slate-600">Expected Outcome:</span> {outcomeStr}
                          </p>
                        )}
                        {Array.isArray(opt?.affected_accounts) && opt.affected_accounts.length > 0 && (
                          <p className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-emerald-100/30">
                            Affected: <span className="font-bold text-emerald-900">{opt.affected_accounts.join(', ')}</span>
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs font-semibold text-slate-400 italic">
                    No strategic opportunities generated yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
              <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Portfolio Growth Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-4">
                    {Array.isArray(parsedInsights?.portfolio_insights) && parsedInsights.portfolio_insights.length > 0 ? (
                      parsedInsights.portfolio_insights.map((pi: any, idx: number) => {
                        const isStr = typeof pi === 'string';
                        let text = '';
                        let severity = undefined;
                        let impact = undefined;
                        let affected = undefined;

                        if (isStr) {
                          text = pi;
                        } else if (typeof pi === 'object' && pi !== null) {
                          const keys = Object.keys(pi);
                          const textKey = keys.find(k => ['pattern', 'opportunity', 'pitch', 'gap', 'message', 'text', 'description', 'title'].includes(k.toLowerCase()));
                          const severityKey = keys.find(k => k.toLowerCase() === 'severity');
                          const impactKey = keys.find(k => ['impact', 'business_impact'].includes(k.toLowerCase()));
                          const affectedKey = keys.find(k => ['affected_accounts', 'affected accounts', 'affected'].includes(k.toLowerCase()));

                          text = textKey ? String(pi[textKey]) : '';
                          if (severityKey) severity = String(pi[severityKey]);
                          if (impactKey) impact = String(pi[impactKey]);
                          if (affectedKey) {
                            affected = Array.isArray(pi[affectedKey]) ? pi[affectedKey] : [String(pi[affectedKey])];
                          }

                          if (!text) {
                            text = getInsightItemText(pi);
                          }
                        }

                        return (
                          <li key={idx} className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                            <div className="p-1 rounded-full bg-purple-50 text-purple-600 font-bold text-xs shrink-0 mt-0.5">✓</div>
                            <div className="flex-1 space-y-1">
                              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                {text}
                              </p>
                              {impact && (
                                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                                  <span className="font-bold text-slate-700">Business Impact:</span> {impact}
                                </p>
                              )}
                              {((severity) || (Array.isArray(affected) && affected.length > 0)) && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 border-t border-slate-100/60 text-[10px]">
                                  {severity && (
                                    <span className={`uppercase font-black ${severity.toLowerCase() === 'high'
                                        ? "text-rose-600"
                                        : "text-amber-600"
                                      }`}>{severity} Severity</span>
                                  )}
                                  {Array.isArray(affected) && affected.length > 0 && (
                                    <span className="text-slate-500 font-semibold">
                                      Affected: <span className="font-bold text-slate-700">{affected.join(', ')}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-xs font-semibold text-slate-400 italic text-center py-4">
                        No portfolio insights compiled.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {parsedInsights.capability_alignment && (
                <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden">
                  <CardHeader className="p-4 border-b border-slate-100">
                    <CardTitle className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-blue-600" /> Capability Alignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/40">
                        <TableRow>
                          <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9 pl-5">Identified Gap</TableHead>
                          <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9">Relevant Capability</TableHead>
                          <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9">Solution Approach</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(parsedInsights.capability_alignment) && parsedInsights.capability_alignment.length > 0 ? (
                          parsedInsights.capability_alignment.map((cap: any, idx: number) => (
                            <TableRow key={idx} className="border-b border-slate-100/60 hover:bg-slate-50/40">
                              <TableCell className="pl-5 py-3.5 font-bold text-xs text-slate-900 min-w-[150px]">
                                {cap.gap || cap.identified_gap || cap.gap_type || cap.domain || cap.category || cap.title || "—"}
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[9px] border-none whitespace-nowrap">
                                  {cap.relevant_capability || cap.capability || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-xs text-slate-600 py-3">
                                {cap.solution_approach || cap.solution || "—"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-xs font-semibold text-slate-400 italic">
                              No capability alignment models triggered.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {Array.isArray(parsedInsights?.leadership_pitch) && parsedInsights.leadership_pitch.length > 0 && (
                <Card className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden mt-6">
                  <CardHeader className="p-4 border-b border-slate-100">
                    <CardTitle className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Leadership Pitches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {parsedInsights.leadership_pitch.map((pitch: any, idx: number) => {
                        const text = typeof pitch === 'string' ? pitch : (pitch.pitch || pitch.message || JSON.stringify(pitch));
                        return (
                          <li key={idx} className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs font-bold text-slate-600 leading-relaxed">
                            <span className="text-indigo-600 text-xs mt-0.5 select-none">•</span>
                            <span className="flex-1">{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>

          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-purple-600" /> Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {Array.isArray(parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations) && (parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations).length > 0 ? (
                (parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations).map((rec: any, idx: number) => {
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
                    : parsedRec?.recommendation || parsedRec?.text || parsedRec?.description || parsedRec?.message || JSON.stringify(parsedRec);
                  const priority = typeof parsedRec === 'object' && parsedRec !== null ? parsedRec.priority : undefined;
                  const rationale = typeof parsedRec === 'object' && parsedRec !== null ? parsedRec.rationale : undefined;
                  const outcome = typeof parsedRec === 'object' && parsedRec !== null ? (parsedRec.expected_business_outcome || parsedRec.expected_outcome) : undefined;

                  return (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">
                            {recommendationText}
                          </p>
                          {priority && (
                            <Badge variant="outline" className={`text-[9px] font-black uppercase border-none px-2 py-0.5 rounded-full shrink-0 ${priority.toLowerCase() === 'high'
                                ? "bg-rose-50 text-rose-700"
                                : priority.toLowerCase() === 'medium'
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}>
                              {priority} Priority
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
                <div className="text-center py-8 text-xs font-semibold text-slate-400 italic">
                  No strategic recommendations populated.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-600" /> Strategic Gaps
            </h3>
            <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/60">
                    <TableRow>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10 pl-6">Identified Gap</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10">Description</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10">Affected Accounts</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10 text-right pr-6">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(parsedInsights?.strategic_gaps) && parsedInsights.strategic_gaps.length > 0 ? (
                      parsedInsights.strategic_gaps.map((gap: any, i: number) => {
                        const titStr = gap?.gap_type || gap?.title || gap?.name || "Strategic Gap";
                        const descStr = gap?.description || gap?.desc || gap?.text || "—";
                        const affectedAccountsStr = Array.isArray(gap?.affected_accounts) && gap.affected_accounts.length > 0
                          ? gap.affected_accounts.join(', ')
                          : "—";
                        const impStr = (gap?.impact || gap?.severity || "medium").toLowerCase();
                        const impColor = impStr === 'critical' || impStr === 'high'
                          ? "text-rose-700 font-bold"
                          : impStr === 'medium'
                            ? "text-amber-700 font-bold"
                            : "text-purple-700 font-bold";
                        return (
                          <TableRow key={i} className="border-b border-slate-100/60 hover:bg-slate-50/40">
                            <TableCell className="pl-6 py-4 font-black text-sm text-slate-900 min-w-[180px]">{titStr}</TableCell>
                            <TableCell className="py-4 text-xs font-semibold text-slate-600 max-w-2xl">{descStr}</TableCell>
                            <TableCell className="py-4 text-xs font-semibold text-slate-500 min-w-[150px]">{affectedAccountsStr}</TableCell>
                            <TableCell className={`py-4 text-right pr-6 text-xs uppercase tracking-wider ${impColor}`}>{impStr}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-xs font-semibold text-slate-400 italic">
                          No strategic gaps identified.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Overview Section at the end of PE Insights tab */}
          <div className="pt-6 space-y-4" id="accounts-overview-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                  <Briefcase className="w-4 h-4 text-blue-600" /> Accounts Overview
                </h2>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Comprehensive view of all portfolio holdings and sub-entities</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white border-slate-200/80 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-11 pl-6">Account Name</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-11">Portfolio Vertical</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-11">Valuation (Est.)</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-11">Account Manager</TableHead>
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-11 text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccountsTable.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-28 text-center text-xs font-bold text-slate-400">
                          No matching accounts found in portfolio.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAccountsTable.map((acc, index) => {
                        const { vertical, manager, val } = getAccountOverviewMetrics(acc, index);
                        return (
                          <TableRow
                            key={acc.id}
                            className="border-b border-slate-100/60 hover:bg-blue-50/20 cursor-pointer transition-colors group"
                            onClick={() => navigate(`/financials/${acc.id}`, { state: { backUrl: `/private-equity/${firmId}` } })}
                          >
                            <TableCell className="pl-6 py-3.5">
                              <span className="font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors block cursor-pointer">
                                {acc.name}
                              </span>
                            </TableCell>
                            <TableCell className="py-3.5">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none font-bold text-[10px] px-2 py-0.5">
                                {(acc as any).domain || vertical}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-3.5">
                              <span className="font-black text-xs text-slate-900">
                                {formatCurrency(val)}
                              </span>
                            </TableCell>
                            <TableCell className="py-3.5">
                              {(() => {
                                const displayName = manager;
                                const isUnassigned = displayName === 'Unassigned';
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full font-black text-[9px] flex items-center justify-center shrink-0 uppercase border ${isUnassigned ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                                      {isUnassigned ? '-' : displayName.split(' ').map(n => n[0]).join('').substring(0, 2) || displayName.substring(0, 2)}
                                    </div>
                                    <span className={`text-xs font-bold ${isUnassigned ? 'text-slate-400 italic' : 'text-slate-700'}`}>{displayName}</span>
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="py-3.5 text-right pr-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/financials/${acc.id}`, { state: { backUrl: `/private-equity/${firmId}` } });
                                }}
                                className="text-[11px] font-black text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 rounded-lg h-7 px-2.5"
                              >
                                <Eye className="w-3 h-3" /> View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
