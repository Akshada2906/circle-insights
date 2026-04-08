import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Pencil, Plus, DollarSign, Search, 
  Brain, TrendingUp, Briefcase, MoreVertical, Loader2, Building2, Target
} from 'lucide-react';
import { 
  getFinanceAccountById, 
  deleteFinanceProject 
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FinancialAccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchFinanceData = async () => {
        setLoading(true);
        try {
          const responseData = await getFinanceAccountById(id);
          setData(responseData);
        } catch (error) {
          console.error("Failed to fetch finance account data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFinanceData();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-2">Account not found</h2>
            <p className="text-muted-foreground mb-6">
              The financial account data you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/financials')}>Back to Financials</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const projects = data.projects || [];
  const sortedProjects = [...projects].sort((a: any, b: any) => (b.total_revenue || 0) - (a.total_revenue || 0));

  const filteredProjects = sortedProjects.filter((p: any) => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.overview || '').toLowerCase().includes(search.toLowerCase())
  );

  const displayedProjects = (showAllProjects || search !== '') 
    ? filteredProjects 
    : filteredProjects.slice(0, 10);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header section matching Updated-AI-Insight UI */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/financials')} className="mt-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                {data.name}
              </h1>
              {data.delivery_unit?.name && (
                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                  {data.delivery_unit.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/financials/${data.id}/edit`)} className="gap-2 bg-white">
              <Pencil className="w-4 h-4" />
              Edit Account
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => navigate(`/financials/${data.id}/projects/new`)}>
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Overview & AI Recommendations */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100 pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-950">
                <Target className="w-5 h-5 text-emerald-600" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 bg-white">
               <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/30 border border-emerald-100/50">
                   <span className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-wider">Current Revenue</span>
                   <p className="text-lg font-bold text-emerald-900">{formatCurrency(data.current_revenue || data.total_revenue || 0)}</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-blue-50/30 border border-blue-100/50">
                   <span className="text-[11px] font-bold text-blue-700/80 uppercase tracking-wider">Target Revenue</span>
                   <p className="text-lg font-bold text-blue-900">{formatCurrency(data.target_revenue || 0)}</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-indigo-50/30 border border-indigo-100/50">
                   <span className="text-[11px] font-bold text-indigo-700/80 uppercase tracking-wider">Forecast Revenue</span>
                   <p className="text-lg font-bold text-indigo-900">{formatCurrency(data.forecast_revenue || 0)}</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-red-50/30 border border-red-100/50">
                   <span className="text-[11px] font-bold text-red-700/80 uppercase tracking-wider">Shortfall</span>
                   <p className="text-lg font-bold text-red-900">{formatCurrency(data.shortfall ?? ((data.target_revenue || 0) - (data.current_revenue || data.total_revenue || 0) - (data.forecast_revenue || 0)))}</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100">
                   <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Revenue</span>
                   <p className="text-lg font-semibold text-foreground">{formatCurrency(data.ai_revenue)}</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100">
                   <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Penetration</span>
                   <p className="text-lg font-semibold text-foreground">{(data.ai_penetration_pct || 0).toFixed(1)}%</p>
               </div>
               <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-100 md:col-span-2 lg:col-span-2">
                   <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Projects (Active / Inactive)</span>
                   <p className="text-lg font-semibold text-foreground">{data.active_project_count} / {data.inactive_project_count}</p>
               </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100 pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-950">
                <Building2 className="w-5 h-5 text-blue-600" />
                Customer Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-6 text-sm text-foreground bg-slate-50 border border-slate-100 rounded-lg m-4 min-h-[120px]">
              {data.customer_overview || 'No customer overview available.'}
            </CardContent>
          </Card>
        </div>

        <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100 pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-950">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-6 text-sm text-foreground bg-slate-50 border border-slate-100 rounded-lg m-4 min-h-[100px]">
            {data.ai_recommendations || 'No AI recommendations available.'}
          </CardContent>
        </Card>

        {/* Projects List section */}
        <div className="pt-4 space-y-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Projects ({data.active_project_count} active / {data.inactive_project_count} inactive)
            </h2>
            <div className="flex items-center gap-3">
              {filteredProjects.length > 10 && search === "" && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="h-10 px-4 font-semibold border-slate-200 hover:border-blue-300 hover:bg-white text-blue-600 transition-all whitespace-nowrap shadow-sm"
                >
                  {showAllProjects ? "Show Top 10" : `View All Projects (${filteredProjects.length})`}
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[250px] shadow-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
            {displayedProjects.map((project: any) => (
              <Card
                key={project.id}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300 border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-50/30"
                onClick={() => navigate(`/financials/${data.id}/projects/${project.id}`)}
              >
                  <CardHeader className="p-4 pb-3 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-100/50 rounded-lg shrink-0 text-blue-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                <h3 className="font-bold truncate text-base text-blue-950" title={project.name}>{project.name}</h3>
                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 py-0 font-bold tracking-wider uppercase border-none ${project.status?.toLowerCase() === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                    {project.status?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => { e.stopPropagation(); }}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-blue-100/50 text-blue-900/40 hover:text-blue-900">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/financials/${data.id}/projects/${project.id}/edit`)}>
                                    Edit Project
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                      Delete Project
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this project? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await deleteFinanceProject(project.id);
                                              const responseData = await getFinanceAccountById(data.id);
                                              setData(responseData);
                                            } catch (err) {
                                              console.error('Failed to delete project', err);
                                            }
                                        }}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Rev</span>
                          <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(project.total_revenue)}</p>
                      </div>
                      <div className="space-y-1">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">YTD Rev</span>
                          <p className="text-sm font-bold text-blue-600 truncate">{formatCurrency(project.ytd_revenue)}</p>
                      </div>
                      <div className="space-y-1">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">AI Rev</span>
                          <p className="text-sm font-bold text-emerald-600 truncate">
                            {formatCurrency((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0) || project.total_ai_revenue)}
                          </p>
                      </div>
                      <div className="space-y-1">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">AI Pen.</span>
                          <p className="text-sm font-bold text-slate-900 truncate">
                              {((project.ai_penetration || project.ai_penetration_pct || (project.total_revenue > 0 ? (((project.ai_revenue || 0) + (project.ai_assisted_revenue || 0)) / project.total_revenue) * 100 : 0)) || 0).toFixed(1)}%
                          </p>
                      </div>
                      <div className="space-y-1 col-span-2">
                          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Type</span>
                          <p className="text-sm font-bold text-slate-700 truncate">{project.project_type || 'T&M'}</p>
                      </div>
                  </CardContent>
              </Card>
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm">
                No projects found matching your search.
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default FinancialAccountDetails;
