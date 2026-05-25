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
  Filter
} from 'lucide-react';
import {
  getFinanceAccounts,
  getFinanceAccountById,
  getPrivateEquityById,
  api
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/types/finance-database';
import { getAccountHealthScore } from '@/lib/health-score';
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
    return {
      ...parsed,
      executive_summary: parsed.executive_summary || parsed.summary || parsed.portfolio_summary,
      recommended_actions: parsed.recommended_actions || parsed.strategic_recommendations,
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

        if (firmData.pe_insights) {
          setInsights(firmData.pe_insights);
        } else {
          try {
            const peIns = await api.getPeInsights(firmId);
            if (peIns && peIns.status === 'success' && peIns.insights) {
              setInsights(peIns.insights);
            }
          } catch (e) {
            console.error("Failed to fetch dedicated PE insights:", e);
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

  const healthScore = parsedInsights?.overall_health_score ?? parsedInsights?.portfolio_health_score ?? parsedInsights?.overall_health ?? 84.2;

  const getAccountOverviewMetrics = (acc: Account, index: number) => {
    const vertical = (acc as any).domain || "-";
    const manager = acc.account_manager?.trim() || "Unassigned";
    const score = getAccountHealthScore(acc);
    const totalRev = acc.current_revenue || acc.total_revenue || 0;
    const targetRev = acc.target_revenue || 0;
    const val = targetRev > 0 ? targetRev * 10 : totalRev > 0 ? totalRev * 10 : 0;
    return { vertical, manager, score, val };
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

            <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 px-4 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isGeneratingInsights}
                    className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold gap-1 shadow-2xs"
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

          {/* Executive Summary + Actions */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden flex-1">
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
            </Card>

            <div className="flex flex-col gap-3 lg:w-64 shrink-0">
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4">
                    <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-purple-600" /> Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => toast({ title: "Downloading Report", description: "Exporting full strategic synthesis report..." })}
                      className="w-full justify-start gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 h-9 rounded-lg px-2"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" /> Download Report
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(parsedInsights, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${firm?.name || 'portfolio'}_insights.json`;
                        a.click();
                      }}
                      className="w-full justify-start gap-2 text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 h-9 rounded-lg px-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Export JSON
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
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
                    const typeStr = risk?.category || "CRITICAL RISK";
                    const impStr = (risk?.severity || risk?.level || "High").toLowerCase();
                    const descStr = risk?.description || risk?.message || risk?.text || JSON.stringify(risk);
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-rose-200 text-rose-700 bg-white px-1.5 py-0 rounded-full">
                            {impStr}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{descStr}</p>
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
                    const typeStr = opt?.category || "OPPORTUNITY";
                    const impStr = (opt?.impact || opt?.level || "High").toLowerCase();
                    const descStr = opt?.description || opt?.message || opt?.text || JSON.stringify(opt);
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-emerald-200 text-emerald-700 bg-white px-1.5 py-0 rounded-full">
                            {impStr}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{descStr}</p>
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
                  <ul className="space-y-3">
                    {Array.isArray(parsedInsights.portfolio_insights) && parsedInsights.portfolio_insights.length > 0 ? (
                      parsedInsights.portfolio_insights.map((pi: any, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs font-semibold text-slate-600 leading-relaxed">
                          <div className="p-1 rounded-full bg-purple-50 text-purple-600 font-bold text-xs shrink-0 mt-0.5">✓</div>
                          <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">
                            {typeof pi === 'string' ? pi : pi?.message || pi?.text || pi?.description || JSON.stringify(pi)}
                          </p>
                        </li>
                      ))
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
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {Array.isArray(parsedInsights.capability_alignment) ? (
                        parsedInsights.capability_alignment.map((cap: any, idx: number) => (
                          <div key={idx} className="p-3.5 bg-blue-50/20 border border-blue-100/60 rounded-xl space-y-2">
                            {cap.gap || cap.identified_gap || cap.gap_type || cap.domain || cap.category || cap.title ? (
                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-blue-800 uppercase tracking-wider bg-blue-100/60 px-1.5 py-0.5 rounded-md">Identified Gap</span>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed mt-0.5">
                                  {cap.gap || cap.identified_gap || cap.gap_type || cap.domain || cap.category || cap.title}
                                </p>
                              </div>
                            ) : null}

                            {(cap.relevant_capability || cap.capability || cap.solution_approach || cap.solution) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100/50 mt-2">
                                {(cap.relevant_capability || cap.capability) && (
                                  <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Relevant Capability</span>
                                    <span className="text-xs font-bold text-slate-700">{cap.relevant_capability || cap.capability}</span>
                                  </div>
                                )}
                                {(cap.solution_approach || cap.solution) && (
                                  <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Solution Approach</span>
                                    <span className="text-xs font-semibold text-slate-700 leading-relaxed block">{cap.solution_approach || cap.solution}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {!(cap.gap || cap.identified_gap || cap.gap_type || cap.domain || cap.category || cap.title || cap.relevant_capability || cap.capability || cap.solution_approach || cap.solution) && (
                              <p className="text-xs font-semibold text-slate-600 leading-relaxed">{JSON.stringify(cap)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-semibold text-slate-500">{JSON.stringify(parsedInsights.capability_alignment)}</p>
                      )}
                    </div>
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
                  const descStr = typeof rec === 'string' ? rec : rec?.text || rec?.description || rec?.message || JSON.stringify(rec);
                  return (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                        {idx + 1}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{descStr}</p>
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
                      <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10 text-right pr-6">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(parsedInsights?.strategic_gaps) && parsedInsights.strategic_gaps.length > 0 ? (
                      parsedInsights.strategic_gaps.map((gap: any, i: number) => {
                        const titStr = gap?.gap_type || gap?.title || gap?.name || "Strategic Gap";
                        const descStr = gap?.description || gap?.desc || gap?.text || "—";
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
                            <TableCell className={`py-4 text-right pr-6 text-xs uppercase tracking-wider ${impColor}`}>{impStr}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-xs font-semibold text-slate-400 italic">
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
                <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-slate-200 gap-1.5 font-bold text-xs text-slate-600 shadow-2xs bg-white">
                  <Filter className="w-3.5 h-3.5" /> Filters
                </Button>
                <Button size="sm" className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-1.5 font-bold text-xs shadow-2xs">
                  <Download className="w-3.5 h-3.5" /> Export Report
                </Button>
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
                        const { vertical, manager, score, val } = getAccountOverviewMetrics(acc, index);
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
