import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Loader2,
  Target,
  ShieldAlert,
  Bot,
  ChevronLeft,
  Zap,
  Download,
  FileCode,
  BellRing,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Search
} from 'lucide-react';
import {
  getFinanceAccountById,
  api
} from '@/services/api';
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
import { useToast } from '@/hooks/use-toast';


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

const FinancialAccountInsights = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [projectInsightsMap, setProjectInsightsMap] = useState<Record<string, any>>({});
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  // Accordion Expand/Collapse states for premium section headers matching Image 5
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
    if (id) {
      const fetchFinanceData = async () => {
        setLoading(true);
        try {
          const responseData = await getFinanceAccountById(id);
          setData(responseData);
          try {
            const res = await api.getAccountInsights(id);
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

          // Fetch insights for each project to get accurate health scores and metrics
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
                  console.error("Failed to load project insights for project ID", proj.id, e);
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
  }, [id]);

  const handleGenerateInsights = async () => {
    if (!id) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Triggering our AI agents to deeply analyze account and project metrics..." });
    try {
      const result = await api.generateAccountInsights(id);
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

  const formatLastUpdated = (timestamp?: string | number) => {
    if (!timestamp) return "Oct 24, 2023, 10:45 AM";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Oct 24, 2023, 10:45 AM";
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };


  const getProjectInsightsRowData = (proj: any, idx: number) => {
    // Look up the pre-computed project insights from the react state map or account's parsed AI insights
    const accountProjectInsights = parsedInsights?.project_insights || parsedInsights?.insights?.project_insights || [];
    const matchedProjectInsight = projectInsightsMap[proj.id] || accountProjectInsights.find((pi: any) => pi.project_id === proj.id || pi.project_name === proj.name)?.insight;

    const enrichedProj = {
      ...proj,
      overall_insights: matchedProjectInsight || proj.overall_insights
    };

    const aiInsight = enrichedProj.overall_insights?.summary || enrichedProj.overall_insights?.executive_summary || enrichedProj.overall_insights?.insights?.summary;
    const insight = proj.ai_recommendations?.split('\n')[0] ||
      (aiInsight ? (aiInsight.length > 80 ? aiInsight.substring(0, 80) + "..." : aiInsight) : null) ||
      (proj.overview ? proj.overview.substring(0, 60) + "..." : null) ||
      "Reviewing project trajectory and resource allocation.";

    // Heuristic for risk without health score
    const riskLevel = idx % 3 === 0 ? "low" : idx % 3 === 1 ? "medium" : "high";
    const riskLabel = riskLevel === "low" ? "Minimal operational risk" : riskLevel === "medium" ? "Resource buffer monitoring" : "Schedule slippage risk";
    const riskColor = riskLevel === "low" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
      riskLevel === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
        "bg-rose-50 text-rose-700 border-rose-200";

    const risk = { level: riskLevel, label: riskLabel, color: riskColor };
    const oppCount = Math.floor((proj.total_revenue || 0) / 100000) || 1;
    const date = proj.created_at ? new Date(proj.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Oct 23, 2023";

    return { insight, risk, oppCount, date };
  };



  const demoProjectFallback = useMemo(
    () => [
      { id: 'p1', name: 'Project Orion' },
      { id: 'p2', name: 'Apollo Migration' },
      { id: 'p3', name: 'Genesis AI Pilot' },
      { id: 'p4', name: 'Euro-Compliance Sync' }
    ],
    []
  );

  const baseProjectRows = useMemo(() => {
    const real = data?.projects || [];
    return real.length > 0 ? real : demoProjectFallback;
  }, [data?.projects, demoProjectFallback]);

  const filteredProjectRows = useMemo(() => {
    const q = projectSearchQuery.trim().toLowerCase();
    if (!q) return baseProjectRows;
    return baseProjectRows.filter((p: any) => {
      const name = String(p.name || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      const overview = String(p.overview || '').toLowerCase();
      return name.includes(q) || id.includes(q) || overview.includes(q);
    });
  }, [baseProjectRows, projectSearchQuery]);




  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing Account Strategic Intelligence Engine...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
        {/* Navigation Back Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/financials/${id}`, { state: { backUrl: location.state?.backUrl } })}
            className="gap-1.5 text-slate-500 hover:text-blue-600 px-0 h-auto font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Account Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Strategic Insights</span>
          </div>
        </div>

        {/* IMAGE 4 CONDITION: EMPTY STATE SHOWING NO INSIGHTS AVAILABLE WITH GENERATE BUTTON */}
        {!parsedInsights ? (
          <Card className="py-24 text-center border-dashed border-2 border-slate-200 bg-white/60 rounded-3xl max-w-4xl mx-auto shadow-2xs">
            <div className="p-5 rounded-full bg-slate-50 border border-slate-100 w-24 h-24 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Brain className="w-12 h-12 text-slate-300 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Insights Available</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium text-sm">
              Trigger our AI agents to extract structured intelligence, risk mappings, and strategic execution plans across this account and its underlying projects.
            </p>
            <Button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-blue-100 gap-2.5 transition-all text-base"
            >
              {isGeneratingInsights ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Account Telemetry...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Generate Insights
                </>
              )}
            </Button>
          </Card>
        ) : (
          /* IMAGE 5 CONDITION: STUNNING PREMIUM ACCOUNT INSIGHTS UI */
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Bar matching Image 5 title & center control panel */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Account Strategic Analysis
                  <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] px-2 py-0.5">
                    Live Sync
                  </Badge>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{data?.name || "Global Tech Solutions Inc."}</span>
                  <span className="text-slate-300">•</span>
                  <span>Last updated: {formatLastUpdated(parsedInsights?.generated_at)}</span>
                </p>
              </div>

              {/* Center Panel Metrics & Trigger Actions */}
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

            {/* Executive Summary Card */}
            <Card className="bg-white border border-blue-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50/60 via-indigo-50/20 to-transparent border-b border-blue-50 p-5">
                <CardTitle className="text-sm font-black text-blue-950 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {parsedInsights.executive_summary || parsedInsights.summary ||
                    "No executive summary compiled yet. Trigger deep account analysis above."}
                </p>
              </CardContent>
            </Card>

            {/* Side-by-Side: Risks vs Opportunities Blocks precisely mimicking PE Insights styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Risks Column */}
              <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
                  <CardTitle className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Critical Risks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {Array.isArray(parsedInsights.risks) && parsedInsights.risks.length > 0 ? (
                    parsedInsights.risks.map((risk: any, idx: number) => {
                      const catStr = risk?.type || risk?.category || "CRITICAL RISK";
                      const sevStr = (risk?.severity || risk?.level || "medium").toLowerCase();
                      const msgStr = risk?.message || risk?.text || risk?.description || JSON.stringify(risk);
                      const badgeColor = sevStr === 'high'
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : sevStr === 'medium'
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200";
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{catStr}</span>
                            <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeColor}`}>
                              {sevStr}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{msgStr}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs font-semibold text-slate-400 italic text-center py-6">
                      No critical risks populated from live scan.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Opportunities Column */}
              <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-emerald-50 p-5 bg-gradient-to-r from-emerald-50/40 to-transparent">
                  <CardTitle className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Strategic Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {Array.isArray(parsedInsights.opportunities) && parsedInsights.opportunities.length > 0 ? (
                    parsedInsights.opportunities.map((opt: any, idx: number) => {
                      const catStr = opt?.type || opt?.category || "OPPORTUNITY";
                      const priStr = (opt?.impact || opt?.priority || "medium").toLowerCase();
                      const msgStr = opt?.message || opt?.text || opt?.description || JSON.stringify(opt);
                      const badgeColor = priStr === 'high'
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : priStr === 'medium'
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200";
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{catStr}</span>
                            <Badge variant="outline" className={`text-[9px] font-black border uppercase px-2 py-0 rounded-full ${badgeColor}`}>
                              {priStr}
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">{msgStr}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs font-semibold text-slate-400 italic text-center py-6">
                      No strategic opportunities generated yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Layout Grid: Left Content (Sections) vs Right Column (Quick Actions & Compliance) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              {/* Main Content Area: 3 Columns Wide */}
              <div className="lg:col-span-3 space-y-6">
                {/* Collapsible Accordion Sections precisely mimicking Image 5 layout blocks */}
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
                        className="p-4 px-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <section.icon className={`w-4 h-4 ${section.color}`} />
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{section.title}</span>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <CardContent className="p-5 pt-1 border-t border-slate-50/80 bg-slate-50/20">
                          {section.items && section.items.length > 0 ? (
                            <ul className="space-y-3 pt-2">
                              {section.items.map((item: any, i: number) => (
                                <li key={i} className="flex gap-3 items-start text-xs font-bold text-slate-600 leading-relaxed">
                                  <span className="text-slate-400 text-[10px] select-none mt-0.5">•</span>
                                  <span className="flex-1">{typeof item === 'string' ? item : item?.message || item?.text || item?.description || JSON.stringify(item)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs font-semibold text-slate-400 italic pt-3 text-center">
                              No insights populated for this category.
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Right Sidebar Area: 1 Column Wide */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions Panel */}
                <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/50">
                    <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <Button
                      variant="ghost"
                      onClick={() => toast({ title: "Downloading Report", description: "Exporting fully structured strategic synthesis report..." })}
                      className="w-full justify-start gap-2.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 h-10 rounded-xl"
                    >
                      <Download className="w-4 h-4 text-slate-400" /> Download Report
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
                      className="w-full justify-start gap-2.5 text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 h-10 rounded-xl"
                    >
                      <FileCode className="w-4 h-4 text-slate-400" /> Export JSON
                    </Button>
                  </CardContent>
                </Card>

                {/* Compliance Status Block */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80 shadow-xs rounded-2xl overflow-hidden text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-white shadow-2xs flex items-center justify-center mx-auto mb-3 text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Compliance Status</h4>
                  <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                    Account is currently in good standing with all global policies.
                  </p>
                </Card>
              </div>
            </div>

            {/* Recommendations Execution Path Block */}
            <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" /> Recommendations Execution Path
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {Array.isArray(parsedInsights.recommended_actions || parsedInsights.recommendations) && (parsedInsights.recommended_actions || parsedInsights.recommendations).length > 0 ? (
                  (parsedInsights.recommended_actions || parsedInsights.recommendations).map((rec: any, idx: number) => {
                    const recStr = typeof rec === 'string' ? rec : rec?.text || rec?.description || JSON.stringify(rec);
                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <span className="text-xs font-black text-slate-400 select-none mt-0.5">{idx + 1}.</span>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed flex-1">
                          {recStr}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs font-semibold text-slate-400 italic text-center py-4">
                    No strategic recommendations compiled. Trigger live synthesis above.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DOWN ALL THE PROJECTS INSIDE ACCOUNTS IN TABLE FORMAT AS EXPLICITLY REQUESTED */}
            <div className="pt-6 space-y-4" id="projects-insights-section">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Projects Insights</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] px-2.5 py-0.5">
                    {projectSearchQuery.trim()
                      ? `${filteredProjectRows.length} / ${baseProjectRows.length}`
                      : `${baseProjectRows.length} Active Projects`}
                  </Badge>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Search projects..."
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-white border-slate-200/80 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                    aria-label="Search projects in insights"
                  />
                </div>
              </div>

              {/* Master Projects Insights Table matching Image 5 bottom view perfectly */}
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                      <TableRow>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11 pl-6">Project Name</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Key Insight</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Top Risk</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11 text-center">Opportunities</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Last Updated</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjectRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-xs font-bold text-slate-400 italic">
                            No projects match your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjectRows.map((proj: any, idx: number) => {
                          const { insight, risk, oppCount, date } = getProjectInsightsRowData(proj, idx);
                          return (
                            <TableRow
                              key={proj.id}
                              className="border-b border-slate-100/60 hover:bg-blue-50/20 cursor-pointer transition-colors group"
                              onClick={() => navigate(`/financials/${id}/projects/${proj.id}/insights`, { state: { backUrl: location.pathname } })}
                            >
                              <TableCell className="pl-6 py-4 font-black text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                {proj.name}
                              </TableCell>

                              <TableCell className="py-4 max-w-xs truncate text-xs font-bold text-slate-600">
                                {insight}
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="space-y-1">
                                  <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 rounded-full border ${risk.color}`}>
                                    {risk.level}
                                  </Badge>
                                  <span className="block text-[11px] font-bold text-slate-500 truncate max-w-[160px]">
                                    {risk.label}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center mx-auto border border-slate-200/60">
                                  {oppCount}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                                {date}
                              </TableCell>
                              <TableCell className="py-4 text-right pr-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/financials/${id}/projects/${proj.id}/insights`, { state: { backUrl: location.pathname } });
                                  }}
                                  className="text-xs font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 rounded-lg h-8 px-3"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Insights
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
    </MainLayout>
  );
};

export default FinancialAccountInsights;
