import { Project } from '@/types/account';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Briefcase, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
    project: Project;
    onEdit?: (projectId: string) => void;
    onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(project.project_id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(project.project_id);
        }
    };

    const getCircleColor = (circle: string) => {
        const colors: Record<string, string> = {
            Cloud: 'bg-blue-500 hover:bg-blue-600',
            Data: 'bg-purple-500 hover:bg-purple-600',
            AI: 'bg-green-500 hover:bg-green-600',
            Security: 'bg-red-500 hover:bg-red-600',
            DevOps: 'bg-orange-500 hover:bg-orange-600',
        };
        return colors[circle] || 'bg-gray-500';
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-200 border-border hover:border-primary/50">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-foreground truncate">{project.project_name}</h3>
                                <Badge
                                    variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                                    className={cn(
                                        'shrink-0',
                                        project.status === 'ACTIVE'
                                            ? 'bg-blue-500 hover:bg-blue-600'
                                            : 'bg-gray-400 hover:bg-gray-500'
                                    )}
                                >
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Leader: <span className="font-medium text-foreground">{project.project_manager}</span>
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Project Summary */}
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Summary</span>
                    <p className="text-sm text-foreground line-clamp-2">{project.project_summary}</p>
                </div>

                {/* Tech Stack */}
                <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, 4).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                            </Badge>
                        ))}
                        {project.tech_stack.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{project.tech_stack.length - 4}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Circle Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Circle</span>
                    <Badge className={cn('text-xs', getCircleColor(project.circle))}>
                        {project.circle}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
