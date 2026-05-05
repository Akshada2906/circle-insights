import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  ChevronLeft,
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Loader2,
  Building2,
  Target
} from 'lucide-react';
import {
  getFinanceAccounts,
  getFinanceAccountById,
  getPrivateEquityById,
  api
} from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/types/finance-database';

interface PeInsight {
  generated_at?: string | number;
  raw_output?: string | Record<string, unknown>;
  executive_summary?: string;
  summary?: string;
  recommended_actions?: any[];
  strategic_recommendations?: any[];
  kpis?: Record<string, any>;
  risks?: any[];
  opportunities?: any[];
  portfolio_summary?: string;
  evidence_summary?: string;
  confidence_score?: number;
  account_id?: string;
  project_id?: string;
  name?: string;
}

interface PrivateEquity {
  id: string;
  name: string;
  overview?: string;
}

const PrivateEquityInsights = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<PrivateEquity | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Insights state
  const [insights, setInsights] = useState<PeInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isGeneratingAccountInsights, setIsGeneratingAccountInsights] = useState(false);
  const [isGeneratingProjectInsights, setIsGeneratingProjectInsights] = useState(false);
  const [accountInsights, setAccountInsights] = useState<PeInsight[]>([]);
  const [projectInsights, setProjectInsights] = useState<any[]>([]);

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

  const parsedAccountInsights = useMemo(() => {
    return accountInsights.map(insight => {
      let parsed = insight;
      if (insight.raw_output) {
        try {
          const cleanStr = typeof insight.raw_output === 'string' ? cleanJsonString(insight.raw_output) : insight.raw_output;
          parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
        } catch (e) {
          console.error("Failed to parse account raw_output:", e);
          parsed = { ...insight, summary: "Raw AI Output:\n" + insight.raw_output };
        }
      }
      return {
        ...parsed,
        account_id: insight.account_id || parsed.account_id
      };
    });
  }, [accountInsights]);

  const parsedProjectInsights = useMemo(() => {
    return projectInsights.map(insight => {
      let parsed = insight;
      if (insight.raw_output) {
        try {
          const cleanStr = typeof insight.raw_output === 'string' ? cleanJsonString(insight.raw_output) : insight.raw_output;
          parsed = typeof cleanStr === 'string' ? JSON.parse(cleanStr) : cleanStr;
        } catch (e) {
          console.error("Failed to parse project raw_output:", e);
          parsed = { ...insight, summary: "Raw AI Output:\n" + insight.raw_output };
        }
      }
      return {
        ...parsed,
        project_id: insight.project_id || parsed.project_id || parsed.entity_id || insight.entity_id
      };
    });
  }, [projectInsights]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [accData, firmData] = await Promise.all([
          getFinanceAccounts(),
          getPrivateEquityById(id)
        ]);
        const matchedAccountsBasic = accData.filter((a: {private_equity_id: string}) => a.private_equity_id === id);
        const fullAccounts = await Promise.all(matchedAccountsBasic.map((a: {id: string}) => getFinanceAccountById(a.id)));
        
        setAccounts(fullAccounts);
        setFirm(firmData);
        if (firmData.pe_insights) setInsights(firmData.pe_insights);

        // Load sub-insights sequentially to prevent DB pool overflow
        const accInsightsList: PeInsight[] = [];
        for (const acc of fullAccounts) {
          try {
            const res = await api.getAccountInsights(acc.id);
            if (res && res.status === 'success' && res.insights) {
              accInsightsList.push({ 
                ...res.insights, 
                account_id: res.entity_id || acc.id 
              });
            }
          } catch (e) {
            console.error(`Failed to fetch insights for account ${acc.id}`, e);
          }
        }
        setAccountInsights(accInsightsList);

        const allProjects = fullAccounts.flatMap(a => a.projects || []);
        if (allProjects.length > 0) {
          const projInsightsList: any[] = [];
          for (const proj of allProjects) {
            try {
              const res = await api.getProjectInsights(proj.id);
              if (res && res.status === 'success' && res.insights) {
                projInsightsList.push({ 
                  ...res.insights, 
                  project_id: res.entity_id || res.insights.project_id 
                });
              }
            } catch (e) {
              console.error(`Failed to fetch insights for project ${proj.id}`, e);
            }
          }
          setProjectInsights(projInsightsList);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGenerateInsights = async () => {
    if (!id) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Analyzing portfolio strategy..." });
    try {
      const result = await api.generatePeInsights(id);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({ title: "Insights Generated", description: "Portfolio analysis completed." });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleGenerateAccountInsights = async () => {
    setIsGeneratingAccountInsights(true);
    toast({ title: "Generating Account Insights", description: "Analyzing all accounts..." });
    try {
      const insightsList: PeInsight[] = [];
      for (const acc of accounts) {
        try {
          const res = await api.generateAccountInsights(acc.id);
          if (res && res.status === 'success' && res.insights) {
            insightsList.push({ 
              ...res.insights, 
              account_id: res.entity_id || acc.id 
            });
          }
        } catch (e) {
          console.error(`Failed to generate insights for account ${acc.id}`, e);
        }
      }
      setAccountInsights(insightsList);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingAccountInsights(false);
    }
  };

  const handleGenerateProjectInsights = async () => {
    setIsGeneratingProjectInsights(true);
    toast({ title: "Generating Project Insights", description: "Analyzing all projects..." });
    try {
      const allProjects = accounts.flatMap(a => a.projects || []);
      const insightsList: any[] = [];
      for (const proj of allProjects) {
        try {
          const res = await api.generateProjectInsights(proj.id);
          if (res && res.status === 'success' && res.insights) {
            insightsList.push({ 
              ...res.insights, 
              project_id: res.entity_id || res.insights.project_id 
            });
          }
        } catch (e) {
          console.error(`Failed to generate insights for project ${proj.id}`, e);
        }
      }
      setProjectInsights(insightsList);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingProjectInsights(false);
    }
  };

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
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-slate-500 font-medium">Aggregating Strategic Portfolio Data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/private-equity/${id}`)}
            className="gap-2 text-slate-600 hover:text-blue-600"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Portfolio
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900">Strategic Insights Generator</h1>
          </div>
        </div>

        <Tabs defaultValue="pe-level" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-slate-100/80 p-1 shadow-sm border border-slate-200">
              <TabsTrigger value="pe-level" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm font-semibold transition-all">PE Firm</TabsTrigger>
              <TabsTrigger value="accounts-level" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm font-semibold transition-all">Accounts</TabsTrigger>
              <TabsTrigger value="projects-level" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-semibold transition-all">Projects</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pe-level" className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Portfolio Executive Insights</h2>
                   <p className="text-slate-500 text-sm">{firm?.name} Strategic Overview</p>
                </div>
                <Button 
                  onClick={handleGenerateInsights} 
                  disabled={isGeneratingInsights}
                  className="bg-purple-600 hover:bg-purple-700 gap-2 shadow-md"
                >
                  {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Regenerate Analysis
                </Button>
             </div>

             {!parsedInsights ? (
               <Card className="py-20 text-center border-dashed border-2 border-slate-200 bg-white/50">
                  <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Portfolio Insights Found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-6">Click regenerate to trigger our AI agents to analyze the entire Private Equity portfolio.</p>
                  <Button onClick={handleGenerateInsights} className="bg-purple-600 hover:bg-purple-700">Generate Now</Button>
               </Card>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 shadow-sm border-purple-100 overflow-hidden bg-white">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b border-purple-50">
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {parsedInsights.executive_summary}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-emerald-100 shadow-sm bg-white">
                      <CardHeader className="pb-3 border-b border-emerald-50 bg-emerald-50/30">
                        <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {Array.isArray(parsedInsights.opportunities) ? parsedInsights.opportunities.map((opt: any, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {typeof opt === 'string' ? opt : (opt.text || opt.description || opt.opportunity || opt.recommendation || JSON.stringify(opt))}
                            </li>
                          )) : <li className="text-slate-400 italic text-sm">No specific opportunities.</li>}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-rose-100 shadow-sm bg-white">
                      <CardHeader className="pb-3 border-b border-rose-50 bg-rose-50/30">
                        <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Portfolio Risks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {Array.isArray(parsedInsights.risks) ? parsedInsights.risks.map((risk: any, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              {typeof risk === 'string' ? risk : (risk.text || risk.description || risk.risk || risk.issue || JSON.stringify(risk))}
                            </li>
                          )) : <li className="text-slate-400 italic text-sm">No risks identified.</li>}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
               </div>
             )}
          </TabsContent>

          <TabsContent value="accounts-level" className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Account Strategy Analysis</h2>
                   <p className="text-slate-500 text-sm">Deep dive into {accounts.length} portfolio companies</p>
                </div>
                <Button 
                  onClick={handleGenerateAccountInsights} 
                  disabled={isGeneratingAccountInsights}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {isGeneratingAccountInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Regenerate All Accounts
                </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(acc => {
                   const insight = parsedAccountInsights.find(ai => ai.account_id === acc.id || ai.name === acc.name);
                   return (
                     <Card key={acc.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
                           <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                              {acc.name}
                              {insight ? <Badge className="bg-emerald-100 text-emerald-700">Analyzed</Badge> : <Badge variant="outline" className="text-slate-400">Pending</Badge>}
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                           {insight ? (
                             <>
                                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                   {insight.executive_summary || insight.summary}
                                </p>
                                {insight.risks && (
                                  <div className="flex flex-wrap gap-2">
                                     {Array.isArray(insight.risks) && insight.risks.slice(0, 2).map((r: any, i: number) => (
                                       <Badge key={i} variant="outline" className="text-[10px] border-rose-100 text-rose-600 bg-rose-50 truncate max-w-[150px]">
                                          {typeof r === 'string' ? r : r.text}
                                       </Badge>
                                     ))}
                                  </div>
                                )}
                             </>
                           ) : (
                             <div className="text-center py-6">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => api.generateAccountInsights(acc.id).then(r => setAccountInsights(prev => [...prev, r.insights]))}
                                  className="text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                >
                                   Analyze Account
                                </Button>
                             </div>
                           )}
                        </CardContent>
                     </Card>
                   );
                })}
             </div>
          </TabsContent>

          <TabsContent value="projects-level" className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Project Portfolio Health</h2>
                   <p className="text-slate-500 text-sm">Delivery and technical scan across all active projects</p>
                </div>
                <Button 
                  onClick={handleGenerateProjectInsights} 
                  disabled={isGeneratingProjectInsights}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {isGeneratingProjectInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Regenerate All Projects
                </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.flatMap(a => a.projects || []).map(proj => {
                   const insight = parsedProjectInsights.find(pi => pi.project_id === proj.id);
                   return (
                     <Card key={proj.id} className="border-blue-50 shadow-sm bg-white hover:border-blue-200 transition-all">
                        <CardHeader className="p-4 pb-2">
                           <CardTitle className="text-sm font-bold text-slate-900 truncate" title={proj.name}>
                              {proj.name}
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                           {insight ? (
                             <>
                                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                                   {insight.executive_summary || insight.summary || insight.portfolio_summary || insight.description || (typeof insight === 'string' ? insight : "Analysis available.")}
                                </p>
                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-50">
                                   <span className="text-slate-400 font-medium">Revenue: {formatCurrency(proj.total_revenue)}</span>
                                   <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] h-4">Active</Badge>
                                </div>
                             </>
                           ) : (
                             <div className="py-4 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => api.generateProjectInsights(proj.id).then(r => setProjectInsights(prev => [...prev, r.insights]))}
                                  className="text-[10px] text-blue-600 hover:bg-blue-50 h-7"
                                >
                                   Generate Insight
                                </Button>
                             </div>
                           )}
                        </CardContent>
                     </Card>
                   );
                })}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PrivateEquityInsights;
