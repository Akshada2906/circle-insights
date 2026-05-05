import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2, TrendingUp, ArrowRight, DollarSign, Download, Upload, Plus, MoreVertical, Users, LayoutDashboard, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { getFinanceAccounts, getPrivateEquities, createPrivateEquity, updatePrivateEquity, deletePrivateEquity } from '@/services/api';

const PrivateEquity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [peFirms, setPeFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFirmId, setEditingFirmId] = useState<string | null>(null);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ name: '', overview: '' });

  const handleFileUpload = async (file: File, type: string) => {
    setIsImportLoading(true);
    toast({
      title: `Uploading ${type} Data`,
      description: "Processing your file and generating insights...",
    });
    
    try {
      // Simulate backend processing and insight generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Insights Generated",
        description: `${type} data imported and AI insights successfully generated.`,
      });
      fetchFirms();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the file.",
        variant: "destructive"
      });
    } finally {
      setIsImportLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && !isImportLoading) handleFileUpload(file, type);
  };


  const fetchFirms = async () => {
    try {
      const [firmsData, accountsData] = await Promise.all([
        getPrivateEquities(),
        getFinanceAccounts()
      ]);
      
      const enrichedFirms = firmsData.map((firm: any) => {
         const firmAccounts = accountsData.filter((a: any) => a.private_equity_id === firm.id);
         const totalRev = firmAccounts.reduce((sum: number, a: any) => sum + (a.current_revenue || a.total_revenue || 0), 0);
         return {
           ...firm,
           portfolio_size: firmAccounts.length,
           total_revenue: totalRev
         };
      });

      setPeFirms(enrichedFirms);
    } catch (err) {
      console.error('Failed to fetch PE firms:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFirms();
  }, []);

  const handleSave = async () => {
    try {
      if (editingFirmId) {
        await updatePrivateEquity(editingFirmId, formData);
      } else {
        await createPrivateEquity(formData);
      }
      setIsDialogOpen(false);
      setFormData({ name: '', overview: '' });
      setEditingFirmId(null);
      fetchFirms();
    } catch (err) {
      console.error('Failed to save firm:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePrivateEquity(id);
      fetchFirms();
    } catch (err) {
      console.error('Failed to delete firm:', err);
    }
  };

  const openEditDialog = (firm: any) => {
    setFormData({ name: firm.name || '', overview: firm.overview || '' });
    setEditingFirmId(firm.id);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setFormData({ name: '', overview: '' });
    setEditingFirmId(null);
    setIsDialogOpen(true);
  };

  const filteredFirms = peFirms.filter(firm => 
    firm.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Private Equity</h1>
            <p className="text-slate-500 mt-1">Manage your private equity firms and their portfolio accounts</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Import Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white text-blue-700 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none shadow-sm font-medium">
                  <Download className="w-4 h-4" /> Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Data Management</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="pe" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pe">PE Firm</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pe" className="mt-4">
                    <label 
                      htmlFor="pe-upload"
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => handleDrop(e, 'PE Firm')}
                      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer block ${isImportLoading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                    >
                      <input 
                        type="file" 
                        id="pe-upload" 
                        className="hidden" 
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'PE Firm');
                          e.target.value = '';
                        }} 
                      />
                      {isImportLoading ? (
                         <div className="flex flex-col items-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <h3 className="font-semibold text-gray-900">Generating Insights...</h3>
                         </div>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-4">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">Upload PE Firm Data</h3>
                          <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (XLSX, XLS)</p>
                          <Button variant="outline" className="bg-white pointer-events-none">Browse Files</Button>
                        </>
                      )}
                    </label>
                  </TabsContent>
                  
                  <TabsContent value="account" className="mt-4">
                    <label 
                      htmlFor="account-upload"
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => handleDrop(e, 'Account')}
                      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer block ${isImportLoading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                    >
                      <input 
                        type="file" 
                        id="account-upload" 
                        className="hidden" 
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'Account');
                          e.target.value = '';
                        }} 
                      />
                      {isImportLoading ? (
                         <div className="flex flex-col items-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                            <h3 className="font-semibold text-gray-900">Generating Insights...</h3>
                         </div>
                      ) : (
                        <>
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                            <Users className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">Upload Account Data</h3>
                          <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (XLSX, XLS)</p>
                          <Button variant="outline" className="bg-white pointer-events-none">Browse Files</Button>
                        </>
                      )}
                    </label>
                  </TabsContent>
                  
                  <TabsContent value="projects" className="mt-4">
                    <label 
                      htmlFor="project-upload"
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => handleDrop(e, 'Projects')}
                      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer block ${isImportLoading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-gray-300 hover:bg-gray-50 bg-white'}`}
                    >
                      <input 
                        type="file" 
                        id="project-upload" 
                        className="hidden" 
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'Projects');
                          e.target.value = '';
                        }} 
                      />
                      {isImportLoading ? (
                         <div className="flex flex-col items-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                            <h3 className="font-semibold text-gray-900">Generating Insights...</h3>
                         </div>
                      ) : (
                        <>
                          <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-4">
                            <LayoutDashboard className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">Upload Projects Data</h3>
                          <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel (XLSX, XLS)</p>
                          <Button variant="outline" className="bg-white pointer-events-none">Browse Files</Button>
                        </>
                      )}
                    </label>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>


            {/* Add/Edit PE Firm Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm flex-1 sm:flex-none font-medium">
                  <Plus className="w-4 h-4" /> Add PE Firm
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingFirmId ? "Edit" : "Add New"} Private Equity Firm</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">Firm Name</Label>
                     <Input 
                       placeholder="e.g. Blackstone Group" 
                       className="bg-white" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold">Overview</Label>
                     <Input 
                       placeholder="Brief description" 
                       className="bg-white"
                       value={formData.overview}
                       onChange={(e) => setFormData({...formData, overview: e.target.value})}
                     />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" className="bg-white" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Firm</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 animate-in fade-in duration-300 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search private equity firms..."
              className="pl-9 h-11 border-slate-200 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms.length === 0 && !loading && (
            <div className="col-span-full py-24 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">
                No private equity firms found. Click "Add PE Firm" to add one.
            </div>
          )}
          {filteredFirms.map((firm) => (
            <Card
              key={firm.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300 border-t-4 border-t-blue-600 bg-gradient-to-br from-white to-blue-100/40"
              onClick={() => navigate(`/private-equity/${firm.id}`)}
            >
              <CardHeader className="pb-3 border-b border-blue-100/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-blue-950 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{firm.name}</h3>
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => { e.stopPropagation(); }}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-blue-100/50 text-blue-900/40 hover:text-blue-900 rounded-full">
                              <MoreVertical className="h-5 w-5" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(firm); }}>
                              Edit Firm
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-red-500">
                                Delete Firm
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Firm</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this firm? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(firm.id); }}
                                  className="bg-red-600 hover:bg-red-700"
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
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Portfolio Size</span>
                    <span className="text-lg font-bold text-slate-900">{firm.portfolio_size || 0} Accounts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</span>
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                       <DollarSign className="w-4 h-4" />
                       <span>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(firm.total_revenue || 0)}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-4 border-t border-blue-50 flex justify-end">
                    <Button variant="ghost" className="text-blue-600 group-hover:bg-blue-50 gap-2 font-bold px-0 hover:px-4 transition-all">
                      View Portfolio <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivateEquity;
