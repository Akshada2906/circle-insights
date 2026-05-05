import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, Loader2, Target, ShieldAlert, Bot, ChevronLeft, Zap
} from 'lucide-react';
import { 
  getFinanceAccountById, 
  api
} from '@/services/api';
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
          if (responseData.account_insights) {
            setInsights(responseData.account_insights);
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
    toast({ title: "Generating Insights", description: "Analyzing account performance..." });
    try {
      const result = await api.generateAccountInsights(id);
      if (result.status === 'success') {
        setInsights(result.insights);
        toast({ title: "Insights Generated", description: "Account analysis completed." });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Analyzing Account Strategic Data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] min-h-screen">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/financials/${id}`)}
            className="gap-2 text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Account
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Account Strategic Insights</h1>
          </div>
        </div>

        {!parsedInsights ? (
          <Card className="py-20 text-center border-dashed border-2 border-slate-200 bg-white/50">
            <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Insights Available</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">Trigger our AI agents to analyze this account and its projects.</p>
            <Button onClick={handleGenerateInsights} className="bg-blue-600 hover:bg-blue-700">Generate Insights</Button>
          </Card>
        ) : (
          <div className="space-y-8">
             <div className="flex justify-center">
                <Tabs defaultValue="summary" className="w-full">
                  <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-slate-100/80 p-1 shadow-sm border border-slate-200">
                      <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm font-semibold transition-all">Summary</TabsTrigger>
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm font-semibold transition-all">Strategy & Risks</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="summary" className="space-y-6 animate-in fade-in duration-500">
                    <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 shadow-sm">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-3 mb-4 text-lg">
                        <TrendingUp className="w-6 h-6" /> Executive Overview
                      </h4>
                      <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                        {parsedInsights.executive_summary || parsedInsights.summary || "No executive summary available."}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-blue-100 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-blue-50 bg-blue-50/30">
                          <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <Target className="w-4 h-4" /> KPIs & Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {parsedInsights.kpis && typeof parsedInsights.kpis === 'object' ? Object.entries(parsedInsights.kpis).map(([key, val]: any, i) => (
                              <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                                <span className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-xs font-bold text-slate-700">{val}</span>
                              </div>
                            )) : <p className="text-xs text-slate-400">No KPI data available.</p>}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-100 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-purple-50 bg-purple-50/30">
                          <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Opportunities
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="text-xs text-slate-600 space-y-3">
                            {Array.isArray(parsedInsights.opportunities) ? parsedInsights.opportunities.map((opt: any, i: number) => (
                              <li key={i} className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                {typeof opt === 'string' ? opt : (opt.text || opt.description || opt.opportunity || opt.recommendation || JSON.stringify(opt))}
                              </li>
                            )) : <li className="text-slate-400 italic">No specific opportunities.</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                        <ShieldAlert className="w-5 h-5 text-rose-500" /> Risk Assessment
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Array.isArray(parsedInsights.risks) ? parsedInsights.risks.map((risk: any, i: number) => (
                          <div key={i} className="p-4 bg-white border border-rose-100 rounded-xl shadow-sm flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                            <p className="text-sm text-slate-700">{typeof risk === 'string' ? risk : (risk.text || risk.description || risk.risk || risk.issue || JSON.stringify(risk))}</p>
                          </div>
                        )) : <p className="text-sm text-slate-500 italic">No risks identified.</p>}
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                        <Bot className="w-5 h-5 text-blue-500" /> Recommendations
                      </h4>
                      <div className="space-y-3">
                        {Array.isArray(parsedInsights.recommended_actions) ? parsedInsights.recommended_actions.map((action: any, i: number) => (
                          <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                              {typeof action === 'string' ? action : action.text || action.recommendation}
                            </p>
                          </div>
                        )) : <p className="text-sm text-slate-500 italic">No recommendations available.</p>}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
             </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FinancialAccountInsights;
