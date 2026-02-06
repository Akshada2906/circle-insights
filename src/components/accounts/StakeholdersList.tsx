import { useState } from 'react';
import { Stakeholder, Project } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Users, Star, Award, Pencil, Trash2 } from 'lucide-react';
import { valueChainCategories } from '@/constants';
import { cn } from '@/lib/utils';

interface StakeholdersListProps {
    stakeholders: Stakeholder[];
    projects?: Project[];
    onAddStakeholder: () => void;
    onEdit?: (stakeholderId: string) => void;
    onDelete?: (stakeholderId: string) => void;
}

const categoryColors: Record<string, string> = {
    Resources: 'bg-blue-100 text-blue-700 border-blue-300',
    Technology: 'bg-purple-100 text-purple-700 border-purple-300',
    Engineering: 'bg-green-100 text-green-700 border-green-300',
    Business: 'bg-orange-100 text-orange-700 border-orange-300',
};

export function StakeholdersList({ stakeholders, projects = [], onAddStakeholder, onEdit, onDelete }: StakeholdersListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterChampion, setFilterChampion] = useState<string>('all');

    const filteredStakeholders = stakeholders.filter((stakeholder) => {
        const matchesSearch =
            stakeholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stakeholder.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stakeholder.project_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'all' || stakeholder.value_chain_category === filterCategory;

        const matchesChampion =
            filterChampion === 'all' ||
            (filterChampion === 'champion' && stakeholder.is_champion) ||
            (filterChampion === 'non-champion' && !stakeholder.is_champion);

        return matchesSearch && matchesCategory && matchesChampion;
    });

    const championCount = stakeholders.filter((s) => s.is_champion).length;

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStakeholderConnections = (stakeholder: Stakeholder) => {
        const directConnections = stakeholder.connections || [];
        const project = projects.find(p => p.project_id === stakeholder.project_id);
        const projectConnections = project?.connected_with
            ? project.connected_with.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        // Combine and dedup
        return Array.from(new Set([...directConnections, ...projectConnections]));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Stakeholders ({championCount} champions)
                    </h2>
                </div>
                <Button onClick={onAddStakeholder} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Stakeholder
                </Button>
            </div>

            {stakeholders.length > 0 && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search stakeholders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Value Chain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {valueChainCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterChampion} onValueChange={setFilterChampion}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Champion Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stakeholders</SelectItem>
                                <SelectItem value="champion">Champions Only</SelectItem>
                                <SelectItem value="non-champion">Non-Champions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stakeholders Table */}
                    {filteredStakeholders.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Name / Designation
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Project Name
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Connections
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Value Chain
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Champion
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card">
                                        {filteredStakeholders.map((stakeholder) => {
                                            const connections = getStakeholderConnections(stakeholder);
                                            return (
                                                <tr
                                                    key={stakeholder.stakeholder_id}
                                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div>
                                                            <p className="font-medium text-foreground">{stakeholder.name}</p>
                                                            <p className="text-sm text-muted-foreground">{stakeholder.designation}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge variant="outline" className="text-xs">
                                                            {stakeholder.department}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <p className="text-sm text-foreground">{stakeholder.project_name}</p>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {connections.map((connection, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs bg-muted/50">
                                                                    {connection}
                                                                </Badge>
                                                            ))}
                                                            {connections.length === 0 && (
                                                                <span className="text-xs text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Star className={cn('w-4 h-4', getScoreColor(stakeholder.relationship_score))} />
                                                            <span className={cn('font-semibold', getScoreColor(stakeholder.relationship_score))}>
                                                                {stakeholder.relationship_score}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge className={cn('border', categoryColors[stakeholder.value_chain_category])}>
                                                            {stakeholder.value_chain_category}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {stakeholder.is_champion && (
                                                                <Award className="w-4 h-4 text-yellow-600" />
                                                            )}
                                                            <Switch checked={stakeholder.is_champion} disabled />
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {onEdit && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onEdit(stakeholder.stakeholder_id)}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {onDelete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onDelete(stakeholder.stakeholder_id)}
                                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                No stakeholders match your search criteria
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {stakeholders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Users className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No stakeholders yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        Get started by adding your first stakeholder for this account.
                    </p>
                    <Button onClick={onAddStakeholder} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add First Stakeholder
                    </Button>
                </div>
            )}
        </div>
    );
}
