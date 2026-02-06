import { useState } from 'react';
import { Project } from '@/types/account';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase } from 'lucide-react';
import { circles } from '@/constants';

interface ProjectsListProps {
    projects: Project[];
    onAddProject: () => void;
    onEdit?: (projectId: string) => void;
    onDelete?: (projectId: string) => void;
}

export function ProjectsList({ projects, onAddProject, onEdit, onDelete }: ProjectsListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCircle, setFilterCircle] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.project_manager.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCircle = filterCircle === 'all' || project.circle === filterCircle;

        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

        return matchesSearch && matchesCircle && matchesStatus;
    });

    const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
    const inactiveCount = projects.filter((p) => p.status === 'INACTIVE').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Projects ({activeCount} active / {inactiveCount} inactive)
                    </h2>
                </div>
                <Button onClick={onAddProject} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Project
                </Button>
            </div>

            {projects.length > 0 && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterCircle} onValueChange={setFilterCircle}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Circle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Circles</SelectItem>
                                {circles.map((circle) => (
                                    <SelectItem key={circle} value={circle}>
                                        {circle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Projects Grid */}
                    {filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.project_id}
                                    project={project}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                No projects match your search criteria
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Briefcase className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        Get started by creating your first project for this account.
                    </p>
                    <Button onClick={onAddProject} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create First Project
                    </Button>
                </div>
            )}
        </div>
    );
}
