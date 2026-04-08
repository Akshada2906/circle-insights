import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getPmoFiles,
  getRevenueFiles,
  uploadImportProjectFile,
  uploadImportRevenueFile,
  exportAllProjectsAPI,
  exportAllRevenuesAPI
} from '@/services/api';

type DataType = 'pmo' | 'revenue';

interface FileData {
  file_name: string;
  file_type: string;
  file_size: string;
  upload_date: string;
  download_url: string;
}

const ImportFinanceData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DataType>('pmo');
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pmo') {
        const data = await getPmoFiles();
        setFiles(data.files || []);
      } else {
        const data = await getRevenueFiles();
        setFiles(data.files || []);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching files",
        description: error.message || "Failed to fetch document list",
        variant: "destructive",
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      if (activeTab === 'pmo') {
        await uploadImportProjectFile(file);
        toast({
          title: "PMO Document Uploaded",
          description: "The PMO document has been successfully imported."
        });
      } else {
        await uploadImportRevenueFile(file);
        toast({
          title: "Revenue Document Uploaded",
          description: "The Revenue document has been successfully imported."
        });
      }
      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during file upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    try {
      if (activeTab === 'pmo') {
        const data = await exportAllProjectsAPI();
        toast({
          title: "Export Successful",
          description: "PMO data exported successfully."
        });
        console.log("PMO Export Data:", data);
      } else {
        const data = await exportAllRevenuesAPI();
        toast({
          title: "Export Successful",
          description: "Revenue data exported successfully."
        });
        console.log("Revenue Export Data:", data);
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/financials')} className="rounded-full shadow-sm bg-white hover:bg-gray-100 p-2">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Custom Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-sm border border-gray-200 gap-1">
            <button
              onClick={() => setActiveTab('pmo')}
              className={`px-12 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pmo' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              PMO Data
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-12 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'revenue' ? 'bg-blue-600 text-white shadow-md bg-white' : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              Revenue Data
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">
              {activeTab === 'pmo' ? 'PMO Document Summary' : 'Revenue Document Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty space for summary */}
          </CardContent>
        </Card>

        {/* Uploaded Documents List */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Uploaded {activeTab === 'pmo' ? 'PMO' : 'Revenue'} Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your uploaded files ({files.length} total)
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleExport} className="h-9 px-4 gap-2 flex items-center shadow-sm">
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={handleUploadClick} disabled={uploading} className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 px-4 rounded-md">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No {activeTab.toUpperCase()} documents uploaded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{file.upload_date} • {file.file_size}</p>
                      </div>
                    </div>
                    {file.download_url && (
                      <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:8000'}${file.download_url}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors p-2">
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
        
      </div>
    </MainLayout>
  );
};

export default ImportFinanceData;
