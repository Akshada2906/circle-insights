import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RoadmapVersion } from '@/types/account';
import { History, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoadmapEditorProps {
    value: string | undefined;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
}

export const RoadmapEditor: React.FC<RoadmapEditorProps> = ({ value, onChange, label, placeholder }) => {
    const parseRoadmap = (data: string | undefined): RoadmapVersion[] => {
        if (!data) return [];
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0 && 'version' in parsed[0]) {
                return parsed.sort((a, b) => b.version - a.version);
            }
        } catch (e) {
            // Not JSON
        }
        return [{
            version: 1,
            content: data || '',
            date: new Date().toISOString(),
            label: 'Initial Version'
        }];
    };

    const [versions, setVersions] = useState<RoadmapVersion[]>(parseRoadmap(value));
    const [selectedVersionId, setSelectedVersionId] = useState<number>(versions.length > 0 ? versions[0].version : 1);
    const [isShowingHistory, setIsShowingHistory] = useState(false);

    const activeVersion = versions.find(v => v.version === selectedVersionId) || versions[0];
    const [currentText, setCurrentText] = useState(activeVersion?.content || '');

    // Sync with external value if needed
    useEffect(() => {
        const parsed = parseRoadmap(value);
        setVersions(parsed);
        const active = parsed.find(v => v.version === selectedVersionId) || parsed[0];
        if (active) {
            setCurrentText(active.content);
        }
    }, [value]);

    const handleTextChange = (text: string) => {
        setCurrentText(text);
        const newVersions = [...versions];
        const idx = newVersions.findIndex(v => v.version === selectedVersionId);
        
        if (idx !== -1) {
            newVersions[idx] = {
                ...newVersions[idx],
                content: text,
                date: new Date().toISOString()
            };
        } else if (newVersions.length === 0) {
            newVersions.push({
                version: 1,
                content: text,
                date: new Date().toISOString()
            });
            setSelectedVersionId(1);
        }
        onChange(JSON.stringify(newVersions));
    };

    const handleVersionChange = (versionId: number) => {
        const v = versions.find(v => v.version === versionId);
        if (v) {
            setSelectedVersionId(versionId);
            setCurrentText(v.content);
        }
    };

    const createNewVersion = () => {
        const maxVersion = versions.reduce((max, v) => Math.max(max, v.version), 0);
        const nextVersion = maxVersion + 1;
        const newVersion: RoadmapVersion = {
            version: nextVersion,
            content: versions.length > 0 ? versions[0].content : '', // Start with latest text as base
            date: new Date().toISOString(),
            label: `Version ${nextVersion}`
        };
        const newVersions = [newVersion, ...versions];
        setVersions(newVersions);
        setSelectedVersionId(nextVersion);
        setCurrentText(newVersion.content);
        onChange(JSON.stringify(newVersions));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-900">{label}</Label>
                <div className="flex items-center gap-2">
                    {versions.length > 1 && (
                        <select 
                            className="h-7 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded px-2 focus:ring-0 focus:outline-none"
                            value={selectedVersionId}
                            onChange={(e) => handleVersionChange(Number(e.target.value))}
                        >
                            {versions.map(v => (
                                <option key={v.version} value={v.version}>
                                    Editing Version {v.version}
                                </option>
                            ))}
                        </select>
                    )}
                    {versions.length === 1 && (
                         <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100 uppercase">
                            Version {versions[0].version}
                        </Badge>
                    )}
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={createNewVersion}
                        className="h-7 text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
                    >
                        <Plus className="w-3 h-3" />
                        Create New Version
                    </Button>
                </div>
            </div>

            <Textarea
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={6}
                placeholder={placeholder}
                className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-100 transition-all resize-none shadow-sm font-sans"
            />
            
            {versions.length > 1 && (
                <div className="flex items-center gap-1.5 px-1">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        {versions.length - 1} Previous Version{(versions.length - 1) !== 1 ? 's' : ''} available in history
                    </span>
                </div>
            )}
        </div>
    );
};
