import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, Search, Brain, TrendingUp, Briefcase, MoreVertical, Loader2 } from 'lucide-react';
import { getFinanceAccountById } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FinanceTabProps {
  accountId: string;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ accountId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      try {
        const responseData = await getFinanceAccountById(accountId);
        setData(responseData);
      } catch (error) {
        console.error("Failed to fetch finance account data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Finance data not found for this account.
      </div>
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
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="shadow-sm border-gray-100 card-enterprise">
        <CardHeader className="pb-3 border-b bg-gray-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-500" />
            Customer Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 text-sm text-gray-700">
          {data.customer_overview || 'No customer overview available.'}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 card-enterprise flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.total_revenue)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 card-enterprise flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Revenue</span>
              <Brain className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(data.ai_revenue)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 card-enterprise flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Penetration</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{(data.ai_penetration_pct || 0).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 card-enterprise flex flex-col justify-center">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</span>
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{data.active_project_count} / {data.inactive_project_count}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{data.active_project_count} active, {data.inactive_project_count} inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="shadow-sm border-gray-100 card-enterprise">
        <CardHeader className="pb-3 border-b bg-gray-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-gray-500" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 text-sm text-gray-700">
          {data.ai_recommendations || 'No AI recommendations available.'}
        </CardContent>
      </Card>

      {/* Projects List section */}
      <div className="mt-8 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 pt-2">
          {displayedProjects.map((project: any) => (
            <Card key={project.id} className="shadow-sm border-gray-100 hover:shadow-md transition-all card-enterprise relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-12">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.overview || 'No overview available.'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 absolute top-6 right-6">
                    <Badge className={
                      project.status?.toLowerCase() === 'active'
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-none"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-none shadow-none"
                    }>
                      {project.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  <div className="absolute top-14 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-1">Total Revenue</span>
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(project.total_revenue)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-1">YTD Revenue</span>
                    <p className="font-bold text-blue-600 text-lg">{formatCurrency(project.ytd_revenue)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-1">AI Revenue</span>
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(project.total_ai_revenue)}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-medium text-gray-500 block mb-1">AI Penetration</span>
                      <p className="font-bold text-blue-600 text-lg">
                        {project.total_revenue > 0 ? ((project.total_ai_revenue / project.total_revenue) * 100).toFixed(1) : '0.0'}%
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Type</span>
                      <p className="font-bold text-gray-900 border border-gray-200 rounded px-2 py-0.5 bg-gray-50 text-xs">
                        {project.project_type || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-100">
              No projects found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
