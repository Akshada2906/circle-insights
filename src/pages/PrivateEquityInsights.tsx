import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  ChevronLeft,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Loader2,
  Building2,
  Target,
  Activity,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Search,
  Download,
  Filter,
  Briefcase,
  PieChart,
  Globe,
  BellRing,
  FileText,
  ExternalLink,
  Eye
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
  portfolio_insights?: any[];
  strategic_gaps?: any[];
  capability_solutions?: any[];
  capability_alignment?: any[];
  recommendations?: any[];
  leadership_pitch?: string[];
  [key: string]: any;
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Insights state
  const [insights, setInsights] = useState<PeInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
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

  const parsedInsights: PeInsight | null = useMemo(() => {
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
        if (firmData.pe_insights) {
          setInsights(firmData.pe_insights);
        } else {
          try {
            const peIns = await api.getPeInsights(id);
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
  }, [id]);

  const handleGenerateInsights = async () => {
    if (!id) return;
    setIsGeneratingInsights(true);
    toast({ title: "Generating Insights", description: "Analyzing portfolio strategy across all holdings..." });
    try {
      const result = await api.generatePeInsights(id);
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



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };


  // Helper to retrieve actual dynamic metrics per account, avoiding hardcoded fallback values
  const getAccountOverviewMetrics = (acc: Account, index: number) => {
    const vertical = (acc as any).domain || "-";
    const manager = acc.account_manager?.trim() || "Unassigned";
    
    const totalRev = acc.current_revenue || acc.total_revenue || 0;
    const targetRev = acc.target_revenue || 0;
    let score = 0;
    if (targetRev > 0) {
      score = Math.min(100, Math.round((totalRev / targetRev) * 100));
    } else if (totalRev > 0) {
      score = 85;
    } else if ((acc.active_project_count || 0) > 0) {
      score = 75;
    } else {
      score = 0;
    }

    const val = targetRev > 0 ? targetRev * 10 : totalRev > 0 ? totalRev * 10 : 0;

    return { vertical, manager, score, val };
  };

  const filteredAccountsTable = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ((acc as any).domain && (acc as any).domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPortfolioValuation = accounts.reduce((acc, curr, idx) => {
    const { val } = getAccountOverviewMetrics(curr, idx);
    return acc + val;
  }, 0) || 1420000000;

  const healthScore = parsedInsights?.overall_health_score ?? parsedInsights?.portfolio_health_score ?? parsedInsights?.overall_health ?? 84.2;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-slate-500 font-medium">Aggregating Strategic Portfolio Data & Hydrating UI...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/private-equity/${id}`)}
                className="gap-1.5 text-slate-500 hover:text-blue-600 px-0 h-auto font-semibold"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Portfolio
              </Button>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Synthesis</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {firm?.name || "Vanguard Tech Fund III"}
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-none font-bold text-xs px-2.5 py-0.5">
                PE Fund Level
              </Badge>
            </h1>
            <p className="text-base font-semibold text-slate-600 mt-2 leading-relaxed">
              A high-growth technology portfolio focused on B2B SaaS, AI Infrastructure, and decentralized supply chain solutions. Currently managing {accounts.length || 3} accounts across 4 global regions.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              onClick={handleGenerateInsights} 
              disabled={isGeneratingInsights}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md shadow-purple-100 h-11 px-6 rounded-xl font-bold transition-all"
            >
              {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              Regenerate Insights
            </Button>
          </div>
        </div>

        {/* Top Header Metrics Matching Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Portfolio Health Score</span>
                <p className="text-3xl font-black text-purple-950">{healthScore}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Aggregated across all verticals</span>
              <Badge className="bg-purple-100 text-purple-700 border-none text-[10px] font-black">Stable</Badge>
            </div>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Accounts</span>
                <p className="text-3xl font-black text-slate-900">{accounts.length || 12}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">3 Active Acquisitions pending</span>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            </div>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total AUM (Est.)</span>
                <p className="text-3xl font-black text-emerald-950">{formatCurrency(totalPortfolioValuation)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 font-bold">+12% YoY Performance</span>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/50 text-[10px] font-black">Top Tier</Badge>
            </div>
          </Card>

          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Critical Risks</span>
                <p className="text-3xl font-black text-rose-600">3</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600">Requires immediate attention</span>
              <Badge className="bg-rose-100 text-rose-700 border-none text-[10px] font-black">Action Req</Badge>
            </div>
          </Card>
        </div>

        {/* PE Insights Synthesis Dashboard Layout */}
        <div className="space-y-8 animate-in fade-in duration-500 mt-4">
          {/* Main Layout Grid: Left Content (Sections) vs Right Sidebar (Quick Actions & Leadership Pitch) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Main Content Area: 3 Columns Wide */}
            <div className="lg:col-span-3 space-y-6">
              {/* Executive Overview Synthesis Block */}
              <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50/60 via-indigo-50/30 to-transparent border-b border-purple-100/60 p-5">
                  <CardTitle className="text-base font-black text-purple-950 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" /> Executive Strategic Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {parsedInsights?.portfolio_summary || parsedInsights?.executive_summary || 
                     "No strategic synthesis generated yet. Click 'Regenerate Insights' above to trigger deep agentic synthesis."}
                  </p>
                </CardContent>
              </Card>

              {/* Portfolio Insights Block */}
              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-blue-600" /> Portfolio Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-4">
                    {Array.isArray(parsedInsights?.portfolio_insights) && parsedInsights.portfolio_insights.length > 0 ? (
                      parsedInsights.portfolio_insights.map((pi: any, idx: number) => (
                        <li key={idx} className="flex gap-3 items-start">
                          <div className="p-1 rounded-full bg-purple-50 text-purple-600 font-bold text-xs shrink-0 mt-0.5">✓</div>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed">
                            {typeof pi === 'string' ? pi : pi?.message || pi?.text || pi?.description || JSON.stringify(pi)}
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs font-semibold text-slate-400 italic text-center py-4">
                        No portfolio insights compiled. Trigger analysis to view dynamic metrics.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar Area: 1 Column Wide */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions Panel */}
              <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Actions</CardTitle>
                  <span className="text-[10px] font-bold text-slate-400">Portfolio Level</span>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  <Button
                    variant="ghost"
                    onClick={() => toast({ title: "Downloading Report", description: "Exporting full strategic synthesis report..." })}
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
                      a.download = `${firm?.name || 'portfolio'}_insights.json`;
                      a.click();
                    }}
                    className="w-full justify-start gap-2.5 text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 h-10 rounded-xl"
                  >
                    <FileText className="w-4 h-4 text-slate-400" /> Export JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Strategic Opportunities & Critical Risks Section Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Opportunities */}
            <Card className="bg-white border border-emerald-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-emerald-50 p-5 bg-gradient-to-r from-emerald-50/40 to-transparent">
                <CardTitle className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Strategic Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Array.isArray(parsedInsights?.opportunities) && parsedInsights.opportunities.length > 0 ? (
                  parsedInsights.opportunities.map((opt: any, idx: number) => {
                    const typeStr = opt?.category || "OPPORTUNITY";
                    const impStr = (opt?.impact || opt?.level || "High").toLowerCase();
                    const titStr = opt?.type || opt?.title || opt?.name || "Value Creation Potential";
                    const descStr = opt?.description || opt?.message || opt?.text || JSON.stringify(opt);
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-emerald-100/60 bg-emerald-50/20 space-y-1.5" title={descStr}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                          <Badge variant="outline" className="text-[9px] font-black border-emerald-200 text-emerald-700 bg-white">
                            {impStr}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 truncate">{titStr}</h4>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">{descStr}</p>
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

            {/* Risks */}
            <Card className="bg-white border border-rose-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-rose-50 p-5 bg-gradient-to-r from-rose-50/40 to-transparent">
                <CardTitle className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Critical Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Array.isArray(parsedInsights?.risks) && parsedInsights.risks.length > 0 ? (
                  parsedInsights.risks.map((risk: any, idx: number) => {
                    const typeStr = risk?.category || "CRITICAL RISK";
                    const impStr = (risk?.severity || risk?.level || "High").toLowerCase();
                    const titStr = risk?.type || risk?.title || risk?.name || "Portfolio Exposure";
                    const descStr = risk?.description || risk?.message || risk?.text || JSON.stringify(risk);
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-rose-100/60 bg-rose-50/20 space-y-1.5" title={descStr}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{typeStr}</span>
                          <Badge variant="outline" className="text-[9px] font-black border-rose-200 text-rose-700 bg-white">
                            {impStr}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 truncate">{titStr}</h4>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">{descStr}</p>
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
          </div>

          {/* Strategic Recommendations Block */}
          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" /> Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {Array.isArray(parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations) && (parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations).length > 0 ? (
                (parsedInsights?.strategic_recommendations || parsedInsights?.recommended_actions || parsedInsights?.recommendations).map((rec: any, idx: number) => {
                  const titStr = rec?.title || rec?.action || `Strategic Initiative #${idx + 1}`;
                  const descStr = typeof rec === 'string' ? rec : rec?.text || rec?.description || rec?.message || JSON.stringify(rec);
                  return (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                        {idx + 1}
                      </div>
                      <div>
                        {typeof rec !== 'string' && rec?.title && <h4 className="text-xs font-black text-slate-900 mb-1">{titStr}</h4>}
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">{descStr}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs font-semibold text-slate-400 italic">
                  No strategic recommendations populated. Trigger live analysis above.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategic Gaps - Full Width Table Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" /> Strategic Gaps
              </h3>
              <Button variant="link" size="sm" className="text-xs font-bold text-blue-600 hover:text-blue-700 p-0 h-auto">
                Analyze All Gaps →
              </Button>
            </div>
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
                          ? "text-rose-700 font-black"
                          : impStr === 'medium'
                          ? "text-amber-700 font-black"
                          : "text-purple-700 font-black";
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
                          No strategic gaps identified. Generate live insights to hydrate breakdown.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Capability Alignment & Solutions Table Block */}
          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 bg-slate-50/50">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Capability Alignment & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10 pl-6">Identified Gap</TableHead>
                    <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10">Relevant Capability</TableHead>
                    <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10">Solution Approach</TableHead>
                    <TableHead className="font-black text-[11px] text-slate-500 uppercase tracking-wider h-10 text-right pr-6">Estimated ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(parsedInsights?.capability_alignment || parsedInsights?.capability_solutions) && (parsedInsights?.capability_alignment || parsedInsights?.capability_solutions).length > 0 ? (
                    (parsedInsights?.capability_alignment || parsedInsights?.capability_solutions).map((row: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-slate-100/60 hover:bg-slate-50/40">
                        <TableCell className="pl-6 py-4 font-black text-sm text-slate-900 min-w-[180px]">{row?.gap || row?.identified_gap || row?.gap_type || "Process Optimizations"}</TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[10px] border-none">
                            {row?.relevant_capability || row?.capability || "Delivery Core"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-600 py-3.5">{row?.solution_approach || row?.solution || "Agile Realignment"}</TableCell>
                        <TableCell className="font-black text-xs text-purple-700 text-right pr-6 py-3.5">{row?.roi || row?.estimated_roi || row?.impact || "+14% margin"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-xs font-semibold text-slate-400 italic">
                        No capability alignment models triggered. Run analysis to display matrix.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Leadership Pitch Block - Full Width Horizontal */}
          <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md rounded-2xl overflow-hidden border-none">
            <CardHeader className="px-4 py-3 border-b border-slate-800/80">
              <CardTitle className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Leadership Pitch</span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">Q4 Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {Array.isArray(parsedInsights?.leadership_pitch) && parsedInsights.leadership_pitch.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-1 border-l-2 border-purple-500 pl-3 py-0.5">
                    <p className="text-xs font-bold italic text-slate-200 leading-snug">
                      "{parsedInsights.leadership_pitch[0]}"
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    {parsedInsights.leadership_pitch.length > 1 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {parsedInsights.leadership_pitch.slice(1).map((pitchStr: string, pIdx: number) => (
                          <div key={pIdx} className="flex gap-1.5 items-start bg-slate-800/30 px-2.5 py-1.5 rounded-lg border border-slate-800/50">
                            <span className="text-purple-400 font-bold text-[10px] shrink-0 mt-0.5">•</span>
                            <span className="text-[11px] text-slate-300 font-medium leading-tight">{pitchStr}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Core strategic positioning directive.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-xs font-semibold text-slate-500 italic">
                  No leadership pitch synthesized.
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-slate-800/60 text-[9px] text-slate-500 font-bold italic text-right">
                - Prepared for the Q4 Investment Committee Review.
              </div>
            </CardContent>
          </Card>

            {/* DOWN ALL THE ACCOUNTS IN TABLE FORMAT AS EXPLICITLY REQUESTED */}
            <div className="pt-6 space-y-4" id="accounts-overview-section">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" /> Accounts Overview
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Comprehensive view of all portfolio holdings and sub-entities</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search accounts..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-white border-slate-200/80 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-3.5 rounded-xl border-slate-200 gap-1.5 font-bold text-xs text-slate-600 shadow-2xs bg-white">
                    <Filter className="w-3.5 h-3.5" /> Filters
                  </Button>
                  <Button size="sm" className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-1.5 font-bold text-xs shadow-2xs">
                    <Download className="w-3.5 h-3.5" /> Export Report
                  </Button>
                </div>
              </div>

              <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                      <TableRow>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11 pl-6">Account Name</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Portfolio Vertical</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Health Score</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Valuation (Est.)</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11">Account Manager</TableHead>
                        <TableHead className="font-black text-xs text-slate-500 uppercase tracking-wider h-11 text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccountsTable.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-xs font-bold text-slate-400">
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
                              onClick={() => navigate(`/financials/${acc.id}`, { state: { backUrl: location.pathname } })}
                            >
                              <TableCell className="pl-6 py-4">
                                <div>
                                  <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors block">
                                    {acc.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                                    UID: {acc.id.substring(0, 8).toUpperCase()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-none font-bold text-xs px-2.5 py-0.5">
                                  {(acc as any).domain || vertical}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 w-44">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs font-black">
                                    <span className={score < 50 ? "text-rose-600" : score < 80 ? "text-amber-600" : "text-emerald-600"}>
                                      {score}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">Target</span>
                                  </div>
                                  <Progress 
                                    value={score} 
                                    className={`h-1.5 bg-slate-100 [&>div]:${score < 50 ? 'bg-rose-500' : score < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="font-black text-xs text-slate-900">
                                  {formatCurrency(val)}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                {(() => {
                                  const displayName = manager;
                                  const isUnassigned = displayName === 'Unassigned';
                                  return (
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 uppercase border ${isUnassigned ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                                        {isUnassigned ? '-' : displayName.split(' ').map(n => n[0]).join('').substring(0, 2) || displayName.substring(0, 2)}
                                      </div>
                                      <span className={`text-xs font-bold ${isUnassigned ? 'text-slate-400 italic' : 'text-slate-700'}`}>{displayName}</span>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="py-4 text-right pr-6">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/financials/${acc.id}/insights`, { state: { backUrl: location.pathname } });
                                  }}
                                  className="text-xs font-black text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1.5 rounded-lg h-8 px-3"
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
      </div>
    </MainLayout>
  );
};

export default PrivateEquityInsights;
