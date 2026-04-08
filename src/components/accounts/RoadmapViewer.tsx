import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoadmapVersion } from '@/types/account';
import { Calendar, History, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapViewerProps {
    content: string | undefined;
    title: string;
    icon: LucideIcon;
    colorClassName?: string;
    headerClassName?: string;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({ 
    content, 
    title, 
    icon: Icon, 
    colorClassName = "text-emerald-600",
    headerClassName = "bg-gradient-to-r from-emerald-50/50 to-transparent border-b border-emerald-100"
}) => {
    const parseRoadmap = (data: string | undefined): RoadmapVersion[] => {
        if (!data) return [];
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0 && 'version' in parsed[0]) {
                return parsed.sort((a, b) => b.version - a.version); // Show newest first in list
            }
        } catch (e) {
            // Not JSON or legacy format
        }
        return [{
            version: 1,
            content: data,
            date: new Date().toISOString(),
            label: 'Initial Version'
        }];
    };

    const versions = parseRoadmap(content);
    const [selectedVersion, setSelectedVersion] = useState<number>(versions.length > 0 ? versions[0].version : 1);

    const activeVersion = versions.find(v => v.version === selectedVersion) || versions[0];

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (!content) {
        return (
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center justify-between">
                    {title}
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[200px] flex items-center justify-center text-slate-400 text-sm">
                    No {title.toLowerCase()} defined.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center justify-between">
                <span>{title}</span>
                {versions.length > 1 && (
                    <div className="flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <select 
                            className="text-[11px] bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-slate-500 hover:text-blue-600"
                            value={selectedVersion}
                            onChange={(e) => setSelectedVersion(Number(e.target.value))}
                        >
                            {versions.map(v => (
                                <option key={v.version} value={v.version}>
                                    Version {v.version} ({formatDate(v.date)})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </h3>
            
            <div className="relative group">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 min-h-[200px] whitespace-pre-wrap whitespace-break-spaces text-sm leading-relaxed text-slate-700 shadow-inner">
                    {activeVersion?.content}
                </div>
                
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm text-[10px] font-bold px-1.5 py-0 border-slate-200">
                        V{activeVersion?.version}
                    </Badge>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded border border-slate-100/50">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(activeVersion?.date || '')}
                    </div>
                </div>
            </div>
        </div>
    );
};
