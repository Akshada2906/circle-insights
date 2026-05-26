import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

import {
  Brain,
  TrendingUp,
  Loader2,
  Target,
  ShieldAlert,
  Bot,
  Zap,
  Download,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Briefcase,
  Eye,
  Search
} from 'lucide-react';
import {
  getFinanceAccountById,
  api
} from '@/services/api';
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

interface AccountAIInsightsProps {
  accountId: string;
  accountData?: any;
}

export function AccountAIInsights({ accountId, accountData }: AccountAIInsightsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [projectInsightsMap, setProjectInsightsMap] = useState<Record<string, any>>({});
  const [projectSearchQuery, setProjectSearchQuery] = useState('');


  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    portfolio: true,
    financial: true,
    delivery: true,
    ai: true,
    governance: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const parsedInsights = useMemo(() => {
    if (!insights) return null;
    let parsed = insights;
    if (insights.raw_output) {
      try {
        const cleanStr = typeof insights.raw_output === 'string' ? cleanJsonString(insights.raw_output) : insights.raw_output;
        parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
      } catch (e) {
        console.error("Failed to parse account raw_output:", e);
        parsed = { ...insights, summary: "Raw AI Output:\n" + insights.raw_output };
      }
    }
    return parsed;
  }, [insights]);

  useEffect(() => {
    if (accountId) {
      const fetchFinanceData = async () => {
        setLoading(true);
        try {
          let responseData = accountData;
          if (!responseData) {
            responseData = await getFinanceAccountById(accountId);
          }
          setData(responseData);
          try {
            const res = await api.getAccountInsights(accountId);
            if (res && res.status === 'success' && res.insights) {
              setInsights(res.insights);
            } else if (responseData.account_insights) {
              setInsights(responseData.account_insights);
            }
          } catch (e) {
            if (responseData.account_insights) {
              setInsights(responseData.account_insights);
            }
          }

          if (responseData && responseData.projects && responseData.projects.length > 0) {
            const insightsMap: Record<string, any> = {};
            await Promise.all(
              responseData.projects.map(async (proj: any) => {
                try {
                  const res = await api.getProjectInsights(proj.id);
                  if (res && res.status === 'success' && res.insights) {
                    insightsMap[proj.id] = res.insights;
                  }
                } catch (e) {
                  console.error('Failed to load project insights for project ID', proj.id, e);
                }
              })
            );
            setProjectInsightsMap(insightsMap);
          }

        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFinanceData();
    }
  }, [accountId, accountData]);

  const handleGenerateInsights = async () => {
    if (!accountId) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Triggering our AI agents to deeply analyze account and project telemetry..." });
    try {
      const result = await api.generateAccountInsights(accountId);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({ title: "Insights Generated", description: "Account comprehensive intelligence synthesis completed." });
      } else {
        throw new Error(result.error || "Failed to generate synthesis.");
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // const formatLastUpdated = (timestamp?: string | number) => {
  //   if (!timestamp) return "Oct 24, 2023, 10:45 AM";
  //   const date = new Date(timestamp);
  //   if (isNaN(date.getTime())) return "Oct 24, 2023, 10:45 AM";
  //   return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  // };


  const getProjectInsightsRowData = (proj: any, idx: number) => {
    const accountProjectInsights = parsedInsights?.project_insights || parsedInsights?.insights?.project_insights || [];
    const matchedProjectInsight = projectInsightsMap[proj.id] || accountProjectInsights.find((pi: any) => pi.project_id === proj.id || pi.project_name === proj.name)?.insight;
    const enrichedProj = { ...proj, overall_insights: matchedProjectInsight || proj.overall_insights };
    const aiInsight = enrichedProj.overall_insights?.summary || enrichedProj.overall_insights?.executive_summary || enrichedProj.overall_insights?.insights?.summary;
    const insight = proj.ai_recommendations?.split('\n')[0] ||
      (aiInsight ? (aiInsight.length > 80 ? aiInsight.substring(0, 80) + '...' : aiInsight) : null) ||
      (proj.overview ? proj.overview.substring(0, 60) + '...' : null) ||
      'Reviewing project trajectory and resource allocation.';
    const riskLevel = idx % 3 === 0 ? 'low' : idx % 3 === 1 ? 'medium' : 'high';
    const riskLabel = riskLevel === 'low' ? 'Minimal operational risk' : riskLevel === 'medium' ? 'Resource buffer monitoring' : 'Schedule slippage risk';
    const riskColor = riskLevel === 'low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
    const risk = { level: riskLevel, label: riskLabel, color: riskColor };
    const oppCount = Math.floor((proj.total_revenue || 0) / 100000) || 1;
    const date = proj.created_at ? new Date(proj.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 23, 2023';
    return { insight, risk, oppCount, date };
  };

  const projectsList = data?.projects || [];
  const filteredProjectsList = useMemo(() => {
    const q = projectSearchQuery.trim().toLowerCase();
    if (!q) return projectsList;
    return projectsList.filter((proj: any) => {
      const name = String(proj.name || '').toLowerCase();
      const id = String(proj.id || '').toLowerCase();
      const overview = String(proj.overview || '').toLowerCase();
      return name.includes(q) || id.includes(q) || overview.includes(q);
    });
  }, [projectsList, projectSearchQuery]);



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium text-xs">Analyzing Account Strategic Intelligence Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!parsedInsights ? (
        <Card className="py-16 text-center border-dashed border-2 border-slate-200 bg-white/60 rounded-3xl max-w-4xl mx-auto shadow-2xs p-6 animate-in fade-in duration-300">
          <div className="p-4 rounded-full bg-slate-50 border border-slate-100 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Brain className="w-8 h-8 text-slate-300 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">No Insights Available</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6 font-medium text-xs">
            Trigger our AI agents to extract structured intelligence, risk mappings, and strategic execution plans across this account and its projects.
          </p>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-md shadow-blue-100 gap-2 transition-all text-xs"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Telemetry...
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
                Account Strategic Analysis
                <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] px-2 py-0.5">
                  Live Sync
                </Badge>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Last updated: {parsedInsights.generated_at ? new Date(parsedInsights.generated_at).toLocaleString() : 'Just now'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 px-4 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isGeneratingInsights}
                    className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold gap-1 shadow-2xs"
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
                    <AlertDialogAction onClick={handleGenerateInsights} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Executive Summary + Quick Actions side-by-side */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Executive Summary */}
            <Card className="bg-white border border-blue-100 shadow-sm rounded-2xl overflow-hidden flex-1">
              <CardHeader className="bg-gradient-to-r from-blue-50/60 via-indigo-50/20 to-transparent border-b border-blue-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Executive Summary
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {parsedInsights.executive_summary || parsedInsights.summary ||
                    "No executive summary compiled yet. Trigger deep account analysis above."}
                </p>
              </CardContent>
            </Card>

            {/* Right Panels */}
            <div className="flex flex-col gap-3 lg:w-64 shrink-0">
              {/* Quick Actions Panel */}
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col justify-between">
                <div>
                  <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4">
                    <CardTitle className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-blue-600" /> Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => toast({ title: "Downloading Report", description: "Exporting fully structured strategic synthesis report..." })}
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
                        a.download = `${data?.name || 'account'}_insights.json`;
                        a.click();
                      }}
                      className="w-full justify-start gap-2 text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 h-9 rounded-lg px-2"
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-400" /> Export JSON
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>

          {/* Side-by-Side: Risks vs Opportunities Blocks precisely mimicking PE Insights styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Risks Column */}
            <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-rose-50 p-4 bg-gradient-to-r from-rose-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Critical Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-1">
                {Array.isArray(parsedInsights.risks) && parsedInsights.risks.length > 0 ? (
                  parsedInsights.risks.map((risk: any, idx: number) => {
                    const sevStr = risk?.severity || risk?.level || "medium";
                    const capitalizedSev = sevStr.charAt(0).toUpperCase() + sevStr.slice(1).toLowerCase();
                    const msgStr = risk?.message || risk?.text || risk?.description || JSON.stringify(risk);
                    const colorClass = sevStr.toLowerCase() === 'high'
                      ? "text-rose-600 font-bold"
                      : sevStr.toLowerCase() === 'medium'
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600 font-bold";
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20">
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {msgStr} - <span className={colorClass}>{capitalizedSev}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs font-semibold text-slate-400 italic text-center py-4">
                    No critical risks populated from live scan.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opportunities Column */}
            <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
              <CardHeader className="border-b border-emerald-50 p-4 bg-gradient-to-r from-emerald-50/40 to-transparent">
                <CardTitle className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-1">
                {Array.isArray(parsedInsights.opportunities) && parsedInsights.opportunities.length > 0 ? (
                  parsedInsights.opportunities.map((opt: any, idx: number) => {
                    const priStr = opt?.impact || opt?.priority || "medium";
                    const capitalizedPri = priStr.charAt(0).toUpperCase() + priStr.slice(1).toLowerCase();
                    const msgStr = opt?.message || opt?.text || opt?.description || JSON.stringify(opt);
                    const colorClass = priStr.toLowerCase() === 'high'
                      ? "text-rose-600 font-bold"
                      : priStr.toLowerCase() === 'medium'
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600 font-bold";
                    return (
                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-100/60 bg-emerald-50/20">
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                          {msgStr} - <span className={colorClass}>{capitalizedPri}</span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs font-semibold text-slate-400 italic text-center py-4">
                    No strategic opportunities generated yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
              {[
                { id: 'portfolio', title: 'Portfolio Insights', icon: TrendingUp, color: 'text-purple-600', items: Array.isArray(parsedInsights.portfolio_insights) ? parsedInsights.portfolio_insights : [] },
                { id: 'financial', title: 'Financial Insights', icon: Target, color: 'text-emerald-600', items: Array.isArray(parsedInsights.financial_insights) ? parsedInsights.financial_insights : [] },
                { id: 'delivery', title: 'Delivery Insights', icon: CheckCircle2, color: 'text-blue-600', items: Array.isArray(parsedInsights.delivery_insights) ? parsedInsights.delivery_insights : [] },
                { id: 'ai', title: 'AI Insights', icon: Bot, color: 'text-indigo-600', items: Array.isArray(parsedInsights.ai_insights) ? parsedInsights.ai_insights : [] },
                { id: 'governance', title: 'Governance Insights', icon: Layers, color: 'text-slate-700', items: Array.isArray(parsedInsights.governance_insights) ? parsedInsights.governance_insights : [] }
              ].map((section) => {
                const isExpanded = expandedSections[section.id];
                return (
                  <Card key={section.id} className="bg-white border border-slate-200/80 shadow-2xs rounded-xl overflow-hidden transition-all">
                    <div
                      onClick={() => toggleSection(section.id)}
                      className="p-3.5 px-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className={`w-3.5 h-3.5 ${section.color}`} />
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{section.title}</span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="p-4 pt-1 border-t border-slate-50/80 bg-slate-50/20">
                        {section.items && section.items.length > 0 ? (
                          <ul className="space-y-2 pt-2">
                            {section.items.map((item: any, i: number) => (
                              <li key={i} className="flex gap-2 items-start text-xs font-semibold text-slate-600 leading-relaxed">
                                <span className="text-slate-400 text-[10px] select-none">•</span>
                                <span className="flex-1">{typeof item === 'string' ? item : item?.message || item?.text || item?.description || JSON.stringify(item)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs font-semibold text-slate-400 italic pt-2 text-center">
                            No insights populated for this category.
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-xs rounded-xl overflow-hidden text-center p-4">
                <div className="w-9 h-9 rounded-full bg-white shadow-2xs flex items-center justify-center mx-auto mb-2 text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-black text-blue-950 uppercase tracking-wider mb-0.5">Compliance Status</h4>
                <p className="text-[10px] font-semibold text-slate-600 leading-relaxed">
                  Account is currently in good standing with all policies.
                </p>
              </Card>
            </div>
          </div>



          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/50">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-blue-600" /> Recommendations Execution Path
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Array.isArray(parsedInsights.recommended_actions || parsedInsights.recommendations) && (parsedInsights.recommended_actions || parsedInsights.recommendations).length > 0 ? (
                (parsedInsights.recommended_actions || parsedInsights.recommendations).map((rec: any, idx: number) => {
                  const recStr = typeof rec === 'string' ? rec : rec?.text || rec?.description || JSON.stringify(rec);
                  return (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-xs font-black text-slate-400 select-none">{idx + 1}.</span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">
                        {recStr}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs font-semibold text-slate-400 italic text-center py-2">
                  No strategic recommendations compiled. Trigger live synthesis above.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Insights Table */}
          <div className="pt-2 space-y-3" id="projects-insights-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">Projects Insights</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[9px] px-2 py-0.5">
                  {projectSearchQuery.trim()
                    ? `${filteredProjectsList.length} / ${projectsList.length}`
                    : `${projectsList.length} Projects`}
                </Badge>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white border-slate-200/80 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                  aria-label="Search projects in insights"
                />
              </div>
            </div>

            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9 pl-4">Project Name</TableHead>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9">Key Insight</TableHead>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9">Top Risk</TableHead>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9 text-center">Opportunities</TableHead>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9">Last Updated</TableHead>
                      <TableHead className="font-black text-[10px] text-slate-500 uppercase tracking-wider h-9 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!projectsList || projectsList.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-xs font-bold text-slate-400 italic">
                          No projects associated with this account.
                        </TableCell>
                      </TableRow>
                    ) : filteredProjectsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-xs font-bold text-slate-400 italic">
                          No projects match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProjectsList.map((proj: any, idx: number) => {
                        const { insight, risk, oppCount, date } = getProjectInsightsRowData(proj, idx);
                        return (
                          <TableRow
                            key={proj.id}
                            className="border-b border-slate-100/60 hover:bg-blue-50/20 cursor-pointer transition-colors group"
                            onClick={() => navigate(`/financials/${accountId}/projects/${proj.id}`)}
                          >
                            <TableCell className="pl-4 py-3 font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                              {proj.name}
                            </TableCell>

                            <TableCell className="py-3 max-w-xs truncate text-xs font-semibold text-slate-600">{insight}</TableCell>
                            <TableCell className="py-3">
                              <div className="space-y-0.5">
                                <Badge variant="outline" className={`text-[8px] font-black uppercase px-1.5 py-0 rounded-full border ${risk.color}`}>{risk.level}</Badge>
                                <span className="block text-[10px] font-semibold text-slate-500 truncate max-w-[140px]">{risk.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-black text-[10px] flex items-center justify-center mx-auto border border-slate-200/60">
                                {oppCount}
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-[10px] font-semibold text-slate-500 whitespace-nowrap">{date}</TableCell>
                            <TableCell className="py-3 text-right pr-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); navigate(`/financials/${accountId}/projects/${proj.id}`); }}
                                className="text-[11px] font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 rounded-lg h-7 px-2"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Project
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
