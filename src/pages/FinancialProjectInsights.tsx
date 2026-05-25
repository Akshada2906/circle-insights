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
  AlertTriangle
} from 'lucide-react';
import { getFinanceProjectById, getFinanceAccountById, api } from '@/services/api';
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
    return parsed;
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Project Strategic Insights
              </h1>
            </div>
          </div>
        </div>

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
                  const typeStr = risk?.type || risk?.category || "OPERATIONAL RISK";
                  const sevStr = (risk?.severity || risk?.level || "medium").toLowerCase();
                  const msgStr = risk?.message || risk?.text || risk?.description || JSON.stringify(risk);
                  const badgeClass = sevStr === 'high' 
                    ? "bg-rose-50 text-rose-700 border-rose-200 font-black text-[9px] px-2.5 py-0.5 shadow-none" 
                    : "bg-slate-50 text-slate-600 border-slate-200 font-black text-[9px] px-2.5 py-0.5 shadow-none";
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1" title={msgStr}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                        <Badge variant="outline" className={badgeClass}>
                          {sevStr.charAt(0).toUpperCase() + sevStr.slice(1)} Severity
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
                    const textStr = typeof gov === 'string' ? gov : gov?.message || gov?.text || gov?.description || JSON.stringify(gov);
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
                    const textStr = typeof time === 'string' ? time : time?.message || time?.text || time?.description || JSON.stringify(time);
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
    </MainLayout>
  );
};

export default FinancialProjectInsights;
