import { useState } from 'react';
import { Project } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { circles } from '@/constants';

interface ProjectFormProps {
    project?: Project;
    accountId: string;
    onSubmit: (project: Partial<Project>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ProjectForm({ project, accountId, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
    const [formData, setFormData] = useState<Partial<Project>>({
        project_name: project?.project_name || '',
        project_manager: project?.project_manager || '',
        project_summary: project?.project_summary || '',
        tech_stack: project?.tech_stack || [],
        circle: project?.circle || undefined,
        connected_with: project?.connected_with || '',
        competitor_name: project?.competitor_name || '',
        competitive_risk: project?.competitive_risk || '',
    });

    const [techInput, setTechInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.project_name?.trim()) {
            newErrors.project_name = 'Project name is required';
        }

        if (!formData.project_manager?.trim()) {
            newErrors.project_manager = 'Project manager is required';
        }

        if (!formData.project_summary?.trim()) {
            newErrors.project_summary = 'Project summary is required';
        }

        if (!formData.tech_stack || formData.tech_stack.length === 0) {
            newErrors.tech_stack = 'At least one technology is required';
        }

        if (!formData.circle) {
            newErrors.circle = 'Circle is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submissionData: Partial<Project> = {
            ...formData,
            account_id: accountId,
            status: project?.status || 'ACTIVE',
            updated_at: new Date().toISOString(),
        };

        if (!project) {
            submissionData.project_id = `proj-${Date.now()}`;
            submissionData.created_at = new Date().toISOString();
        }

        onSubmit(submissionData);
    };

    const handleAddTech = () => {
        if (techInput.trim() && !formData.tech_stack?.includes(techInput.trim())) {
            setFormData({
                ...formData,
                tech_stack: [...(formData.tech_stack || []), techInput.trim()],
            });
            setTechInput('');
        }
    };

    const handleRemoveTech = (tech: string) => {
        setFormData({
            ...formData,
            tech_stack: formData.tech_stack?.filter((t) => t !== tech) || [],
        });
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTech();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-lg">📁</span>
                        Project Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label htmlFor="project_name">
                            Project Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="project_name"
                            placeholder="Enter project name"
                            value={formData.project_name}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                            className={errors.project_name ? 'border-destructive' : ''}
                        />
                        {errors.project_name && (
                            <p className="text-sm text-destructive">{errors.project_name}</p>
                        )}
                    </div>

                    {/* Project Manager */}
                    <div className="space-y-2">
                        <Label htmlFor="project_manager">
                            Project Manager <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="project_manager"
                            placeholder="Enter project manager name"
                            value={formData.project_manager}
                            onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                            className={errors.project_manager ? 'border-destructive' : ''}
                        />
                        {errors.project_manager && (
                            <p className="text-sm text-destructive">{errors.project_manager}</p>
                        )}
                    </div>

                    {/* Project Summary */}
                    <div className="space-y-2">
                        <Label htmlFor="project_summary">
                            Project Summary <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="project_summary"
                            placeholder="Provide an overview of the customer and their business"
                            rows={4}
                            value={formData.project_summary}
                            onChange={(e) => setFormData({ ...formData, project_summary: e.target.value })}
                            className={errors.project_summary ? 'border-destructive' : ''}
                        />
                        {errors.project_summary && (
                            <p className="text-sm text-destructive">{errors.project_summary}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Optional: Describe the customer's business, industry, and key characteristics
                        </p>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-2">
                        <Label htmlFor="tech_stack">
                            Tech Stack <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="tech_stack"
                                placeholder="Add technology (e.g., React, Python)"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={handleTechKeyDown}
                                className={errors.tech_stack ? 'border-destructive' : ''}
                            />
                            <Button type="button" onClick={handleAddTech} variant="outline">
                                Add
                            </Button>
                        </div>
                        {formData.tech_stack && formData.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tech_stack.map((tech, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTech(tech)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {errors.tech_stack && (
                            <p className="text-sm text-destructive">{errors.tech_stack}</p>
                        )}
                    </div>

                    {/* Circle */}
                    <div className="space-y-2">
                        <Label htmlFor="circle">
                            Circle <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.circle}
                            onValueChange={(value) => setFormData({ ...formData, circle: value as any })}
                        >
                            <SelectTrigger className={errors.circle ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select circle" />
                            </SelectTrigger>
                            <SelectContent>
                                {circles.map((circle) => (
                                    <SelectItem key={circle} value={circle}>
                                        {circle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.circle && (
                            <p className="text-sm text-destructive">{errors.circle}</p>
                        )}
                    </div>

                    {/* Connected With */}
                    <div className="space-y-2">
                        <Label htmlFor="connected_with">
                            Connected With
                        </Label>
                        <Input
                            id="connected_with"
                            placeholder="Enter connected entities or partners"
                            value={formData.connected_with}
                            onChange={(e) => setFormData({ ...formData, connected_with: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional: Connected entities, partners, or stakeholders
                        </p>
                    </div>

                    {/* Competitor Name */}
                    <div className="space-y-2">
                        <Label htmlFor="competitor_name">
                            Competitor Name
                        </Label>
                        <Input
                            id="competitor_name"
                            placeholder="Enter competitor name"
                            value={formData.competitor_name}
                            onChange={(e) => setFormData({ ...formData, competitor_name: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional: Name of competing organization or solution
                        </p>
                    </div>

                    {/* Competitive Risk */}
                    <div className="space-y-2">
                        <Label htmlFor="competitive_risk">
                            Competitive Risk
                        </Label>
                        <Textarea
                            id="competitive_risk"
                            placeholder="Describe competitive risks and mitigation strategies"
                            rows={4}
                            value={formData.competitive_risk}
                            onChange={(e) => setFormData({ ...formData, competitive_risk: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional: Analysis of competitive risks and mitigation strategies
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}
