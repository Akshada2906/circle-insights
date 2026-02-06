import { Stakeholder } from '@/types/account';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StakeholderCardProps {
    stakeholder: Stakeholder;
    onEdit?: (stakeholderId: string) => void;
    onDelete?: (stakeholderId: string) => void;
}

const categoryColors: Record<string, string> = {
    Resources: 'bg-blue-100 text-blue-700 border-blue-300',
    Technology: 'bg-purple-100 text-purple-700 border-purple-300',
    Engineering: 'bg-green-100 text-green-700 border-green-300',
    Business: 'bg-orange-100 text-orange-700 border-orange-300',
};

export function StakeholderCard({ stakeholder, onEdit, onDelete }: StakeholderCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header with Name and Champion Badge */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">
                                    {stakeholder.name}
                                </h3>
                                {stakeholder.is_champion && (
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 gap-1">
                                        <Award className="w-3 h-3" />
                                        Champion
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{stakeholder.designation}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
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
                    </div>

                    {/* Department */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Department</p>
                        <Badge variant="outline" className="text-xs">
                            {stakeholder.department}
                        </Badge>
                    </div>

                    {/* Project */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Project</p>
                        <p className="text-sm font-medium text-foreground">
                            {stakeholder.project_name}
                        </p>
                    </div>

                    {/* Value Chain Category */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Value Chain</p>
                        <Badge className={cn('border', categoryColors[stakeholder.value_chain_category])}>
                            {stakeholder.value_chain_category}
                        </Badge>
                    </div>

                    {/* Relationship Score */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Relationship Score</span>
                        <div className="flex items-center gap-1">
                            <Star className={cn('w-4 h-4', getScoreColor(stakeholder.relationship_score))} />
                            <span className={cn('font-semibold text-sm', getScoreColor(stakeholder.relationship_score))}>
                                {stakeholder.relationship_score}/10
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
